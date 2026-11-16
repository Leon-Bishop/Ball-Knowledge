
/*
 * Ball Knowledge leaderboard API
 * Cloudflare Worker + D1
 *
 * Public beta: results are checked for consistency,
 * but server-issued challenges are needed for
 * stronger anti-cheat protection.
 */

const LEAGUES = Object.freeze({
  "england-premier-league": { count: 20, multiplier: 1.00 },
  "spain-la-liga": { count: 20, multiplier: 1.00 },
  "italy-serie-a": { count: 20, multiplier: 1.00 },
  "germany-bundesliga": { count: 18, multiplier: 1.00 },
  "france-ligue-1": { count: 18, multiplier: 1.00 },
  "turkey-super-lig": { count: 18, multiplier: 1.00 },
  "portugal-liga-portugal": { count: 18, multiplier: 1.05 },
  "netherlands-eredivisie": { count: 18, multiplier: 1.05 },
  "belgian-pro-league": { count: 18, multiplier: 1.05 },
  "brazil-serie-a": { count: 20, multiplier: 1.08 },
  "scotland-premiership": { count: 12, multiplier: 1.10 },
  "greece-super-league": { count: 14, multiplier: 1.15 }
});

const BASE_POINTS = Object.freeze({
  short: 500,
  medium: 1150,
  long: 1750
});

function json(value, status = 200, extra = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra
    }
  });
}

function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim());

  if (!allowed.includes(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
}

const normal = value =>
  String(value || "").normalize("NFC").trim();

function validName(name) {
  return (
    [...name].length >= 3 &&
    [...name].length <= 20 &&
    /^[\p{L}\p{N}_]+$/u.test(name)
  );
}

const countryOf = request =>
  /^[A-Z]{2}$/.test(request.cf?.country || "")
    ? request.cf.country
    : "ZZ";

const regionOf = request =>
  String(request.cf?.regionCode || "")
    .replace(/[^A-Za-z0-9-]/g, "")
    .slice(0, 16);

async function hash(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function authToken(request) {
  const header = request.headers.get("Authorization") || "";
  return /^Bearer ([a-f0-9]{64})$/.exec(header)?.[1] || "";
}

async function readBody(request) {
  const limit = 32768;
  const length = Number(request.headers.get("content-length") || 0);

  if (length > limit) {
    throw new Error("Payload too large");
  }

  const raw = await request.text();

  if (new TextEncoder().encode(raw).length > limit) {
    throw new Error("Payload too large");
  }

  const body = JSON.parse(raw);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request");
  }

  return body;
}

function publicUser(user) {
  return {
    username: user.username,
    country: user.country,
    region: user.region || "",
    joinedAt: user.created_at
  };
}

async function ipLimiter(db, key, seconds) {
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(
    "DELETE FROM rate_limits WHERE created_at < ?"
  ).bind(now - 86400).run();

  const row = await db.prepare(
    "SELECT created_at FROM rate_limits WHERE key = ?"
  ).bind(key).first();

  if (row && row.created_at > now - seconds) {
    return false;
  }

  await db.prepare(`
    INSERT INTO rate_limits(key, created_at)
    VALUES(?, ?)
    ON CONFLICT(key)
    DO UPDATE SET created_at = excluded.created_at
  `).bind(key, now).run();

  return true;
}

// IP caps slow down bulk account creation but do not establish identity.
// Household, school and mobile-network users can share the same address.
const REGISTRATION_IP_LIMIT = 5;
const REGISTRATION_WINDOW_SECONDS = 24 * 60 * 60;

async function recentRegistrations(db, ipHash) {
  const cutoff = Math.floor(Date.now() / 1000) - REGISTRATION_WINDOW_SECONDS;
  const prefix = "registration-count:" + ipHash + ":";
  const row = await db.prepare(
    "SELECT COUNT(*) AS total FROM rate_limits " +
    "WHERE key LIKE ? AND created_at >= ?"
  ).bind(prefix + "%", cutoff).first();
  return Number(row?.total || 0);
}

async function recordRegistration(db, ipHash) {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(
    "INSERT INTO rate_limits(key, created_at) VALUES (?, ?)"
  ).bind(
    "registration-count:" + ipHash + ":" + crypto.randomUUID(),
    now
  ).run();
}

async function currentUser(request, env) {
  const token = authToken(request);
  if (!token) return null;

  return env.DB.prepare(`
    SELECT id, username, country, region, created_at
    FROM users
    WHERE token_hash = ?
  `).bind(await hash(token)).first();
}

/*
 * Validate a submitted session.
 *
 * Club IDs in the current game dataset have the form:
 * league-id:1, league-id:2, etc.
 *
 * The league counts must be updated whenever the
 * game's official club dataset changes.
 */
function validateResult(body) {
  const {
    mode, sessionId, score, total, correct,
    bkPoints, leagueIds, rounds
  } = body;

  if (!Object.hasOwn(BASE_POINTS, mode)) {
    return null;
  }

  if (
    typeof sessionId !== "string" ||
    !/^[0-9a-f-]{36}$/.test(sessionId)
  ) {
    return null;
  }

  if (
    ![score, total, correct, bkPoints].every(Number.isInteger) ||
    !Array.isArray(leagueIds) ||
    !Array.isArray(rounds) ||
    leagueIds.length < 1 ||
    leagueIds.length > 12 ||
    total < 1 ||
    total > 214 ||
    rounds.length !== total
  ) {
    return null;
  }

  const selected = new Set(leagueIds);

  if (
    selected.size !== leagueIds.length ||
    !leagueIds.every(id =>
      typeof id === "string" &&
      Object.hasOwn(LEAGUES, id)
    )
  ) {
    return null;
  }

  const fullLeagueTotal = leagueIds.reduce(
    (sum, id) => sum + LEAGUES[id].count,
    0
  );

  if (
    (mode === "short" && total !== 5) ||
    (mode === "medium" && total !== 10) ||
    (mode === "long" && total !== fullLeagueTotal) ||
    total > fullLeagueTotal
  ) {
    return null;
  }

  const seen = new Set();
  let calculatedScore = 0;
  let calculatedCorrect = 0;
  let weightedScore = 0;

  for (const round of rounds) {
    if (!round || typeof round !== "object") {
      return null;
    }

    if (typeof round.id !== "string") {
      return null;
    }

    const match = /^([a-z0-9-]+):([1-9]\d*)$/.exec(round.id);

    if (!match) return null;

    const leagueId = match[1];
    const clubNumber = Number(match[2]);

    if (
      !selected.has(leagueId) ||
      !Number.isSafeInteger(clubNumber) ||
      clubNumber > LEAGUES[leagueId].count ||
      seen.has(round.id)
    ) {
      return null;
    }

    seen.add(round.id);

    const attempt = round.attempt;

    if (
      attempt !== null &&
      (
        !Number.isInteger(attempt) ||
        attempt < 1 ||
        attempt > 5
      )
    ) {
      return null;
    }

    const performance = attempt === null ? 0 : 6 - attempt;

    calculatedScore += performance;

    if (performance > 0) {
      calculatedCorrect++;
    }

    weightedScore += performance * LEAGUES[leagueId].multiplier;
  }

  const calculatedBK = Math.round(
    BASE_POINTS[mode] * weightedScore / (5 * total)
  );

  if (
    score !== calculatedScore ||
    correct !== calculatedCorrect ||
    bkPoints !== calculatedBK
  ) {
    return null;
  }

  return {
    mode,
    sessionId,
    score,
    total,
    correct,
    bkPoints: calculatedBK
  };
}

async function handle(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const route = url.pathname;

  const headers = cors(request, env);

  if (!headers) {
    return json({ error: "Origin not allowed" }, 403);
  }

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  const reply = (data, status = 200) =>
    json(data, status, headers);

  if (route === "/api/health" && method === "GET") {
    return reply({ ready: true });
  }

  if (route === "/api/profile" && method === "GET") {
    const user = await currentUser(request, env);

    return user
      ? reply({ profile: publicUser(user) })
      : reply({ error: "Profile not found" }, 401);
  }

  if (route === "/api/register" && method === "POST") {
    let body;

    try {
      body = await readBody(request);
    } catch {
      return reply({ error: "Invalid request" }, 400);
    }

    const username = normal(body.username);
    const token = authToken(request);

    if (!validName(username) || !token) {
      return reply({
        error: "Username must be 3–20 letters, numbers or underscores"
      }, 400);
    }

    const existing = await currentUser(request, env);

    if (existing) {
      return reply({
        error: "This browser already has a username",
        profile: publicUser(existing)
      }, 409);
    }

    const country = countryOf(request);
    const region = regionOf(request);
    const key = username.toLowerCase();

    const ip = request.headers.get("CF-Connecting-IP") || "";
    if (!ip) {
      return reply({ error: "Registration temporarily unavailable" }, 503);
    }
    const ipHash = await hash(ip);
    if (await recentRegistrations(env.DB, ipHash) >= REGISTRATION_IP_LIMIT) {
      return reply({
        error: "Registration limit reached for this network. Try again tomorrow."
      }, 429);
    }
    const allowed = await ipLimiter(env.DB, "registration:" + ipHash, 60);
    if (!allowed) {
      return reply({ error: "Too many registration attempts. Try later." }, 429);
    }

    try {
      const userId = crypto.randomUUID();
      const tokenHash = await hash(token);
      const now = Math.floor(Date.now() / 1000);

      await env.DB.prepare(`
        INSERT INTO users(
          id, username, name_key, token_hash,
          country, region, created_at
        )
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId, username, key, tokenHash,
        country, region, now
      ).run();

      // Count successful registrations, not failed username choices.
      await recordRegistration(env.DB, ipHash);

      return reply({
        profile: {
          username,
          country,
          region,
          joinedAt: now
        }
      }, 201);

    } catch (error) {
      if (String(error).includes("UNIQUE")) {
        return reply({ error: "Username already taken" }, 409);
      }

      throw error;
    }
  }

  if (route === "/api/leaderboard" && method === "GET") {
    const scope = url.searchParams.get("scope") || "global";
    const mode = url.searchParams.get("mode") || "short";

    if (
      !["global", "country", "region"].includes(scope) ||
      !Object.hasOwn(BASE_POINTS, mode)
    ) {
      return reply({ error: "Invalid filter" }, 400);
    }

    const user = await currentUser(request, env);

    if (scope !== "global" && !user) {
      return reply({
        error: "Choose a username to view your country or region"
      }, 401);
    }

    const where =
      scope === "country"
        ? " AND u.country = ?"
        : scope === "region"
          ? " AND u.country = ? AND u.region = ?"
          : "";

    const binds = [mode];

    if (scope !== "global") {
      binds.push(user.country);
    }

    if (scope === "region") {
      binds.push(user.region);
    }

    const rows = await env.DB.prepare(`
      SELECT
        u.username,
        u.country,
        u.region,
        s.best_score AS score,
        s.best_total AS rounds,
        s.best_correct AS correct,
        s.best_bk_points AS bkPoints,
        s.updated_at
      FROM scores s
      JOIN users u ON u.id = s.user_id
      WHERE s.mode = ?${where}
      ORDER BY
        s.best_bk_points DESC,
        s.updated_at ASC,
        u.username ASC
      LIMIT 100
    `).bind(...binds).all();

    // Players with the same BK Points share the same rank.
    // Display order among tied players does not affect their rank.
    let previousPoints = null;
    let sharedRank = 0;

    const players = (rows.results || []).map((row, index) => {
      if (row.bkPoints !== previousPoints) {
        sharedRank = index + 1;
        previousPoints = row.bkPoints;
      }

      return {
        rank: sharedRank,
        username: row.username,
        country: row.country,
        score: row.score,
        rounds: row.rounds,
        correct: row.correct,
        bkPoints: row.bkPoints
      };
    });

    return reply({
      scope,
      mode,
      country: scope === "global" ? null : user.country,
      region: scope === "region" ? user.region : null,
      players
    });
  }

  if (route === "/api/scores" && method === "POST") {
    const user = await currentUser(request, env);

    if (!user) {
      return reply({ error: "Choose a username first" }, 401);
    }

    let body;

    try {
      body = await readBody(request);
    } catch {
      return reply({ error: "Invalid request" }, 400);
    }

    const result = validateResult(body);

    if (!result) {
      return reply({ error: "Invalid quiz result" }, 400);
    }

    const allowed = await ipLimiter(
      env.DB,
      "score:" + user.id,
      10
    );

    if (!allowed) {
      return reply({
        error: "Please allow a moment between submissions"
      }, 429);
    }

    try {
      const now = Math.floor(Date.now() / 1000);

      await env.DB.batch([
        env.DB.prepare(`
          INSERT INTO submissions(
            session_id, user_id, mode, score,
            total, correct, bk_points, created_at
          )
          VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          result.sessionId,
          user.id,
          result.mode,
          result.score,
          result.total,
          result.correct,
          result.bkPoints,
          now
        ),

        env.DB.prepare(`
          INSERT INTO scores(
            user_id, mode, best_score, best_total,
            best_correct, best_bk_points, updated_at
          )
          VALUES(?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, mode)
          DO UPDATE SET
            best_score = excluded.best_score,
            best_total = excluded.best_total,
            best_correct = excluded.best_correct,
            best_bk_points = excluded.best_bk_points,
            updated_at = excluded.updated_at
          WHERE excluded.best_bk_points > scores.best_bk_points
        `).bind(
          user.id,
          result.mode,
          result.score,
          result.total,
          result.correct,
          result.bkPoints,
          now
        )
      ]);

      return reply({
        saved: true,
        bkPoints: result.bkPoints
      });

    } catch (error) {
      if (String(error).includes("UNIQUE")) {
        return reply({
          error: "This session was already submitted"
        }, 409);
      }

      throw error;
    }
  }

  return reply({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error(error);

      return json(
        { error: "Service temporarily unavailable" },
        500,
        cors(request, env) || {}
      );
    }
  }
};
