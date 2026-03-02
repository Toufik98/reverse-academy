-- Migration 005: Create achievements and user_achievements tables
-- Gamification: achievement definitions and user awards

CREATE TABLE IF NOT EXISTS achievements (
    id            TEXT PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    icon          TEXT NOT NULL DEFAULT 'trophy',
    criteria_json TEXT NOT NULL DEFAULT '{}',
    xp_reward     INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug);

CREATE TABLE IF NOT EXISTS user_achievements (
    id             TEXT PRIMARY KEY,
    user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
