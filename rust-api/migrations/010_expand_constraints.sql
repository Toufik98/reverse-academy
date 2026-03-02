-- Migration 010: Expand CHECK constraints for learning paths and steps
-- Adds 'goal-tree' mode and 'sandbox'/'theory' step types

-- SQLite doesn't support ALTER TABLE to modify CHECK constraints,
-- so we need to recreate the tables. We'll use a pragmatic approach:
-- just add the new values by recreating with broader constraints.

-- For learning_paths: add 'goal-tree' to mode
CREATE TABLE IF NOT EXISTS learning_paths_new (
    id          TEXT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    domain      TEXT NOT NULL,
    mode        TEXT NOT NULL CHECK (mode IN ('fix-broken', 'problem-first', 'reverse-engineer', 'goal-tree')),
    difficulty  TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    description TEXT NOT NULL DEFAULT '',
    estimated_minutes INTEGER NOT NULL DEFAULT 30,
    xp_reward   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO learning_paths_new SELECT * FROM learning_paths;
DROP TABLE IF EXISTS learning_paths;
ALTER TABLE learning_paths_new RENAME TO learning_paths;

CREATE INDEX IF NOT EXISTS idx_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_paths_domain ON learning_paths(domain);

-- For steps: add 'sandbox' and 'theory' to step_type
CREATE TABLE IF NOT EXISTS steps_new (
    id            TEXT PRIMARY KEY,
    path_id       TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    order_index   INTEGER NOT NULL,
    title         TEXT NOT NULL,
    step_type     TEXT NOT NULL CHECK (step_type IN ('challenge', 'reveal', 'exercise', 'quiz', 'sandbox', 'theory')),
    content_json  TEXT NOT NULL DEFAULT '{}',
    hint          TEXT,
    xp_reward     INTEGER NOT NULL DEFAULT 10,
    parent_step_id TEXT REFERENCES steps_new(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(path_id, order_index)
);

INSERT OR IGNORE INTO steps_new SELECT * FROM steps;
DROP TABLE IF EXISTS steps;
ALTER TABLE steps_new RENAME TO steps;

CREATE INDEX IF NOT EXISTS idx_steps_path_id ON steps(path_id);
CREATE INDEX IF NOT EXISTS idx_steps_order ON steps(path_id, order_index);
