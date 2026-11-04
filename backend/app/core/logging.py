import json
import logging
import time
import uuid
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")
logger = logging.getLogger("app.request")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        data = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": request_id_var.get(),
        }
        data.update(getattr(record, "extra_fields", {}))
        if record.exc_info:
            data["exc"] = self.formatException(record.exc_info)
        return json.dumps(data, ensure_ascii=False)


def setup_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.INFO)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id") or uuid.uuid4().hex
        token = request_id_var.set(rid)
        start = time.perf_counter()
        response = None
        try:
            response = await call_next(request)
            return response
        finally:
            ms = round((time.perf_counter() - start) * 1000, 1)
            logger.info(
                "request",
                extra={"extra_fields": {
                    "method": request.method,
                    "path": request.url.path,
                    "status": getattr(response, "status_code", 500),
                    "duration_ms": ms,
                }},
            )
            request_id_var.reset(token)
            if response is not None:
                response.headers["x-request-id"] = rid
