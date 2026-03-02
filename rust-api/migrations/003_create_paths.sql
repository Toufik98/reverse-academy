-- Migration 003: Create learning_paths and steps tables
-- Content structure for learning paths

CREATE TABLE IF NOT EXISTS learning_paths (
    id          TEXT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    domain      TEXT NOT NULL,
    mode        TEXT NOT NULL CHECK (mode IN ('fix-broken', 'problem-first', 'reverse-engineer')),
    difficulty  TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    description TEXT NOT NULL DEFAULT '',
    estimated_minutes INTEGER NOT NULL DEFAULT 30,
    xp_reward   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_paths_domain ON learning_paths(domain);

CREATE TABLE IF NOT EXISTS steps (
    id            TEXT PRIMARY KEY,
    path_id       TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    order_index   INTEGER NOT NULL,
    title         TEXT NOT NULL,
    step_type     TEXT NOT NULL CHECK (step_type IN ('challenge', 'reveal', 'exercise', 'quiz')),
    content_json  TEXT NOT NULL DEFAULT '{}',
    hint          TEXT,
    xp_reward     INTEGER NOT NULL DEFAULT 10,
    parent_step_id TEXT REFERENCES steps(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(path_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_steps_path_id ON steps(path_id);
CREATE INDEX IF NOT EXISTS idx_steps_order ON steps(path_id, order_index);
