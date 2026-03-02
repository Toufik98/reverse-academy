use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Achievement {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub criteria_json: String,
    pub xp_reward: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserAchievement {
    pub id: String,
    pub user_id: String,
    pub achievement_id: String,
    pub earned_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AchievementWithEarned {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: String,
    pub icon: String,
    pub xp_reward: i32,
    pub earned_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum AchievementCriteria {
    #[serde(rename = "step_count")]
    StepCount { count: i32 },
    #[serde(rename = "path_complete")]
    PathComplete { path_slug: Option<String> },
    #[serde(rename = "first_attempt")]
    FirstAttempt { count: i32 },
    #[serde(rename = "no_hints")]
    NoHints { count: i32 },
    #[serde(rename = "streak")]
    Streak { days: i32 },
    #[serde(rename = "speed")]
    Speed { max_seconds: i32 },
}
