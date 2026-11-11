use std::{env, fs, path::PathBuf};

#[derive(Clone)]
pub struct AppConfig {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub mqtt_host: String,
    pub mqtt_port: u16,
    pub jwt_public_key_pem: String,
}

fn load_public_key() -> String {
    let candidates = [
        env::var("JWT_PUBLIC_KEY_PATH").ok().map(PathBuf::from),
        Some(PathBuf::from("infra/secrets/public.pem")),
        Some(PathBuf::from("../../infra/secrets/public.pem")),
    ];
    for candidate in candidates.into_iter().flatten() {
        if candidate.exists() {
            if let Ok(content) = fs::read_to_string(&candidate) {
                return content;
            }
        }
    }
    String::new()
}

impl AppConfig {
    pub fn from_env() -> Self {
        let redis_host = env::var("REDIS_HOST").unwrap_or_else(|_| "127.0.0.1".into());
        let redis_port = env::var("REDIS_PORT").unwrap_or_else(|_| "6379".into());
        let redis_pass = env::var("REDIS_PASSWORD").unwrap_or_else(|_| "smartschool_redis_pass".into());
        let redis_url = format!("redis://:{}@{}:{}/", redis_pass, redis_host, redis_port);

        Self {
            port: env::var("HIGH_SPEED_PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3002),
            database_url: env::var("DATABASE_URL").unwrap_or_else(|_| {
                "postgresql://smartschool:smartschool_dev_pass@localhost:5432/smartschool_db".into()
            }),
            redis_url,
            mqtt_host: env::var("MQTT_HOST").unwrap_or_else(|_| "127.0.0.1".into()),
            mqtt_port: env::var("MQTT_PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(1883),
            jwt_public_key_pem: load_public_key(),
        }
    }
}

