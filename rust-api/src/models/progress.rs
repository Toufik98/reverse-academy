use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProgress {
    pub id: String,
    pub user_id: String,
    pub path_id: String,
    pub step_id: String,
    pub status: ProgressStatus,
    pub answer_json: Option<String>,
    pub attempts: i32,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ProgressStatus {
    Locked,
    Available,
    InProgress,
    Completed,
}

impl std::fmt::Display for ProgressStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProgressStatus::Locked => write!(f, "locked"),
            ProgressStatus::Available => write!(f, "available"),
            ProgressStatus::InProgress => write!(f, "in_progress"),
            ProgressStatus::Completed => write!(f, "completed"),
        }
    }
}

impl TryFrom<&str> for ProgressStatus {
    type Error = String;

    fn try_from(s: &str) -> Result<Self, Self::Error> {
        match s {
            "locked" => Ok(ProgressStatus::Locked),
            "available" => Ok(ProgressStatus::Available),
            "in_progress" | "in-progress" => Ok(ProgressStatus::InProgress),
            "completed" => Ok(ProgressStatus::Completed),
            other => Err(format!("Invalid progress status: {}", other)),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PathProgressSummary {
    pub path_id: String,
    pub total_steps: i32,
    pub completed_steps: i32,
    pub current_step_id: Option<String>,
    pub total_xp_earned: i32,
}
