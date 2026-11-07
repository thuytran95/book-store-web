# Book Store — used-book shop + admin

Monorepo: `backend/` (FastAPI, Python 3.12, async SQLAlchemy 2, Alembic, PostgreSQL 16) and
`frontend/` (Next.js 15 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui on `@base-ui/react`,
TanStack Query, react-hook-form + zod v4). REST API under `/api/v1`. UI copy is Vietnamese.

Out of scope by design (don't add unless asked): online payment, coupons, reviews/wishlist,
email/Zalo notifications, shipping integrations, Excel import. Removed on purpose (see
`docs/de-xuat-xoa-chuc-nang-du-thua.md`): book requests, reservations, forgot/reset password + mail,
revenue/best-seller reports, saved address book, mark-sold, cost price.

# Commands

Full stack (from repo root):
- Start: `docker compose up --build` (needs `.env`, copy from `.env.example`)
- Seed admin: `docker compose exec backend python -m app.cli seed-admin --email admin@example.com --password secret --name "Admin"`
- Seed demo catalog: `docker compose exec backend python -m app.cli seed-demo`
- URLs: shop http://localhost:3000, API http://localhost:8000, Swagger http://localhost:8000/api/v1/docs

Backend (`cd backend`, uses `uv`):
- Install: `uv sync`
- Run: `uv run uvicorn app.main:app --reload --port 8000`
- Migrate: `uv run alembic upgrade head`
- Lint/format: `uv run ruff check .` / `uv run ruff format .`

Frontend (`cd frontend`, uses **npm**, not pnpm):
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Regenerate API types: `npm run gen:api` (backend must be running on localhost:8000)

There is no test suite in either app.

# Architecture

## Backend (`backend/app/`)
- `main.py` builds the app and registers every router under `/api/v1`; media served at `/media`.
- `core/`: `config.py` (pydantic-settings), `db.py` (`Base`, `TimestampMixin`, `get_session`),
  `deps.py` (`SessionDep`, `CurrentUser`, `AdminUser`, `require_admin`), `errors.py`,
  `pagination.py` (`PageDep`, `Page[T]`), `types.py` (`Money`, `Phone`, `ConditionPct`, ...).
- `modules/<name>/`: `models.py`, `schemas.py`, `service.py`, `router.py` (buyer/public) and
  `admin_router.py` (prefix `/admin`, `dependencies=[Depends(require_admin)]`).
  Modules: auth, users, catalog (+ `search.py`), cart, orders (+ `state_machine.py`), inventory, media,
  reports (`inventory_router.py`: admin inventory overview only).
- `cli.py`: `seed-admin`, `seed-demo`.

## Frontend (`frontend/src/`)
- `app/`: route groups `(shop)` (storefront, buyer pages), `(auth)` (login/register), `admin/`.
  Pages are thin: they render a component from `features/`.
- `features/<domain>/components|hooks/`: domain UI and TanStack Query hooks (re-exported from `hooks/index.ts`).
  `features/catalog/server.ts` holds cached server-side fetchers for RSC pages.
- `components/ui/` (shadcn primitives), `components/layout/` (shop/admin shells), `components/shared/`.
- `lib/api/`: `client.ts` (`api` for client components, auto refresh-on-401), `server.ts`
  (`serverApi()` forwards cookies, `publicApi(revalidate)` cacheable/cookie-free), `errors.ts` (`ApiError`),
  `schema.d.ts` (generated, don't hand-edit).
- `lib/`: `error-messages.ts`, `forms.ts` (`applyServerErrors`), `format.ts` (`formatVnd`, `formatDate`,
  `conditionLabel`), `session.ts` (`useSession`), `toast.ts`, `validation/*.ts` (zod schemas).
- `middleware.ts`: route guard for logged-in and `/admin` pages.

# Conventions

Backend
- Routers stay thin; logic lives in `service.py` as async functions taking `session` first.
- Services never commit. `get_session` commits once per request (CLI uses `_run` in `cli.py`).
- Raise `DomainError` subclasses from `core/errors.py` (`NotFound`, `Conflict`, `Forbidden`, `OutOfStock`, ...)
  or `DomainError(msg, code="SOME_CODE")`. Never `HTTPException`. Every error goes out as
  `{"error": {"code", "message", "details"}}`, and the frontend switches on `code`.
- Stock: only `modules/inventory` may read or change `books.quantity` / availability. Use `Inventory(session)`,
  don't compute availability or touch quantity elsewhere.
- Order status changes go through `orders/state_machine.py` (`may_transition`, `allowed_targets`).
- Money is integer VND (`Money`). Book condition is `condition_pct` 10–100.
- Paginated lists: `PageDep` param, return `Page.of(items, total, params)`.
- Slugs via `catalog.service.slugify` (handles Vietnamese `đ`).
- Ruff: line length 100, rules E, F, I, UP, B.

Frontend
- Call the API only through the typed `openapi-fetch` clients in `lib/api/`. Never raw `fetch`.
- Get types from the schema: `components["schemas"]["X"]`, not hand-written duplicates.
- User-facing error text comes from `lib/error-messages.ts` keyed by `ApiError.code`. Add new backend
  codes there. Never show or match the server `message`.
- Forms: react-hook-form + zod schema from `lib/validation/`, `applyServerErrors` for 422s.
- Notifications through `lib/toast.ts`, not `sonner` directly.
- Format money/dates with `lib/format.ts`.
- Import alias `@/` = `src/`. Files kebab-case; components named exports.
- Icons: `lucide-react`, or `MaterialIcon` (`features/home/components/material-icon.tsx`) for designs
  from the prototypes.

# Workflow

- Detailed architecture: `docs/architecture/backend.md` and `docs/architecture/frontend.md`. Update them
  when you add a module, table, endpoint, route or shared convention.

- Feature specs live in `docs/spec/<task-slug>/` (model → api → hook → component → features) and are worked
  with the `.agents/skills/spec-checklist` and `spec-implement` skills: one bullet at a time, tick `[x]`
  right after it's done, no tests.
- UI prototypes (HTML + screenshot) live in `docs/prototype/<screen>/` and `screen/`. Match them when a spec references one.
- Business requirements: `docs/Outline hệ thống quản lý và bán sách cũ.md`.

# Gotchas

- Changing a backend schema or endpoint: restart the backend, then run `npm run gen:api` and commit the
  updated `src/lib/api/schema.d.ts`. Otherwise the frontend types drift.
- Alembic migrations are hand-numbered (`0001_...`, revision `"0010"`, `down_revision = "0009"`). Follow
  that rather than autogenerate hashes. New model modules must be imported in `alembic/env.py`. Postgres
  enums use `postgresql.ENUM(..., create_type=False)` + `.create(checkfirst=True)`.
- Search depends on Postgres extensions `unaccent`, `pg_trgm`, `citext` (created by `backend/docker/init-db.sql`;
  run it once on a non-Docker Postgres) and the `immutable_unaccent` SQL function (created in migration `0004_books.py`).
- The backend container runs `alembic upgrade head` on every start.
- Running the backend outside Docker: set `DATABASE_URL` to `localhost` (not `db`) and `MEDIA_ROOT=./backend/media`
  in `.env`. Settings read `.env` and `../.env`.
- `NEXT_PUBLIC_API_URL` is the backend origin **without** `/api/v1`. Server Components in Docker use
  `API_INTERNAL_URL` (`http://backend:8000`).
- Auth is httpOnly cookies (`access_token`, `refresh_token`). `serverApi()` cannot refresh tokens, so only the browser client does.
- Adding a protected route: update both `LOGIN_PATHS`/`ADMIN_PATH` and `config.matcher` in `middleware.ts`.
  The middleware only routes; the API enforces auth.
- `node_modules` and `.venv` are anonymous Docker volumes. After adding a dependency, rebuild (`docker compose up --build`).
- Production: `docker-compose.prod.yml` + `deploy/nginx.conf` (TLS certs in `deploy/certs/`), daily
  `pg_dump` via `deploy/backup.sh` into `backups/`.
