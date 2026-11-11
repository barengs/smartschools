from __future__ import annotations

from typing import Iterable
import jwt
from fastapi import Depends, Header, HTTPException, status
from .config import settings


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    if not settings.jwt_public_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT public key not configured",
        )
    token = authorization[7:].strip()
    try:
        return jwt.decode(token, settings.jwt_public_key, algorithms=["RS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired SSO token",
        ) from exc


def require_roles(allowed_roles: Iterable[str]):
    allowed = set(allowed_roles)

    def _checker(user: dict = Depends(get_current_user)) -> dict:
        roles = set(user.get("roles") or [])
        if "SUPER_ADMIN" in roles or roles.intersection(allowed):
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient role permissions",
        )

    return _checker
