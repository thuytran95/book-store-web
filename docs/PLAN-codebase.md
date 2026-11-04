# Plan: Book Store Codebase (Used-Book Shop)

Source of requirements: [`Outline hệ thống quản lý và bán sách cũ.md`](./Outline%20h%E1%BB%87%20th%E1%BB%91ng%20qu%E1%BA%A3n%20l%C3%BD%20v%C3%A0%20b%C3%A1n%20s%C3%A1ch%20c%C5%A9.md)
Design vocabulary: `.agents/skills/codebase-design` (module, interface, seam, adapter, depth, leverage, locality).

| Layer    | Choice |
| -------- | ------ |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, react-hook-form + Zod v4 |
| Backend  | FastAPI, Python 3.12, SQLAlchemy 2.0 (async) + asyncpg, Alembic, Pydantic v2, `uv` |
| Database | PostgreSQL 16 (extensions: `unaccent`, `pg_trgm`) |
| Tooling  | Docker Compose, pytest + testcontainers, Vitest, Playwright, ESLint/Prettier, Ruff/mypy |

---

## 0. Guiding design decisions

1. **Few deep modules over many shallow layers.** We do not create a `repository → service → controller` stack for every entity. Simple CRUD (categories, addresses, book requests) stays shallow and lives in the router + a small service. Depth is spent where the business risk is: **stock allocation**, **order lifecycle**, **reservations**, and **catalog search**.
2. **The biggest risk is double-selling** (most used books have only one copy). Every path that consumes stock goes through one module, `inventory`, which owns row locking. No other module writes `books.quantity`.
3. **Postgres is local-substitutable, not a seam.** The repositories are not abstracted behind ports. Tests run against a real Postgres in a container (testcontainers). Adding an in-memory repository adapter would be a hypothetical seam with one real adapter.
4. **Only introduce a port where two adapters actually exist.** In v1 that is the `Mailer`, which has a console adapter (dev/test) and an SMTP adapter (prod, needed for forgot-password). Image storage uses local disk only, so no port is needed yet.
5. **The OpenAPI contract is the seam between frontend and backend.** The TypeScript client is generated from FastAPI's OpenAPI schema, so the frontend never hand-writes request/response types.
6. **Out of scope (v1):** online payment (VNPay/Momo), coupons, reviews/wishlist, email/Zalo *notifications*, shipping integrations, Excel import.

---

## 1. Repository layout

```
book-store-web/
├── docker-compose.yml          # postgres, backend, frontend (dev)
├── .env.example
├── docs/
│   ├── PLAN-codebase.md
│   └── prototype/              # put the UI prototype here (screens/Figma export)
├── backend/
│   ├── pyproject.toml
│   ├── alembic/ , alembic.ini
│   ├── app/
│   │   ├── main.py             # app factory, routers, middleware, error handlers
│   │   ├── core/
│   │   │   ├── config.py       # pydantic-settings
│   │   │   ├── db.py           # async engine, session dependency, transaction helper
│   │   │   ├── security.py     # bcrypt, JWT encode/decode
│   │   │   ├── deps.py         # current_user, require_admin
│   │   │   ├── errors.py       # DomainError hierarchy -> HTTP mapping
│   │   │   └── pagination.py   # Page[T], PageParams
│   │   ├── modules/
│   │   │   ├── auth/           # register, login, logout, forgot/reset password
│   │   │   ├── users/          # profile, addresses, admin lock/unlock
│   │   │   ├── catalog/        # books + categories (public search, admin CRUD)
│   │   │   ├── media/          # image upload, validation, compression
│   │   │   ├── inventory/      # DEEP: stock allocation, no router
│   │   │   ├── cart/
│   │   │   ├── orders/         # DEEP: checkout + lifecycle state machine
│   │   │   ├── reservations/   # DEEP: hold in-stock books for N days
│   │   │   ├── book_requests/
│   │   │   ├── reports/        # read-only statistics
│   │   │   └── mail/           # Mailer port + console/SMTP adapters
│   │   └── jobs/
│   │       └── expire_reservations.py
│   └── tests/
│       ├── conftest.py         # Postgres testcontainer, app client, factories
│       └── modules/...         # tests at module interfaces
└── frontend/
    ├── package.json
    ├── middleware.ts           # route guards (/account, /admin)
    ├── src/
    │   ├── app/
    │   │   ├── (shop)/...      # public + buyer routes
    │   │   ├── (auth)/...      # login, register, forgot/reset password
    │   │   └── admin/...       # admin routes
    │   ├── lib/
    │   │   ├── api/            # generated schema.d.ts + typed client
    │   │   ├── session.ts      # getSession() (server), useSession() (client)
    │   │   ├── format.ts       # VND currency, dates, condition labels
    │   │   └── validation/     # Zod v4 schemas for forms
    │   ├── features/           # feature modules (catalog, cart, orders, ...)
    │   └── components/ui/      # shadcn/ui primitives + shared layout
    └── tests/ (vitest) , e2e/ (playwright)
```

Each backend module contains only the files it needs: `router.py`, `service.py`, `schemas.py`, `models.py`. A module's **interface** is what other modules may import from its `__init__.py`. Everything else in the module is private.

---

## 2. Database schema (PostgreSQL)

Money is stored as `BIGINT` VND (no decimals). Every table has `created_at` and `updated_at` (`timestamptz`).

| Table | Key columns | Notes |
| --- | --- | --- |
| `users` | id, email (unique, citext), password_hash, full_name, phone, role (`buyer`/`admin`), is_locked | bcrypt hash |
| `password_reset_tokens` | id, user_id, token_hash, expires_at, used_at | single-use, 30 min |
| `addresses` | id, user_id, recipient, phone, line, ward, district, province, is_default | partial unique index on default per user |
| `categories` | id, name (unique), slug (unique) | |
| `books` | id, category_id (FK, `RESTRICT`), title, slug, author, publisher, published_year, cost_price, sale_price, condition_pct (smallint 10–100), description, quantity (≥0), is_visible, search_vector (generated tsvector) | GIN index on `search_vector`, trigram index on `unaccent(title)`, `unaccent(author)` |
| `book_images` | id, book_id, url, position | |
| `carts` | id, user_id (unique) | one cart per user |
| `cart_items` | cart_id, book_id, quantity | PK (cart_id, book_id) |
| `orders` | id, code, user_id, status, payment_method (`cod`/`bank_transfer`), shipping snapshot (recipient, phone, address text), subtotal, shipping_fee, total, note, cancelled_reason | `status` enum below |
| `order_items` | id, order_id, book_id, title_snapshot, unit_price, quantity | price snapshot at checkout |
| `order_status_history` | id, order_id, from_status, to_status, actor_id, at | audit trail |
| `reservations` | id, user_id, book_id, quantity, status, expires_at | status: `active`/`converted`/`cancelled`/`expired` |
| `book_requests` | id, user_id, title, author, note, status, admin_note | status: `pending`/`available`/`rejected` |

**Order status machine** (owned by `orders`):

```
pending ──confirm──▶ confirmed ──ship──▶ shipping ──complete──▶ completed
   │                     │                   │
   └──cancel─────────────┴──cancel───────────┘──▶ cancelled
```

Buyers can cancel only from `pending`. Admins can cancel from `pending`, `confirmed`, or `shipping`.

"Sold" and "out of stock" are **derived** from `quantity = 0`. The admin's "mark sold" action sets quantity to 0 through `inventory`. Hiding a book uses `is_visible`.

---

## 3. Backend deep modules

### 3.1 `inventory`: the anti-double-selling module (deep, no router)

**Interface** (the only code allowed to reason about stock):

```python
class Inventory:
    async def available(self, book_ids: list[int]) -> dict[int, int]: ...
    async def allocate(self, lines: list[StockLine], owner: Owner) -> None:
        """Raises OutOfStock(book_id, requested, available). All-or-nothing."""
    async def commit(self, owner: Owner) -> None:
        """Turns allocation into a real deduction of books.quantity."""
    async def release(self, owner: Owner) -> None:
        """Frees an allocation (or restores quantity if already committed)."""
    async def set_quantity(self, book_id: int, quantity: int) -> None:  # admin edit / mark sold
```

`Owner` is `Order(id)` or `Reservation(id)`.

**Invariants a caller must know:**
- It must run inside the caller's DB transaction (it receives the `AsyncSession`). It never commits on its own.
- `allocate` takes `SELECT … FOR UPDATE` row locks on `books` in **ascending id order**, which prevents deadlocks.
- `available = quantity − Σ(pending/unconfirmed order items) − Σ(active, unexpired reservations not owned by the caller)`.
- Expired reservations are ignored **lazily** in the `available` calculation. Correctness does not depend on the expiry job; the job only tidies up statuses.

**How this matches the outline:** the outline says stock is deducted when the admin confirms an order and restored on cancel. `commit`/`release` do exactly that. Without `allocate`, two buyers could both check out the last copy while their orders are `pending`. With it, the second checkout fails immediately with `409 OUT_OF_STOCK`.

**Alternative considered (design-it-twice):** decrement `quantity` immediately at checkout. This is simpler, but it conflicts with the outline's "deduct on confirm" rule and makes `quantity` meaningless while orders are pending. A separate `stock_allocations` table was also considered. It is equally valid, but deriving allocations from `order_items` + `reservations` avoids a second source of truth. Callers cannot tell which option is used, because the choice is hidden behind the interface.

**Tests (at the interface, real Postgres):**
- Two concurrent `allocate` calls for a book with qty 1: exactly one succeeds.
- A reservation hides the book from others but not from its owner when converting.
- An expired reservation no longer blocks availability, even if the job hasn't run.
- `release` after `commit` restores quantity.

### 3.2 `orders`: checkout and lifecycle (deep)

```python
async def place_order(user: User, address_id: int, payment: PaymentMethod,
                      note: str | None, reservation_ids: list[int] = []) -> Order
async def transition(order_id: int, to: OrderStatus, actor: User,
                     reason: str | None = None) -> Order
async def list_orders(filter: OrderFilter, page: PageParams) -> Page[OrderSummary]
async def get_order(order_id: int, viewer: User) -> OrderDetail
```

`place_order` hides all of this behind one call: reading the cart, re-checking visibility and price, `inventory.allocate`, snapshotting prices and the address, computing totals, clearing the cart, and converting the used reservations. All of it happens in one transaction.

`transition` owns the state machine table, the permission rules (who may make which move), the `inventory.commit` call on confirm, the `inventory.release` call on cancel, and the history row. Routers never set `order.status` directly.

Error modes: `OutOfStock`, `CartEmpty`, `BookUnavailable`, `InvalidTransition`, `Forbidden`.

### 3.3 `reservations` (deep)

```python
async def reserve(user: User, book_id: int, quantity: int = 1) -> Reservation  # hold for HOLD_DAYS (config)
async def cancel(reservation_id: int, actor: User) -> None
async def expire_due(now: datetime) -> int   # used by the job; idempotent
```

`reserve` uses `inventory.allocate`. A reservation is consumed by passing its id to `orders.place_order`. A per-user limit on active reservations is set in config (default 3) to prevent hoarding.

### 3.4 `catalog`: search (deep read path) + admin CRUD (shallow)

```python
async def search_books(q: BookQuery) -> Page[BookCard]
# BookQuery: text, category_slug, price_min, price_max, condition_min,
#            in_stock_only, sort (newest|price_asc|price_desc|relevance), page, size
async def get_book(slug: str) -> BookDetail      # includes available qty from inventory
```

The search implementation combines Postgres full-text search, `unaccent` for Vietnamese diacritics (so "tieng viet" matches "tiếng Việt"), and `pg_trgm` for typos. Callers only see `BookQuery → Page`.

Admin CRUD covers books and categories. Deleting a category is blocked with `409 CATEGORY_NOT_EMPTY` unless `move_to_category_id` is provided. In that case the books are moved and the category is deleted in one transaction.

### 3.5 Smaller modules

| Module | Interface highlights |
| --- | --- |
| `auth` | `register`, `login` → sets an httpOnly `access_token` cookie (JWT, 1 day) and refresh rotation; `logout`; `request_password_reset(email)` (always returns 202); `reset_password(token, new)`. Locked users cannot log in. |
| `users` | `me`, `update_profile`, address CRUD with a single default; admin `list_users`, `set_locked`. |
| `cart` | `get_cart`, `set_item(book_id, qty)` (qty 0 = remove), `clear`. It validates against `inventory.available` for display but does **not** allocate. |
| `book_requests` | buyer `create`, `list_mine`; admin `list`, `resolve(id, status, admin_note)`. |
| `media` | `save_image(upload) -> url`: max 5 MB, JPEG/PNG/WebP only (verified with Pillow, not the file extension), resized to max 1600 px, re-encoded to WebP, and stored at `MEDIA_ROOT`. Served by FastAPI `StaticFiles` (nginx in prod). |
| `reports` | `revenue(granularity=day|month, from, to)`, `order_counts`, `best_sellers(limit)`, `low_stock(threshold)`. Revenue counts `completed` orders only. |
| `mail` | `Mailer` port: `ConsoleMailer` (dev/test, captures messages) and `SmtpMailer` (prod). Used only for password reset in v1. |

### 3.6 Cross-cutting

- **Errors:** services raise `DomainError` subclasses carrying a stable `code`. One handler maps them to `{"error": {"code", "message", "details"}}` with the right HTTP status. The frontend switches on `code`, never on message text.
- **AuthZ:** `Depends(current_user)` and `Depends(require_admin)` at the router level. Every `/api/admin/*` router mounts `require_admin`.
- **Validation:** Pydantic v2 schemas on every input, with constrained types for price ≥ 0, condition 10–100, and phone format.
- **Security:** SQLAlchemy parameterized queries only. CORS is limited to the frontend origin. Rate limiting (slowapi) on login, register, and reset. Responses are JSON only, and the frontend escapes output, which prevents XSS.
- **Logging:** structured JSON logs with a request id middleware.
- **Backups:** a `pg_dump` cron container in compose (daily, 7-day retention).

---

## 4. HTTP API (`/api/v1`)

**Public / buyer**

| Method & path | Purpose |
| --- | --- |
| `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh` | Account |
| `POST /auth/password/forgot`, `/auth/password/reset` | Password reset |
| `GET/PATCH /me`, `GET/POST/PATCH/DELETE /me/addresses[/{id}]` | Profile & addresses |
| `GET /categories` | Category list |
| `GET /books?text=&category=&price_min=&price_max=&condition_min=&in_stock=&sort=&page=&size=` | Search/browse |
| `GET /books/{slug}` | Detail |
| `GET /cart`, `PUT /cart/items/{book_id}`, `DELETE /cart/items/{book_id}` | Cart |
| `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` | Orders |
| `POST /reservations`, `GET /reservations`, `POST /reservations/{id}/cancel` | Holds |
| `POST /book-requests`, `GET /book-requests` | Book requests |

**Admin** (`/admin/...`, requires the admin role)

| Method & path | Purpose |
| --- | --- |
| `GET/POST /admin/books`, `GET/PATCH/DELETE /admin/books/{id}`, `POST /admin/books/{id}/images` | Book management |
| `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/{id}?move_to=` | Categories |
| `GET /admin/orders?status=`, `GET /admin/orders/{id}`, `POST /admin/orders/{id}/transition` | Orders |
| `GET /admin/reservations`, `POST /admin/reservations/{id}/cancel` | Holds |
| `GET /admin/book-requests`, `POST /admin/book-requests/{id}/resolve` | Requests |
| `GET /admin/users`, `POST /admin/users/{id}/lock`, `/unlock` | Users |
| `GET /admin/reports/revenue`, `/summary`, `/best-sellers`, `/low-stock` | Stats |

---

## 5. Frontend design

### 5.1 Deep modules on the frontend

| Module | Interface | Hidden behind it |
| --- | --- | --- |
| `lib/api` | `api.GET/POST/...(path, { params, body })`, fully typed from `schema.d.ts` (openapi-typescript + openapi-fetch) | base URL, cookie forwarding in server components, error envelope → `ApiError(code)`, 401 → refresh → retry |
| `lib/session` | `getSession()` (server), `useSession()` (client) → `{ user, role } \| null` | reading the cookie, calling `/me`, caching |
| `middleware.ts` | route rules: `/account/**`, `/checkout`, `/orders/**` need login; `/admin/**` needs admin | redirect to `/login?next=` |
| `features/cart` | `useCart()` → `{ items, total, setQty, remove }` | TanStack Query cache, optimistic updates, rollback on `OUT_OF_STOCK` |
| `features/catalog` | `<BookFilters/>` + `useBookQuery()` keeping filters in the URL search params | URL ⇄ `BookQuery` mapping, debounce |
| `lib/format` | `formatVnd`, `formatDate`, `conditionLabel`, `orderStatusLabel/color` | locale details (vi-VN) |

The rendering strategy is that catalog pages (home, list, detail) are **Server Components**, which is better for SEO and fast on mobile. Cart, checkout, account, and the whole admin area are Client Components that use TanStack Query.

Forms use react-hook-form with Zod v4 schemas in `lib/validation`. These schemas mirror the backend constraints. The server stays the source of truth, and its field errors are mapped back onto the form.

### 5.2 Screens (implement against the prototype)

> **Prototype:** no prototype file is in the repo yet. Put it in `docs/prototype/` (images, PDF, or Figma link). Step F0 below maps every prototype screen to a route in this table before any UI work starts. The routes below come from the outline and may be renamed to match the prototype.

**Shop (mobile-first)**

| Route | Screen | Key elements |
| --- | --- | --- |
| `/` | Home | search bar, categories, newest books, "almost gone" books |
| `/books` | Book list | filters (category, price range, condition), sort, pagination, filter drawer on mobile |
| `/books/[slug]` | Book detail | image gallery, price, condition badge, available qty, Add to cart, Reserve |
| `/cart` | Cart | line items, qty, remove, total, checkout CTA |
| `/checkout` | Checkout | address picker/new address, COD / bank transfer (shows shop account info), note, place order |
| `/orders`, `/orders/[id]` | Order history / detail | status timeline, cancel button while `pending` |
| `/reservations` | My holds | countdown to expiry, cancel, "buy now" |
| `/book-requests` | Request a book | form + list with status chips |
| `/account/profile`, `/account/addresses` | Account | profile form, address book |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth | |

**Admin (desktop-first, still usable on tablet)**

| Route | Screen |
| --- | --- |
| `/admin` | Dashboard: revenue chart (day/month), order counts by status, best sellers, low stock |
| `/admin/books`, `/admin/books/new`, `/admin/books/[id]` | Book table (search, filter, visibility toggle, mark sold) + form with image upload |
| `/admin/categories` | Category CRUD, delete dialog with "move books to…" |
| `/admin/orders`, `/admin/orders/[id]` | Status tabs, detail with allowed transitions only |
| `/admin/reservations` | Active/expired holds, cancel |
| `/admin/book-requests` | Resolve as available/rejected with a note |
| `/admin/users` | User list, lock/unlock |

**Shared UI kit** (`components/ui`, based on shadcn): `Button`, `Input`, `Select`, `Dialog`, `Sheet` (mobile drawer), `Table`, `Badge`, `Pagination`, `Toast`, `Skeleton`, `EmptyState`, `PriceTag`, `ConditionBadge`, `OrderStatusBadge`, `ImageUploader`, `ShopLayout` (header with search + cart count, bottom nav on mobile), `AdminLayout` (sidebar).

---

## 6. Implementation phases

Each phase ends with something runnable and tested.

| Phase | Scope | Done when |
| --- | --- | --- |
| **P0. Scaffolding** | Monorepo, docker-compose (Postgres 16 + extensions), FastAPI app factory, settings, async DB session, Alembic baseline, error envelope, Next.js app with Tailwind + shadcn, OpenAPI → TS codegen script (`npm run gen:api`), lint/format, CI (lint + tests) | `docker compose up` serves `/api/v1/health` and the Next.js home page; CI green |
| **F0. Prototype mapping** | Add the prototype to `docs/prototype/`, map screens to routes, extract design tokens (colors, fonts, radius, spacing) into `tailwind.config` / CSS vars, build `ShopLayout` + `AdminLayout` + UI kit | Layouts match the prototype on 375 px and 1280 px |
| **P1. Auth & users** | users, addresses, password reset tables; `auth`, `users`, `mail` modules; middleware guards; login/register/forgot/reset/profile/address pages; seed admin command | Buyer can register/login; non-admin gets 403 on `/api/v1/admin/*` and is redirected away from `/admin` |
| **P2. Catalog** | categories, books, images; `catalog`, `media`; search with unaccent + trigram; public list/detail pages; admin book & category screens | Admin creates a book with images; buyer finds it by an unaccented, misspelled author name |
| **P3. Inventory + cart + orders** | `inventory`, `cart`, `orders` modules; cart, checkout, order history pages; admin order screens with transitions | Concurrency test passes (2 checkouts, 1 copy → one 409); confirm deducts stock, cancel restores it |
| **P4. Reservations & book requests** | `reservations` + expiry job (APScheduler in-process, every 10 min), `book_requests`; buyer + admin screens | Reserved book shows 0 available to others; after expiry it is available again without running the job |
| **P5. Reports & admin users** | `reports` queries, dashboard charts (Recharts), user lock/unlock | Dashboard numbers match seeded fixture data |
| **P6. Hardening** | Rate limiting, request-id logging, backup container, Playwright e2e for the main journeys, Lighthouse mobile pass, production compose (nginx + HTTPS) | e2e green: browse → cart → checkout → admin confirm → completed |

---

## 7. Testing strategy

Following "the interface is the test surface" and "replace, don't layer":

- **Backend:** tests call module interfaces (`orders.place_order`, `inventory.allocate`, …) and HTTP routes through `httpx.AsyncClient`, against a **real Postgres** started once per session with testcontainers. Each test is wrapped in a rolled-back transaction. There is no repository mocking, and the only test adapter is `ConsoleMailer`.
- **Must-have scenarios:** concurrent checkout of the last copy; order state machine (every allowed and forbidden transition, buyer vs admin); stock restored on cancel after confirm; lazy reservation expiry; category delete guard; locked user cannot log in; admin routes reject buyers; image upload rejects a renamed `.exe`.
- **Frontend:** Vitest for `lib/format`, Zod schemas, and the URL ⇄ `BookQuery` mapping. Playwright e2e for the buyer journey, the admin order flow, and the mobile viewport.
- **Contract:** CI runs `gen:api` and fails if `schema.d.ts` changed but wasn't committed, so frontend/backend drift is caught.

---

## 8. Configuration (`.env.example`)

```
DATABASE_URL=postgresql+asyncpg://bookstore:bookstore@db:5432/bookstore
JWT_SECRET=change-me
ACCESS_TOKEN_TTL_MIN=60
REFRESH_TOKEN_TTL_DAYS=14
RESERVATION_HOLD_DAYS=3
MAX_ACTIVE_RESERVATIONS=3
MEDIA_ROOT=/data/media
MAX_UPLOAD_MB=5
MAIL_BACKEND=console        # console | smtp
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASSWORD=
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
BANK_TRANSFER_INFO="Vietcombank - 0123456789 - NGUYEN VAN A"
```

---

## 9. Open questions

1. **Prototype:** where is it (Figma link or image files)? This is needed before F0.
2. **Shipping fee:** flat fee, free above a threshold, or entered manually by the admin on confirm?
3. **Bank transfer:** does the admin confirm payment manually before `confirmed`, or is it treated like COD?
4. **Reservation hold length and limit:** defaults are 3 days and 3 active holds per user. Please confirm.
5. **Forgot password delivery:** SMTP is required in production. Email *notifications* are out of scope, but a reset email is not optional. Is that acceptable?
