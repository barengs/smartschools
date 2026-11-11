mod auth;
mod cbt;
mod config;
mod events;
mod iot;
mod wallet;

use std::net::SocketAddr;
use axum::{
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;
use crate::{
    auth::{AuthState, FromRef},
    config::AppConfig,
};

#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub redis: redis::Client,
    pub auth: AuthState,
}

impl FromRef<AppState> for AuthState {
    fn from_ref(input: &AppState) -> Self {
        input.auth.clone()
    }
}

async fn health() -> Json<serde_json::Value> {
    Json(json!({ "status": "ok", "service": "high-speed-engine" }))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let cfg = AppConfig::from_env();

    let pool = PgPoolOptions::new()
        .max_connections(30)
        .connect_lazy(&cfg.database_url)
        .expect("Invalid PostgreSQL URL");

    let redis = redis::Client::open(cfg.redis_url.as_str()).expect("Invalid Redis URL");

    iot::spawn_mqtt_worker(cfg.mqtt_host.clone(), cfg.mqtt_port, pool.clone(), redis.clone()).await;

    let state = AppState {
        pool,
        redis,
        auth: AuthState::new(&cfg.jwt_public_key_pem),
    };

    let app = Router::new()
        .route("/api/v1/engine/health", get(health))
        .route("/api/v1/engine/iot/attendance/batch", post(iot::batch_attendance_sync))
        .route("/api/v1/engine/iot/bell-schedule", get(iot::get_bell_schedule))
        .route("/api/v1/engine/pos/pay", post(wallet::pos_pay))
        .route("/api/v1/engine/wallets/credit", post(wallet::credit_wallet))
        .route("/api/v1/engine/cbt/:exam_id/prewarm", post(cbt::prewarm_exam))
        .route("/api/v1/engine/cbt/:exam_id/start", post(cbt::start_exam))
        .route("/api/v1/engine/cbt/:exam_id/answer", post(cbt::save_answer))
        .route("/api/v1/engine/cbt/:exam_id/submit", post(cbt::submit_exam))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], cfg.port));
    tracing::info!("⚡ Service B (high-speed-engine) listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.expect("Failed to bind port");
    axum::serve(listener, app).await.expect("Server failed");
}
