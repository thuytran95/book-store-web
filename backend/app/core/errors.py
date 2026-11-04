from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class DomainError(Exception):
    """Business error with a stable `code`. The frontend switches on `code`, never `message`."""

    status_code = 400
    code = "DOMAIN_ERROR"

    def __init__(self, message: str | None = None, *, code: str | None = None,
                 details: dict[str, Any] | None = None) -> None:
        self.message = message or self.code
        if code:
            self.code = code
        self.details = details or {}
        super().__init__(self.message)


class NotFound(DomainError):
    status_code = 404
    code = "NOT_FOUND"


class Conflict(DomainError):
    status_code = 409
    code = "CONFLICT"


class Forbidden(DomainError):
    status_code = 403
    code = "FORBIDDEN"


class Unauthenticated(DomainError):
    status_code = 401
    code = "UNAUTHENTICATED"


class OutOfStock(Conflict):
    code = "OUT_OF_STOCK"

    def __init__(self, book_id: int, requested: int, available: int) -> None:
        super().__init__(
            f"Book {book_id}: requested {requested}, available {available}",
            details={"book_id": book_id, "requested": requested, "available": available},
        )


class CartEmpty(DomainError):
    code = "CART_EMPTY"


class BookUnavailable(Conflict):
    code = "BOOK_UNAVAILABLE"


class InvalidTransition(Conflict):
    code = "INVALID_TRANSITION"


def _body(code: str, message: str, details: Any = None) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "details": details or {}}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error(_: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(_body(exc.code, exc.message, exc.details), status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        fields = [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()]
        return JSONResponse(
            _body("VALIDATION_ERROR", "Invalid request", {"fields": fields}), status_code=422
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(_body(f"HTTP_{exc.status_code}", str(exc.detail)),
                            status_code=exc.status_code)
