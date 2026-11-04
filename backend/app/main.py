from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.logging import RequestIdMiddleware, setup_logging
from app.core.ratelimit import register_rate_limit
from app.jobs.expire_reservations import start_scheduler
from app.modules.auth.router import router as auth_router
from app.modules.book_requests.admin_router import router as book_requests_admin_router
from app.modules.book_requests.router import router as book_requests_router
from app.modules.cart.router import router as cart_router
from app.modules.catalog.admin_router import router as catalog_admin_router
from app.modules.catalog.router import router as catalog_router
from app.modules.media.router import router as media_router
from app.modules.orders.admin_router import router as orders_admin_router
from app.modules.orders.router import router as orders_router
from app.modules.reports.router import router as reports_router
from app.modules.reservations.admin_router import router as reservations_admin_router
from app.modules.reservations.router import router as reservations_router
from app.modules.users.router import admin_router as users_admin_router
from app.modules.users.router import router as users_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    scheduler = start_scheduler()  # expires reservations every 10 minutes
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging()
    app = FastAPI(title="Book Store API", openapi_url=f"{API_PREFIX}/openapi.json",
                  docs_url=f"{API_PREFIX}/docs", lifespan=lifespan)
    register_error_handlers(app)
    register_rate_limit(app)
    app.add_middleware(RequestIdMiddleware)
    # CORS limited to the frontend origin(s); added last so it wraps everything.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["x-request-id"],
    )

    api = APIRouter(prefix=API_PREFIX)

    @api.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    for router in (
        auth_router, users_router, users_admin_router,
        catalog_router, catalog_admin_router, media_router,
        cart_router, orders_router, orders_admin_router,
        reservations_router, reservations_admin_router,
        book_requests_router, book_requests_admin_router,
        reports_router,
    ):
        api.include_router(router)
    app.include_router(api)

    media_root = Path(settings.media_root)
    media_root.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=media_root), name="media")
    return app


app = create_app()
