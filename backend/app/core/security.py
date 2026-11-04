import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


def _encode(sub: int, kind: str, ttl: timedelta, extra: dict[str, Any] | None = None) -> str:
    now = datetime.now(UTC)
    payload = {"sub": str(sub), "type": kind, "iat": now, "exp": now + ttl, **(extra or {})}
    return jwt.encode(payload, get_settings().jwt_secret, algorithm=ALGORITHM)


def create_access_token(user_id: int, role: str) -> str:
    ttl = timedelta(minutes=get_settings().access_token_ttl_min)
    return _encode(user_id, "access", ttl, {"role": role})


def create_refresh_token(user_id: int) -> str:
    ttl = timedelta(days=get_settings().refresh_token_ttl_days)
    return _encode(user_id, "refresh", ttl, {"jti": secrets.token_hex(8)})


def decode_token(token: str, expected_type: str) -> dict[str, Any] | None:
    """Returns the payload, or None if invalid/expired/wrong type."""
    try:
        payload = jwt.decode(token, get_settings().jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    return payload if payload.get("type") == expected_type else None


def new_reset_token() -> tuple[str, str]:
    """(raw token for the email, sha256 hash for the DB)."""
    raw = secrets.token_urlsafe(32)
    return raw, hash_token(raw)


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
