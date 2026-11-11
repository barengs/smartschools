use std::time::Duration;
use axum::{extract::State, http::StatusCode, Json};
use chrono::{DateTime, Local, NaiveTime, Utc};
use rumqttc::{AsyncClient, Event, Incoming, MqttOptions, QoS};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use uuid::Uuid;
use crate::{auth::AuthUser, events::publish_stream_event, AppState};

#[derive(Debug, Deserialize)]
pub struct AttendanceTapPayload {
    pub rfid_uid: String,
    pub device_id: String,
    pub timestamp: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct BatchAttendanceRequest {
    pub records: Vec<AttendanceTapPayload>,
}

#[derive(Debug, Serialize)]
pub struct TapProcessResult {
    pub rfid_uid: String,
    pub accepted: bool,
    pub status: String,
}

pub async fn process_rfid_tap(
    pool: &PgPool,
    redis_client: &redis::Client,
    payload: &AttendanceTapPayload,
) -> TapProcessResult {
    let card_row = sqlx::query(
        "SELECT user_id FROM iam_master.identity_cards WHERE rfid_uid = $1 AND card_status = 'ACTIVE' LIMIT 1",
    )
    .bind(payload.rfid_uid.trim())
    .fetch_optional(pool)
    .await;

    let user_id: Uuid = match card_row {
        Ok(Some(row)) => row.get("user_id"),
        _ => {
            return TapProcessResult {
                rfid_uid: payload.rfid_uid.clone(),
                accepted: false,
                status: "UNKNOWN_OR_BLOCKED_CARD".into(),
            }
        }
    };

    let event_ts = payload.timestamp.unwrap_or_else(Utc::now);
    let local_dt = event_ts.with_timezone(&Local);
    let date = local_dt.date_naive();
    let cutoff = NaiveTime::from_hms_opt(7, 0, 0).expect("valid cutoff time");
    let status = if local_dt.time() > cutoff {
        "LATE"
    } else {
        "PRESENT"
    };

    let insert_res = sqlx::query(
        r#"
        INSERT INTO high_speed_ops.attendances
          (user_id, date, check_in_time, status, verification_method, iot_device_id)
        VALUES ($1, $2, $3, $4, 'RFID_GATE', $5)
        ON CONFLICT (user_id, date) DO NOTHING
        "#,
    )
    .bind(user_id)
    .bind(date)
    .bind(event_ts)
    .bind(status)
    .bind(payload.device_id.trim())
    .execute(pool)
    .await;

    if insert_res.is_ok() {
        publish_stream_event(
            redis_client,
            "AttendanceRecorded",
            json!({
                "userId": user_id,
                "date": date.to_string(),
                "status": status,
                "deviceId": payload.device_id,
                "recordedAt": event_ts.to_rfc3339(),
            }),
        )
        .await;

        TapProcessResult {
            rfid_uid: payload.rfid_uid.clone(),
            accepted: true,
            status: status.into(),
        }
    } else {
        TapProcessResult {
            rfid_uid: payload.rfid_uid.clone(),
            accepted: false,
            status: "DB_ERROR".into(),
        }
    }
}

pub async fn spawn_mqtt_worker(
    mqtt_host: String,
    mqtt_port: u16,
    pool: PgPool,
    redis_client: redis::Client,
) {
    tokio::spawn(async move {
        let mut mqtt_options = MqttOptions::new(
            format!("rust-engine-{}", Uuid::new_v4()),
            mqtt_host,
            mqtt_port,
        );
        mqtt_options.set_keep_alive(Duration::from_secs(30));

        let (client, mut eventloop) = AsyncClient::new(mqtt_options, 256);
        let _ = client
            .subscribe("$share/rust_workers/school/+/gate/+/attendance", QoS::AtLeastOnce)
            .await;

        loop {
            match eventloop.poll().await {
                Ok(Event::Incoming(Incoming::Publish(msg))) => {
                    if let Ok(payload) = serde_json::from_slice::<AttendanceTapPayload>(&msg.payload) {
                        let result = process_rfid_tap(&pool, &redis_client, &payload).await;
                        let ack_topic = msg.topic.replace("/attendance", "/ack");
                        let _ = client
                            .publish(
                                ack_topic,
                                QoS::AtMostOnce,
                                false,
                                serde_json::to_vec(&result).unwrap_or_default(),
                            )
                            .await;
                    }
                }
                Ok(_) => {}
                Err(err) => {
                    tracing::warn!("MQTT worker disconnected ({}); retrying in 5s", err);
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
            }
        }
    });
}

pub async fn batch_attendance_sync(
    State(state): State<AppState>,
    _user: AuthUser,
    Json(req): Json<BatchAttendanceRequest>,
) -> (StatusCode, Json<Vec<TapProcessResult>>) {
    let mut results = Vec::with_capacity(req.records.len());
    for rec in &req.records {
        results.push(process_rfid_tap(&state.pool, &state.redis, rec).await);
    }
    (StatusCode::OK, Json(results))
}

#[derive(Serialize)]
pub struct BellTimeSlot {
    pub day_of_week: i16,
    pub ring_time: String,
}

pub async fn get_bell_schedule(
    State(state): State<AppState>,
) -> Result<Json<Vec<BellTimeSlot>>, (StatusCode, &'static str)> {
    let rows = sqlx::query(
        r#"
        SELECT DISTINCT day_of_week, to_char(start_time, 'HH24:MI') AS ring_time
        FROM academic_lms.schedules
        ORDER BY day_of_week ASC, ring_time ASC
        "#,
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to query bell schedule"))?;

    let items = rows
        .into_iter()
        .map(|r| BellTimeSlot {
            day_of_week: r.get("day_of_week"),
            ring_time: r.get("ring_time"),
        })
        .collect();

    Ok(Json(items))
}

