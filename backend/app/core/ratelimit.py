from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


def register_rate_limit(app: FastAPI) -> None:
    app.state.limiter = limiter

    @app.exception_handler(RateLimitExceeded)
    async def too_many(_: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            {"error": {"code": "RATE_LIMITED", "message": "Too many requests", "details": {}}},
            status_code=429,
        )
