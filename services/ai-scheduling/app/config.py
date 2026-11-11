import os
from dataclasses import dataclass
from pathlib import Path


def _resolve_public_key() -> str:
    env_path = os.getenv("JWT_PUBLIC_KEY_PATH")
    candidates = [
        Path(env_path) if env_path else None,
        Path("infra/secrets/public.pem"),
        Path("../../infra/secrets/public.pem"),
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate.read_text(encoding="utf-8")
    return ""


@dataclass(frozen=True)
class Settings:
    port: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://smartschool:smartschool_dev_pass@localhost:5432/smartschool_db",
    )
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_password: str = os.getenv("REDIS_PASSWORD", "smartschool_redis_pass")
    jwt_public_key: str = _resolve_public_key()


settings = Settings()
