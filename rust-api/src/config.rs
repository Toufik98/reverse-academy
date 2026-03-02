/// Application configuration loaded from environment variables.
#[derive(Clone, Debug)]
pub struct AppConfig {
    pub port: u16,
    pub turso_url: String,
    pub turso_auth_token: String,
    pub jwt_secret: String,
    pub piston_url: String,
    pub admin_token: String,
    pub github_client_id: String,
    pub github_client_secret: String,
    pub frontend_url: String,
    pub resend_api_key: String,
    pub email_from: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a number"),
            turso_url: std::env::var("TURSO_URL")
                .unwrap_or_else(|_| "file:local.db".to_string()),
            turso_auth_token: std::env::var("TURSO_AUTH_TOKEN")
                .unwrap_or_default(),
            jwt_secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "dev-secret-change-in-production".to_string()),
            piston_url: std::env::var("PISTON_URL")
                .unwrap_or_else(|_| "http://[2a01:4f9:c014:8af6::1]:2001/api/v2".to_string()),
            admin_token: std::env::var("ADMIN_TOKEN")
                .unwrap_or_else(|_| "dev-admin-token".to_string()),
            github_client_id: std::env::var("GITHUB_CLIENT_ID")
                .unwrap_or_default(),
            github_client_secret: std::env::var("GITHUB_CLIENT_SECRET")
                .unwrap_or_default(),
            frontend_url: std::env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            resend_api_key: std::env::var("RESEND_API_KEY")
                .unwrap_or_default(),
            email_from: std::env::var("EMAIL_FROM")
                .unwrap_or_else(|_| "Reverse Academy <noreply@reverseacademy.dev>".to_string()),
        }
    }
}
