use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts, StatusCode},
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub username: String,
    pub roles: Vec<String>,
    pub permissions: Vec<String>,
    pub exp: usize,
}

#[derive(Clone)]
pub struct AuthState {
    pub decoding_key: Option<DecodingKey>,
}

impl AuthState {
    pub fn new(public_key_pem: &str) -> Self {
        let decoding_key = if public_key_pem.is_empty() {
            None
        } else {
            DecodingKey::from_rsa_pem(public_key_pem.as_bytes()).ok()
        };
        Self { decoding_key }
    }
}

pub struct AuthUser(pub Claims);

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
    AuthState: FromRef<S>,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_state = AuthState::from_ref(state);
        let key = auth_state
            .decoding_key
            .as_ref()
            .ok_or((StatusCode::INTERNAL_SERVER_ERROR, "RS256 public key missing"))?;

        let header_val = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header"))?;

        let token = header_val
            .strip_prefix("Bearer ")
            .ok_or((StatusCode::UNAUTHORIZED, "Invalid Bearer token format"))?
            .trim();

        let validation = Validation::new(Algorithm::RS256);
        let data = decode::<Claims>(token, key, &validation)
            .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid or expired SSO token"))?;

        Ok(AuthUser(data.claims))
    }
}

pub trait FromRef<T> {
    fn from_ref(input: &T) -> Self;
}

