# Ball Knowledge — Anonymous Country Leaderboards (beta)

A separate Cloudflare Worker with a D1 database makes rankings shared across visitors. The GitHub Pages frontend remains static.

## What this version does

- A player chooses a unique, permanent username (3–20 letters, numbers and underscores, including non-English letters).
- No sign-up form, password, email, or precise GPS permission is requested.
- A random 256-bit browser token identifies the player. The server stores only its SHA-256 hash. A username cannot be changed or claimed twice.
- Country flag and optional region are inferred by Cloudflare from the network connection (not GPS). They can be inaccurate if using VPNs/proxies or where geolocation is unavailable.
- View top-100 players worldwide, in your country, or in your region; separately for Short (5), Medium (10), and Long (all selected league clubs).
- The ranking uses best **percentage score**, then solved clubs, points and submission time.
- Scores are submitted only after a completed quiz. An existing session is not interrupted.
- When no API is connected, the new Rankings tab explains that setup is pending; no mock global scores are shown.

## Important security and honesty limitations

**Without accounts or another reliable identity check, one username per human cannot be enforced.** This beta enforces one username per saved browser identity and globally unique names. Someone can clear storage, use another browser, or use another device to claim another username. If they lose their browser token, they cannot recover that username through this prototype.

**Scores are client-submitted and not independently verified.** Plausibility checks, duplicate submission IDs, and basic rate limits exist, but a skilled attacker can fabricate results. Before marketing this as a competitive national or global leaderboard, add server-authoritative quizzes and stronger abuse protection (or sign-in/device verification). Rank results should be labeled beta until then.

Country and region are collected by the Worker from Cloudflare's coarse geolocation; the browser does not request a GPS position. A SHA-256 hash of network IP may be used temporarily for rate limiting. The service does not store raw IP addresses in its D1 tables. Regional filters may be unavailable when the platform does not return a region code.

## Setup (a Cloudflare account is required)

1. Sign in to Cloudflare and create a **D1** database named `ball-knowledge-leaderboard`.
2. In `leaderboard-worker/wrangler.toml`, replace `REPLACE_WITH_D1_DATABASE_ID` with the database ID shown by Cloudflare.
3. Install Wrangler with Node.js available, then run from the project root:

   ```bash
   npx wrangler login
   cd leaderboard-worker
   npx wrangler d1 execute ball-knowledge-leaderboard --remote --file=migrations/0001_init.sql
   npx wrangler deploy
   ```

   If Wrangler requires a project package or confirmation, accept its normal prompt. You may alternatively install it with `npm install -g wrangler`.

4. Copy the deployed URL that resembles `https://ball-knowledge-leaderboard.<your-subdomain>.workers.dev`.
5. Edit `assets/leaderboard-config.js` to set

   ```js
   window.BK_LEADERBOARD_API = 'https://ball-knowledge-leaderboard.<your-subdomain>.workers.dev';
   ```

6. Run `npm test` and test all six game languages, claiming a username, completing a Short quiz, and reviewing the global/country/region rankings.
7. Only after testing, merge and redeploy GitHub Pages.

The Worker permits only the origins listed in `ALLOWED_ORIGINS`: the published site and local Python server on ports 8000. For other preview domains change this setting. Never place a private Cloudflare API token into GitHub or `leaderboard-config.js`.

### Local static site

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. Without the Cloudflare Worker, the game still works, and the Rankings tab safely indicates that online scores are not configured.

### API

- `POST /api/register` with `Authorization: Bearer <64-hex-token>` and `{"username":"example"}`
- `GET /api/profile` with the bearer token
- `POST /api/scores` with bearer token, a unique session UUID, quiz length mode, points scored, completed rounds and solved rounds
- `GET /api/leaderboard?scope=global|country|region&mode=short|medium|long`
- `GET /api/health`

The Worker requires an allowed Origin for all requests. Only the token hash, username, approximate country/region and submitted scores are persisted. For multi-device identity or account recovery, an optional verified account system would be needed.


## Fix: production custom domain and leaderboard requests (November 2026)

**The GitHub Pages site and the Cloudflare Worker are separate deployments.** Updating this repository alone does NOT update an existing Worker or its dashboard environment variables.

The live frontend currently calls `https://ball-knowledge-api.cenkkingir4.workers.dev`, which may be a Worker with a different name from the example `wrangler.toml` in this folder. **Update the Worker actually serving that URL, not a newly created Worker.**

1. In Cloudflare dashboard, open **Workers & Pages**, select the Worker serving `ball-knowledge-api.cenkkingir4.workers.dev`, and open **Settings → Variables and Secrets** (sometimes **Settings → Variables**).
2. Update the **text** variable `ALLOWED_ORIGINS` to exactly: `https://ballknowledge.life,https://www.ballknowledge.life,https://leon-bishop.github.io,http://localhost:8000,http://127.0.0.1:8000`. Save/deploy the variable change. No trailing slashes or spaces needed. The Worker rejects other Origin headers with HTTP 403.
3. Check the D1 database bound as **DB** to that Worker. Run `PRAGMA table_info(scores);` in its console. The `scores` table must include `best_bk_points`, used by the live leaderboard queries and score submissions. If it is missing, run `ALTER TABLE scores ADD COLUMN best_bk_points INTEGER NOT NULL DEFAULT 0;` **once**, or apply `migrations/0002_add_best_bk_points.sql` using Wrangler against the correct live DB. Do not run the ALTER if already present. Back up existing database before schema changes.
4. Test username registration, viewing the global scoreboard, and saving a completed game from `https://ballknowledge.life`. A 403 or CORS error points to incorrect `ALLOWED_ORIGINS`; a 500 response points to Worker/database configuration or runtime errors. Examine the Worker Logs for exact details.

**Important:** The current username/token method is browser-bound, not a conventional login. Someone using another browser or a browser with cleared local storage cannot recover the original username using this prototype. A verified email recovery flow is necessary before prize-based Ranked competitions.


## Registration abuse controls (November 2026)

The Worker already rate-limits registration attempts per hashed IP address to one per minute. It now also limits **successful registrations to five per public IP in a rolling 24-hour period**, using the existing D1 `rate_limits` table (no new migration). Historical entries are cleared by existing cleanup. This slows incognito/browser account farming, but **is not one person per account**; families, public Wi-Fi and mobile networks may share IP addresses, while malicious users can rotate addresses. Existing players can still use their saved browser identity and play the game without new registrations.

**Deploy `src/index.js` to the actual live Cloudflare Worker at `ball-knowledge-api.cenkkingir4.workers.dev`.** GitHub Pages deployments do not automatically deploy the Worker. Preserve its DB binding and allowed-origin configuration. Cloudflare's Worker dashboard supports editing deployed code or deploying with Wrangler after confirming the correct production service.

Before awarding Ranked prizes, require a persistent verified account, server-controlled matches and duplicate-account review. Blanket VPN blocking and one-account-per-IP rules cause false positives and do not guarantee identity; use network abuse signals to trigger additional verification instead. Implement a way for legitimate users to appeal an automated block.


## Emergency fix for registration HTTP 500 (16 November 2026)

Cloudflare logs showed D1 throwing inside `recentRegistrations()` on `POST /api/register`. This revision **removes the new daily-five-registration query and its write** until the root database exception can be diagnosed. It **retains** the previous per-IP one-minute registration throttle via the existing `rate_limits` table, and does not delete or migrate user data. It is a temporary reliability fix, not a solution to duplicate identities.

**Deployment:** Update the existing `ball-knowledge-api` Worker (NOT a new Worker) with the code in `src/index.js`, preserving the production D1 `DB` binding and `ALLOWED_ORIGINS`. This GitHub commit alone does not update that live Cloudflare service. Test `POST /api/register` with a fresh username and existing-account profile/leaderboard retrieval. Before any prize-based Ranked competition, implement verified identities plus backend-issued questions and server-side attempt limits.


## Club badge avatars (November 2026)

Ball Knowledge now uses real club crest images in a searchable, 214-club avatar picker (12 leagues; Turkish Süper Lig first). **No club badge is assigned by default: existing players can pick any club, and new players select one during username registration. This does not alter the existing user or score records.

To synchronize a player's chosen crest across devices and other people's leaderboards, deploy the updated `leaderboard-worker/src/index.js` to the existing **ball-knowledge-api** Worker in Cloudflare, preserving `DB` and `ALLOWED_ORIGINS`. Optional: run `migrations/0003_user_avatars.sql` on that D1 database first. The Worker can create this table automatically on a player's first badge selection. If not yet created, profile and leaderboard queries fall back to the existing schema so registrations and scores keep working.

The authenticated API is `POST /api/avatar` with JSON `{"clubId":"turkey-super-lig:6"}` and the existing Bearer token. The `/api/profile` and `/api/leaderboard` responses contain `avatarTeamId`; unselected users return `null`. Without the Worker upgrade, selection is saved **locally in the current browser only** and the site remains playable.

Club logo images are loaded from the public luukhopman/football-logos collection (European leagues), and third-party club logo repositories (Brazil). The picker displays a club abbreviation if a remote logo becomes unavailable. Club crests and trademarks belong to their respective clubs. The unused portrait sprites and credit note were removed.


### Registration badge picker update

The club picker can be opened before creating an account. A valid badge selection is required by the UI before submitting the username. The registration request includes `clubId`; the new Worker validates the choice and saves it if the avatar table is available. It never automatically assigns Fenerbahçe to existing accounts. If the old Worker is still deployed, the browser keeps the chosen badge locally and attempts to sync it after registration; cross-device visibility requires deploying the updated Worker.
