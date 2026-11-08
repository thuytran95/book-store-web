# Backend architecture

FastAPI (Python 3.12) · SQLAlchemy 2 async + asyncpg · Alembic · PostgreSQL 16 · pydantic-settings · `uv`.
All endpoints are under `/api/v1`. Swagger: `/api/v1/docs`, OpenAPI: `/api/v1/openapi.json`.

## Layout

```
backend/
├── alembic/versions/        hand-numbered migrations 0001 … 0011
├── docker/init-db.sql       creates extensions unaccent, pg_trgm, citext
└── app/
    ├── main.py              create_app(): error handlers, rate limit, request-id, CORS, routers, /media
    ├── cli.py               seed-admin, seed-demo
    ├── core/                shared infrastructure (see below)
    └── modules/<name>/      one folder per business module
```

## Core (`app/core/`)

| File | Role |
| --- | --- |
| `config.py` | `Settings` / `get_settings()`; reads `.env` and `../.env` |
| `db.py` | `engine`, `SessionLocal`, `Base`, `TimestampMixin` (created_at/updated_at), `get_session` (commit once per request) |
| `deps.py` | `SessionDep`, `CurrentUser`, `AdminUser`, `require_admin`; reads the `access_token` cookie |
| `security.py` | bcrypt hashing, JWT access/refresh tokens |
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
| auth | — | `POST /auth/register, /login, /logout, /refresh` (rate limited) | — |
| users | `users` (`locked_at` set on lock, cleared on unlock) | `GET/PATCH /me` | `GET /admin/users` (`search` = name accent-insensitive / email / phone digits ≥ 3, `status` = `active`/`locked`; returns `AdminUserRead` with `locked_at`, `order_count`, `active_order_count`), `GET /admin/users/counts` (`all`, `active`, `locked`, `new_this_week`), `POST /admin/users/{id}/lock, /unlock` (return `AdminUserRead`; `CANNOT_LOCK_SELF`, `CANNOT_LOCK_ADMIN`: admin accounts are never lockable) |
| catalog | `categories`, `authors`, `book_authors`, `books`, `book_images` | `GET /categories`, `GET /books` (search/filter, paginated), `GET /books/{slug}` | `GET/POST/PATCH/DELETE /admin/books` (`?author_id=`, `?stock=in_stock|out_of_stock|hidden`, `?condition_max=` filters; `text` also matches stock code `MS-00012`; body `author_ids`; PATCH `quantity` goes through `Inventory.set_quantity`), `POST /admin/books/bulk` (`{ids, action: hide|show|delete}` → `{updated, deleted, hidden}`), `GET/POST/PATCH/DELETE /admin/categories`, `GET/POST/PATCH/DELETE /admin/authors` (`?q=`, paginated; delete takes `?merge_into=`) |
| media | (uses `book_images`) | — | `POST/PUT /admin/books/{id}/images`, `DELETE /admin/books/{id}/images/{image_id}` |
| cart | `carts`, `cart_items` | `GET /cart`, `PUT/DELETE /cart/items/{book_id}`, `DELETE /cart` | — |
| orders | `orders`, `order_items`, `order_status_history` | `POST/GET /orders` (body carries `ship_recipient`, `ship_phone`, `ship_address`), `GET /orders/{id}`, `POST /orders/{id}/cancel` | `GET /admin/orders` (`status`, `user_id`, `q` = code/recipient/phone, `code` alias of `q`, `sort` = `newest`/`oldest`/`total_desc`; returns `AdminOrderSummary` with `ship_recipient`, `ship_phone`, `copies`, `has_shortage`), `GET /admin/orders/counts` (global per-status counts + `stale_pending` = pending > 24 h), `GET /admin/orders/{id}` (adds `user_email`; items carry `author`, `condition_pct`, `short`), `POST /admin/orders/{id}/transition` |
| reports | — (read-only queries) | — | `GET /admin/inventory/overview` (totals, intake this week, status counts `in_stock_titles`/`out_of_stock_titles`/`hidden_titles`, `pending_orders`) |
| inventory | — (service only) | — | — |

## Domain rules

- **Inventory** (`modules/inventory/service.py`): the only code that reads or changes `books.quantity`.
  Available stock = `quantity` − items in pending orders.
  `Inventory(session)` exposes `available`, `shortages_for` (read-only: per order, books whose quantity no longer covers the line, i.e. what `commit` would reject), `allocate` (row locks in id order, raises `OutOfStock`),
  `commit`, `release`, `set_quantity` (raises `409 QUANTITY_BELOW_PENDING`, `details.pending`, when the new
  quantity is below copies held by pending orders). An allocation is not a table: it comes from the order items
  inserted in the same transaction.
- **Order status** (`orders/state_machine.py`): `pending → confirmed → shipping → completed`, and
  `cancelled` from any non-final state. Buyers can only cancel `pending`; admins can make any legal move.
  Use `may_transition` / `allowed_targets`. Every change is written to `order_status_history`.
- **Order items** store `price` (unit price at checkout) and `quantity`; the title, author and condition are read from `books`
  through `OrderItem.book` (books with orders cannot be deleted).
- **Payment**: `cod` or `bank_transfer` (bank details from `BANK_TRANSFER_INFO`). No online payment.
- **Search** (`catalog/search.py`): every word must appear (accent-insensitive `LIKE`) in
  `immutable_unaccent(title || author)`, or `pg_trgm` similarity (threshold 0.3) for typos. No tsvector column. Sorts: `newest`, `price_asc`, `price_desc`, `relevance`.
- **Authors** (`catalog`): `authors` (name unique on `lower(immutable_unaccent(name))`, no slug) linked to
  books many-to-many through `book_authors` (`position` = order). `books.author` is a display cache
  ("A, B") rebuilt only by `catalog.service._refresh_author_text` on book save and author rename/merge;
  search keeps using it. Deleting an author with books needs `merge_into` (`AUTHOR_IN_USE` otherwise).
- **Money** is integer VND. **Condition** is `condition_pct` 10–100. Slugs come from `catalog.service.slugify`.

## Auth

- httpOnly cookies `access_token` (JWT with `sub`, `role`, TTL `ACCESS_TOKEN_TTL_MIN`) and `refresh_token`
  (`REFRESH_TOKEN_TTL_DAYS`). `COOKIE_SECURE=true` in production.
- Roles: `buyer`, `admin`. Locked users get `403 ACCOUNT_LOCKED`.

## Errors

The frontend maps `code` to its message. Base codes: `NOT_FOUND` 404, `CONFLICT` 409, `FORBIDDEN` 403,
`UNAUTHENTICATED` 401, `VALIDATION_ERROR` 422 (`details.fields[]`), `OUT_OF_STOCK`, `BOOK_UNAVAILABLE`,
`CART_EMPTY`, `INVALID_TRANSITION`, `QUANTITY_BELOW_PENDING`, `HTTP_<status>`. Module-specific codes use `DomainError(msg, code="...")`.
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
