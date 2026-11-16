-- Apply this migration to existing D1 databases created before best_bk_points was added.
-- If your database already contains this column, do not run this ALTER TABLE statement.
ALTER TABLE scores ADD COLUMN best_bk_points INTEGER NOT NULL DEFAULT 0;
