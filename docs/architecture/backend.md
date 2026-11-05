# Backend architecture

FastAPI (Python 3.12) · SQLAlchemy 2 async + asyncpg · Alembic · PostgreSQL 16 · pydantic-settings · `uv`.
All endpoints are under `/api/v1`. Swagger: `/api/v1/docs`, OpenAPI: `/api/v1/openapi.json`.

## Layout

```
backend/
├── alembic/versions/        hand-numbered migrations 0001 … 0008
├── docker/init-db.sql       creates extensions unaccent, pg_trgm, citext
└── app/
    ├── main.py              create_app(): error handlers, rate limit, request-id, CORS, routers, /media
    ├── cli.py               seed-admin, seed-demo
    ├── core/                shared infrastructure (see below)
    ├── jobs/                APScheduler jobs (started in lifespan)
    └── modules/<name>/      one folder per business module
```

## Core (`app/core/`)

| File | Role |
| --- | --- |
| `config.py` | `Settings` / `get_settings()`; reads `.env` and `../.env` |
| `db.py` | `engine`, `SessionLocal`, `Base`, `TimestampMixin` (created_at/updated_at), `get_session` (commit once per request) |
| `deps.py` | `SessionDep`, `CurrentUser`, `AdminUser`, `require_admin`; reads the `access_token` cookie |
| `security.py` | bcrypt hashing, JWT access/refresh tokens, password-reset tokens |
| `errors.py` | `DomainError` hierarchy + handlers that return `{"error": {"code", "message", "details"}}` |
| `pagination.py` | `PageDep` (page, size ≤ 100) and `Page[T]` (`items, total, page, size`) |
| `types.py` | `Money` (int VND ≥ 0), `Phone` (VN), `Password`, `ConditionPct` (10–100) |
| `ratelimit.py` | slowapi `limiter` (used on auth endpoints) |
| `logging.py` | JSON logging + `RequestIdMiddleware` (`x-request-id`) |

## Module shape

```
modules/<name>/
├── models.py        SQLAlchemy models (Base + TimestampMixin)
├── schemas.py       Pydantic request/response models
├── service.py       business logic: async functions, `session` first, never commit
├── router.py        public / buyer endpoints (thin)
└── admin_router.py  `/admin/...` endpoints, dependencies=[Depends(require_admin)]
```

Request flow: router → service → models. The request session (`SessionDep`) commits at the end of the
request and rolls back if anything raises. Services raise `DomainError` subclasses, never `HTTPException`.

## Modules and endpoints

| Module | Tables | Public / buyer endpoints | Admin endpoints |
| --- | --- | --- | --- |
| auth | `password_reset_tokens` | `POST /auth/register, /login, /logout, /refresh, /password/forgot, /password/reset` (rate limited) | — |
| users | `users`, `addresses` | `GET/PATCH /me`, `GET/POST/PATCH/DELETE /me/addresses` | `GET /admin/users`, `POST /admin/users/{id}/lock, /unlock` |
| catalog | `categories`, `books`, `book_images` | `GET /categories`, `GET /books` (search/filter, paginated), `GET /books/{slug}` | `GET/POST/PATCH/DELETE /admin/books`, `POST /admin/books/{id}/mark-sold`, `GET/POST/PATCH/DELETE /admin/categories` |
| media | (uses `book_images`) | — | `POST/PUT /admin/books/{id}/images`, `DELETE /admin/books/{id}/images/{image_id}` |
| cart | `carts`, `cart_items` | `GET /cart`, `PUT/DELETE /cart/items/{book_id}`, `DELETE /cart` | — |
| orders | `orders`, `order_items`, `order_status_history` | `POST/GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` | `GET /admin/orders`, `GET /admin/orders/{id}`, `POST /admin/orders/{id}/transition` |
| reservations | `reservations` | `POST/GET /reservations`, `POST /reservations/{id}/cancel` | `GET /admin/reservations`, `POST /admin/reservations/{id}/cancel` |
| book_requests | `book_requests` | `POST/GET /book-requests` | `GET /admin/book-requests`, `POST /admin/book-requests/{id}/resolve` |
| reports | — (read-only queries) | — | `GET /admin/reports/revenue, /summary, /best-sellers, /low-stock`, `GET /admin/inventory/overview` |
| inventory | — (service only) | — | — |
| mail | — | `Mailer` port: `ConsoleMailer` (dev) / `SmtpMailer` (`MAIL_BACKEND`) | — |

## Domain rules

- **Inventory** (`modules/inventory/service.py`): the only code that reads or changes `books.quantity`.
  Available stock = `quantity` − items in pending orders − active, unexpired reservations.
  `Inventory(session)` exposes `available`, `allocate` (row locks in id order, raises `OutOfStock`),
  `commit`, `release`, `set_quantity`. An allocation is not a table: it comes from the order items and
  reservations inserted in the same transaction.
- **Order status** (`orders/state_machine.py`): `pending → confirmed → shipping → completed`, and
  `cancelled` from any non-final state. Buyers can only cancel `pending`; admins can make any legal move.
  Use `may_transition` / `allowed_targets`. Every change is written to `order_status_history`.
- **Payment**: `cod` or `bank_transfer` (bank details from `BANK_TRANSFER_INFO`). No online payment.
- **Reservations**: statuses `active | converted | cancelled | expired`. Held for `RESERVATION_HOLD_DAYS`,
  at most `MAX_ACTIVE_RESERVATIONS` per user. `jobs/expire_reservations.py` expires them every 10 minutes.
- **Book requests**: `pending | available | rejected`, resolved by an admin.
- **Search** (`catalog/search.py`): full-text search on `immutable_unaccent(title || author)` plus
  `pg_trgm` similarity (threshold 0.3) for typos. Sorts: `newest`, `price_asc`, `price_desc`, `relevance`.
- **Money** is integer VND. **Condition** is `condition_pct` 10–100. Slugs come from `catalog.service.slugify`.

## Auth

- httpOnly cookies `access_token` (JWT with `sub`, `role`, TTL `ACCESS_TOKEN_TTL_MIN`) and `refresh_token`
  (`REFRESH_TOKEN_TTL_DAYS`). `COOKIE_SECURE=true` in production.
- Roles: `buyer`, `admin`. Locked users get `403 ACCOUNT_LOCKED`.

## Errors

The frontend maps `code` to its message. Base codes: `NOT_FOUND` 404, `CONFLICT` 409, `FORBIDDEN` 403,
`UNAUTHENTICATED` 401, `VALIDATION_ERROR` 422 (`details.fields[]`), `OUT_OF_STOCK`, `BOOK_UNAVAILABLE`,
`CART_EMPTY`, `INVALID_TRANSITION`, `HTTP_<status>`. Module-specific codes use `DomainError(msg, code="...")`.
Any new code must also be added to `frontend/src/lib/error-messages.ts`.

## Migrations

- Files `NNNN_<name>.py` with `revision = "NNNN"`, `down_revision` = the previous number. Written by hand.
- Import every new models module in `alembic/env.py`.
- Postgres enums: `postgresql.ENUM(..., create_type=False)` then `.create(op.get_bind(), checkfirst=True)`.
- `immutable_unaccent()` and the search indexes are created in `0004_books.py`.
- The Docker backend runs `alembic upgrade head` on every start.

## Adding a feature (checklist)

1. Model in `modules/<name>/models.py` + migration + import in `alembic/env.py`.
2. Schemas in `schemas.py` (use `core/types.py` aliases).
3. Service functions in `service.py` (no commit, raise `DomainError`; stock goes through `Inventory`).
4. Router or admin router, then register it in `main.py`.
5. Restart the backend, then run `npm run gen:api` in `frontend/`.
