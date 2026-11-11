use std::collections::HashMap;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::Row;
use uuid::Uuid;
use crate::{auth::AuthUser, events::publish_stream_event, AppState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedQuestion {
    pub id: Uuid,
    pub question_order: i16,
    pub question_type: String,
    pub prompt_text: String,
    pub options_jsonb: Option<Value>,
    pub correct_answer_key: Option<String>,
    pub weight: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedExam {
    pub id: Uuid,
    pub title: String,
    pub duration_minutes: i16,
    pub is_random: bool,
    pub exam_browser_key: String,
    pub questions: Vec<CachedQuestion>,
}

#[derive(Debug, Serialize)]
pub struct StudentQuestionView {
    pub id: Uuid,
    pub question_type: String,
    pub prompt_text: String,
    pub options_jsonb: Option<Value>,
}

#[derive(Debug, Deserialize)]
pub struct SaveAnswerRequest {
    pub question_id: Uuid,
    pub answer: String,
    pub cheat_violation: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct SubmitExamResponse {
    pub exam_id: Uuid,
    pub student_id: Uuid,
    pub auto_graded_score: f64,
    pub cheat_violation_count: i32,
}

async fn load_or_warm_exam(state: &AppState, exam_id: Uuid) -> Result<CachedExam, (StatusCode, String)> {
    let cache_key = format!("cbt:exam:{}:payload", exam_id);
    if let Ok(mut conn) = state.redis.get_multiplexed_async_connection().await {
        if let Ok(Some(raw)) = conn.get::<_, Option<String>>(&cache_key).await {
            if let Ok(parsed) = serde_json::from_str::<CachedExam>(&raw) {
                return Ok(parsed);
            }
        }
    }

    let exam_row = sqlx::query(
        "SELECT id, title, duration_minutes, is_random, exam_browser_key FROM high_speed_ops.cbt_exams WHERE id = $1",
    )
    .bind(exam_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "CBT exam not found".into()))?;

    let q_rows = sqlx::query(
        r#"
        SELECT id, question_order, question_type, prompt_text, options_jsonb,
               correct_answer_key, weight::FLOAT8 AS weight
        FROM high_speed_ops.cbt_questions
        WHERE exam_id = $1
        ORDER BY question_order ASC
        "#,
    )
    .bind(exam_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let questions = q_rows
        .into_iter()
        .map(|r| CachedQuestion {
            id: r.get("id"),
            question_order: r.get("question_order"),
            question_type: r.get("question_type"),
            prompt_text: r.get("prompt_text"),
            options_jsonb: r.get("options_jsonb"),
            correct_answer_key: r.get("correct_answer_key"),
            weight: r.get("weight"),
        })
        .collect();

    let duration: i16 = exam_row.get("duration_minutes");
    let exam = CachedExam {
        id: exam_row.get("id"),
        title: exam_row.get("title"),
        duration_minutes: duration,
        is_random: exam_row.get("is_random"),
        exam_browser_key: exam_row.get("exam_browser_key"),
        questions,
    };

    if let Ok(mut conn) = state.redis.get_multiplexed_async_connection().await {
        if let Ok(serialized) = serde_json::to_string(&exam) {
            let ttl = (duration as u64) * 60 + 7200;
            let _: Result<(), _> = conn.set_ex(&cache_key, serialized, ttl).await;
        }
    }

    Ok(exam)
}

async fn resolve_student_id(state: &AppState, user_id: Uuid) -> Result<Uuid, (StatusCode, String)> {
    sqlx::query_scalar::<_, Uuid>("SELECT id FROM iam_master.students WHERE user_id = $1 LIMIT 1")
        .bind(user_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::FORBIDDEN, "Current user is not registered as a student".into()))
}

pub async fn prewarm_exam(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(exam_id): Path<Uuid>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let exam = load_or_warm_exam(&state, exam_id).await?;
    Ok(Json(json!({
        "examId": exam.id,
        "questionCount": exam.questions.len(),
        "prewarmed": true
    })))
}

pub async fn start_exam(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    headers: HeaderMap,
    Path(exam_id): Path<Uuid>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid subject UUID".into()))?;
    let student_id = resolve_student_id(&state, user_id).await?;
    let exam = load_or_warm_exam(&state, exam_id).await?;

    let browser_key = headers
        .get("x-exam-browser-key")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if browser_key != exam.exam_browser_key {
        return Err((StatusCode::FORBIDDEN, "Invalid Exam Browser Lock key".into()));
    }

    sqlx::query(
        r#"
        INSERT INTO high_speed_ops.cbt_student_submissions (exam_id, student_id)
        VALUES ($1, $2)
        ON CONFLICT (exam_id, student_id) DO NOTHING
        "#,
    )
    .bind(exam_id)
    .bind(student_id)
    .execute(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut questions: Vec<StudentQuestionView> = exam
        .questions
        .iter()
        .map(|q| StudentQuestionView {
            id: q.id,
            question_type: q.question_type.clone(),
            prompt_text: q.prompt_text.clone(),
            options_jsonb: q.options_jsonb.clone(),
        })
        .collect();

    if exam.is_random {
        let seed = student_id.as_u128();
        questions.sort_by_key(|q| q.id.as_u128() ^ seed);
    }

    Ok(Json(json!({
        "examId": exam.id,
        "title": exam.title,
        "durationMinutes": exam.duration_minutes,
        "questions": questions
    })))
}

pub async fn save_answer(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(exam_id): Path<Uuid>,
    Json(req): Json<SaveAnswerRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid subject UUID".into()))?;
    let student_id = resolve_student_id(&state, user_id).await?;
    let session_key = format!("cbt:session:{}:{}", exam_id, student_id);

    let mut conn = state
        .redis
        .get_multiplexed_async_connection()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let q_field = req.question_id.to_string();
    let _: () = conn
        .hset(&session_key, &q_field, req.answer)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if req.cheat_violation.unwrap_or(false) {
        let _: i64 = conn
            .hincr(&session_key, "__violations", 1)
            .await
            .unwrap_or(0);
    }

    Ok(Json(json!({ "saved": true })))
}

pub async fn submit_exam(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(exam_id): Path<Uuid>,
) -> Result<Json<SubmitExamResponse>, (StatusCode, String)> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid subject UUID".into()))?;
    let student_id = resolve_student_id(&state, user_id).await?;
    let exam = load_or_warm_exam(&state, exam_id).await?;
    let session_key = format!("cbt:session:{}:{}", exam_id, student_id);

    let mut conn = state
        .redis
        .get_multiplexed_async_connection()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut answers_map: HashMap<String, String> = conn
        .hgetall(&session_key)
        .await
        .unwrap_or_default();

    let violations: i32 = answers_map
        .remove("__violations")
        .and_then(|v| v.parse().ok())
        .unwrap_or(0);

    let mut earned = 0.0_f64;
    let mut total_weight = 0.0_f64;
    for q in &exam.questions {
        if q.question_type == "MULTIPLE_CHOICE" {
            total_weight += q.weight;
            if let (Some(expected), Some(actual)) =
                (&q.correct_answer_key, answers_map.get(&q.id.to_string()))
            {
                if expected.eq_ignore_ascii_case(actual.trim()) {
                    earned += q.weight;
                }
            }
        }
    }
    let score = if total_weight > 0.0 {
        (earned / total_weight) * 100.0
    } else {
        0.0
    };

    sqlx::query(
        r#"
        UPDATE high_speed_ops.cbt_student_submissions
        SET answers_jsonb = $3,
            auto_graded_score = $4,
            cheat_violation_count = $5,
            submitted_at = NOW()
        WHERE exam_id = $1 AND student_id = $2
        "#,
    )
    .bind(exam_id)
    .bind(student_id)
    .bind(json!(answers_map))
    .bind(score)
    .bind(violations)
    .execute(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    publish_stream_event(
        &state.redis,
        "CbtExamSubmitted",
        json!({
            "examId": exam_id,
            "studentId": student_id,
            "score": score,
            "cheatViolationCount": violations
        }),
    )
    .await;

    Ok(Json(SubmitExamResponse {
        exam_id,
        student_id,
        auto_graded_score: score,
        cheat_violation_count: violations,
    }))
}

