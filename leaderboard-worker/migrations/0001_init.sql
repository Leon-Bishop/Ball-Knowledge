-- Cloudflare D1 schema. Run once before deploying the Worker.
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL,
 name_key TEXT NOT NULL UNIQUE,
 token_hash TEXT NOT NULL UNIQUE,
 country TEXT NOT NULL DEFAULT 'ZZ',
 region TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS scores (
 user_id TEXT NOT NULL REFERENCES users(id),
 mode TEXT NOT NULL CHECK(mode IN ('short','medium','long')),
 best_score INTEGER NOT NULL,
 best_total INTEGER NOT NULL,
 best_correct INTEGER NOT NULL,
 best_bk_points INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(user_id, mode)
);
CREATE TABLE IF NOT EXISTS submissions (
 session_id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id),
 mode TEXT NOT NULL,
 score INTEGER NOT NULL,
 total INTEGER NOT NULL,
 correct INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS scores_mode ON scores(mode);
CREATE INDEX IF NOT EXISTS users_country_region ON users(country,region);
