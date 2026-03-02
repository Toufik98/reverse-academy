-- Migration 006: Create user_preferences table
-- Stores onboarding data, editor settings, and display preferences

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    interests       TEXT NOT NULL DEFAULT '[]',
    skill_level     TEXT NOT NULL DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    onboarded       INTEGER NOT NULL DEFAULT 0,
    locale          TEXT NOT NULL DEFAULT 'en',
    theme           TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    editor_font_size INTEGER NOT NULL DEFAULT 14,
    editor_tab_size  INTEGER NOT NULL DEFAULT 2,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
