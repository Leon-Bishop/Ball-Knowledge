-- Club-crest avatar selections. Existing and new players display Fenerbahçe
-- by default using the Worker COALESCE expression; no user data is rewritten.
CREATE TABLE IF NOT EXISTS user_avatars (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
