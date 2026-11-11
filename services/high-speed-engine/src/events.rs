use chrono::Utc;
use redis::AsyncCommands;
use serde_json::Value;
use uuid::Uuid;

pub async fn publish_stream_event(
    redis_client: &redis::Client,
    event_type: &str,
    payload: Value,
) {
    if let Ok(mut conn) = redis_client.get_multiplexed_async_connection().await {
        let event_id = Uuid::new_v4().to_string();
        let occurred_at = Utc::now().to_rfc3339();
        let payload_str = payload.to_string();

        let _: Result<String, _> = conn
            .xadd_maxlen(
                "stream:events",
                redis::streams::StreamMaxlen::Approx(100_000),
                "*",
                &[
                    ("event_id", event_id.as_str()),
                    ("event_type", event_type),
                    ("occurred_at", occurred_at.as_str()),
                    ("source", "rust-engine"),
                    ("payload", payload_str.as_str()),
                ],
            )
            .await;
    }
}

