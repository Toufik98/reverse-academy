-- Migration 009: Create analytics_events table
-- Lightweight event tracking for learning analytics

CREATE TABLE IF NOT EXISTS analytics_events (
    id         TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    metadata   TEXT NOT NULL DEFAULT '{}',
    user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
