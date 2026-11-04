# Model: Project Setup (foundation)

Source: plan sections 1, 6 (P0), 8  |  Prototype: n/a

## Purpose
- [x] Runnable monorepo: Postgres + FastAPI + Next.js via `docker compose up`

## Repository
- [x] Create folders `backend/`, `frontend/`, `docs/prototype/`
- [x] `.env.example` with all variables from plan section 8
- [x] `.gitignore` (node_modules, .venv, .env, media, __pycache__)
- [x] `docker-compose.yml`: services `db` (postgres:16), `backend`, `frontend`

## Database
- [x] Postgres init: enable extensions `unaccent`, `pg_trgm`, `citext`
- [x] Volume for pgdata and for media

## Backend scaffold (`backend/`)
- [x] `pyproject.toml` (uv): fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic-settings, bcrypt, pyjwt, pillow, python-multipart, slowapi, apscheduler, ruff
- [x] `app/core/config.py` (pydantic-settings reading `.env`)
- [x] `app/core/db.py` (async engine, session dependency, `Base`)
- [x] `app/main.py` app factory with `/api/v1` prefix and `GET /api/v1/health`
- [x] Alembic init (`alembic.ini`, async `env.py`, baseline migration)
- [x] `backend/Dockerfile`

## Frontend scaffold (`frontend/`)
- [x] `create-next-app` (App Router, TypeScript, Tailwind, ESLint, `src/` dir)
- [x] Install shadcn/ui, TanStack Query, react-hook-form, zod, openapi-typescript, openapi-fetch, recharts
- [x] Script `gen:api` generating `src/lib/api/schema.d.ts` from backend OpenAPI
- [x] Folders: `src/app/(shop)`, `(auth)`, `admin`, `src/lib`, `src/features`, `src/components/ui`
- [x] Design tokens (colors, fonts, radius) in Tailwind config / CSS vars
- [x] `frontend/Dockerfile`

## Done
- [x] All bullets above complete
