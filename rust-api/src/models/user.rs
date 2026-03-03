#![allow(dead_code)]
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub email_verified: bool,
    pub locale: String,
    pub level: i32,
    pub xp: i32,
    pub created_at: String,
    pub updated_at: String,
    pub deleted_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPublic {
    pub id: String,
    pub username: String,
    pub locale: String,
    pub level: i32,
    pub xp: i32,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub username: String,
    pub password: String,
    pub locale: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SessionClaims {
    pub sub: String, // user_id
    pub email: String,
    pub username: String,
    pub exp: usize,
    pub iat: usize,
}

impl User {
    pub fn to_public(&self) -> UserPublic {
        UserPublic {
            id: self.id.clone(),
            username: self.username.clone(),
            locale: self.locale.clone(),
            level: self.level,
            xp: self.xp,
            created_at: self.created_at.clone(),
        }
    }
}
