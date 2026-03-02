-- Migration 004: Create user_progress table
-- Tracks learner progress through steps

CREATE TABLE IF NOT EXISTS user_progress (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_id      TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    step_id      TEXT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
    answer_json  TEXT,
    attempts     INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_path ON user_progress(user_id, path_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_progress(user_id, status);
