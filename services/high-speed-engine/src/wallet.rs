use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::Row;
use uuid::Uuid;
use crate::{auth::AuthUser, events::publish_stream_event, AppState};

#[derive(Debug, Deserialize)]
pub struct PosPayRequest {
    pub student_user_id: Uuid,
    pub merchant_user_id: Uuid,
    pub amount: i64,
    pub items_summary: Option<Value>,
    pub idempotency_key: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PosPayResponse {
    pub transaction_id: Uuid,
    pub remaining_balance: i64,
    pub idempotent_replay: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreditWalletRequest {
    pub user_id: Uuid,
    pub amount: i64,
    pub idempotency_key: String,
}

pub async fn pos_pay(
    State(state): State<AppState>,
    _auth: AuthUser,
    headers: HeaderMap,
    Json(req): Json<PosPayRequest>,
) -> Result<Json<PosPayResponse>, (StatusCode, String)> {
    if req.amount <= 0 {
        return Err((StatusCode::BAD_REQUEST, "Amount must be positive".into()));
    }

    let idempotency_key = headers
        .get("idempotency-key")
        .and_then(|v| v.to_str().ok())
        .map(str::to_string)
        .or(req.idempotency_key.clone())
        .filter(|s| !s.trim().is_empty())
        .ok_or((StatusCode::BAD_REQUEST, "Missing Idempotency-Key".into()))?;

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Check idempotency key first inside transaction
    if let Some(existing) = sqlx::query(
        r#"
        SELECT wt.id AS tx_id, w.balance
        FROM high_speed_ops.wallet_transactions wt
        JOIN high_speed_ops.wallets w ON w.id = wt.wallet_id
        WHERE wt.idempotency_key = $1
        "#,
    )
    .bind(&idempotency_key)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    {
        let _ = tx.rollback().await;
        return Ok(Json(PosPayResponse {
            transaction_id: existing.get("tx_id"),
            remaining_balance: existing.get("balance"),
            idempotent_replay: true,
        }));
    }

    // Row-level pessimistic lock on student wallet
    let wallet_row = sqlx::query(
        r#"
        SELECT id, balance, daily_spending_limit
        FROM high_speed_ops.wallets
        WHERE user_id = $1
        FOR UPDATE
        "#,
    )
    .bind(req.student_user_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "Student wallet not found".into()))?;

    let wallet_id: Uuid = wallet_row.get("id");
    let balance: i64 = wallet_row.get("balance");
    let daily_limit: i64 = wallet_row.get("daily_spending_limit");

    if balance < req.amount {
        return Err((StatusCode::PAYMENT_REQUIRED, "Insufficient wallet balance".into()));
    }

    if daily_limit > 0 {
        let spent_today: i64 = sqlx::query_scalar(
            r#"
            SELECT COALESCE(SUM(amount), 0)::BIGINT
            FROM high_speed_ops.wallet_transactions
            WHERE wallet_id = $1
              AND transaction_type = 'POS_PURCHASE'
              AND created_at >= CURRENT_DATE
            "#,
        )
        .bind(wallet_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if spent_today + req.amount > daily_limit {
            return Err((StatusCode::FORBIDDEN, "Daily spending limit exceeded".into()));
        }
    }

    let new_balance = balance - req.amount;
    sqlx::query(
        r#"
        UPDATE high_speed_ops.wallets
        SET balance = $2, version = version + 1
        WHERE id = $1
        "#,
    )
    .bind(wallet_id)
    .bind(new_balance)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Credit merchant wallet if present
    sqlx::query(
        r#"
        UPDATE high_speed_ops.wallets
        SET balance = balance + $2, version = version + 1
        WHERE user_id = $1
        "#,
    )
    .bind(req.merchant_user_id)
    .bind(req.amount)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let tx_id: Uuid = sqlx::query_scalar(
        r#"
        INSERT INTO high_speed_ops.wallet_transactions
          (wallet_id, transaction_type, amount, merchant_user_id, items_summary_jsonb, idempotency_key)
        VALUES ($1, 'POS_PURCHASE', $2, $3, $4, $5)
        RETURNING id
        "#,
    )
    .bind(wallet_id)
    .bind(req.amount)
    .bind(req.merchant_user_id)
    .bind(req.items_summary.clone().unwrap_or_else(|| json!([])))
    .bind(&idempotency_key)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    publish_stream_event(
        &state.redis,
        "WalletDeducted",
        json!({
            "transactionId": tx_id,
            "studentUserId": req.student_user_id,
            "merchantUserId": req.merchant_user_id,
            "amount": req.amount,
            "remainingBalance": new_balance,
            "itemsSummary": req.items_summary,
        }),
    )
    .await;

    Ok(Json(PosPayResponse {
        transaction_id: tx_id,
        remaining_balance: new_balance,
        idempotent_replay: false,
    }))
}

pub async fn credit_wallet(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(req): Json<CreditWalletRequest>,
) -> Result<Json<PosPayResponse>, (StatusCode, String)> {
    if req.amount <= 0 {
        return Err((StatusCode::BAD_REQUEST, "Amount must be positive".into()));
    }

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(existing) = sqlx::query(
        r#"
        SELECT wt.id AS tx_id, w.balance
        FROM high_speed_ops.wallet_transactions wt
        JOIN high_speed_ops.wallets w ON w.id = wt.wallet_id
        WHERE wt.idempotency_key = $1
        "#,
    )
    .bind(&req.idempotency_key)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    {
        let _ = tx.rollback().await;
        return Ok(Json(PosPayResponse {
            transaction_id: existing.get("tx_id"),
            remaining_balance: existing.get("balance"),
            idempotent_replay: true,
        }));
    }

    let wallet_row = sqlx::query(
        "SELECT id, balance FROM high_speed_ops.wallets WHERE user_id = $1 FOR UPDATE",
    )
    .bind(req.user_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "Wallet not found".into()))?;

    let wallet_id: Uuid = wallet_row.get("id");
    let new_balance: i64 = wallet_row.get::<i64, _>("balance") + req.amount;

    sqlx::query("UPDATE high_speed_ops.wallets SET balance = $2, version = version + 1 WHERE id = $1")
        .bind(wallet_id)
        .bind(new_balance)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let tx_id: Uuid = sqlx::query_scalar(
        r#"
        INSERT INTO high_speed_ops.wallet_transactions
          (wallet_id, transaction_type, amount, idempotency_key)
        VALUES ($1, 'TOPUP', $2, $3)
        RETURNING id
        "#,
    )
    .bind(wallet_id)
    .bind(req.amount)
    .bind(&req.idempotency_key)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(PosPayResponse {
        transaction_id: tx_id,
        remaining_balance: new_balance,
        idempotent_replay: false,
    }))
}
