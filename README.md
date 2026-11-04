# Book Store — hệ thống bán sách cũ

Web bán sách cũ cho shop nhỏ: khách xem/tìm sách, người mua đặt hàng và giữ sách, admin quản lý kho, đơn hàng và thống kê.

Hệ thống **không** gồm thanh toán online (VNPay/Momo), mã giảm giá, đánh giá/wishlist, thông báo email/Zalo, tích hợp vận chuyển hay import Excel.

## Kiến trúc

```
book-store-web/
├── backend/          FastAPI (Python 3.12)
├── frontend/         Next.js 15 (TypeScript)
├── docs/             kế hoạch và spec
├── docker-compose.yml
└── .env.example
```

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | FastAPI, SQLAlchemy 2 (async), Alembic, Pydantic Settings, `uv` |
| Database | PostgreSQL 16 (`unaccent`, `pg_trgm`, `citext`) |
| Chạy local | Docker Compose |

Frontend nói chuyện với backend qua REST `/api/v1`. Kiểu TypeScript được sinh từ OpenAPI (`npm run gen:api`). Tồn kho sách cũ đi qua một module `inventory` để tránh bán trùng một cuốn.

---

## Backend (`backend/`)

API REST, prefix **`/api/v1`**.

- Auth: đăng ký, đăng nhập, JWT cookie, quên mật khẩu
- Catalog: tìm/lọc sách, chi tiết sách, admin CRUD sách và danh mục
- Giỏ hàng, đơn hàng (COD / chuyển khoản), giữ sách, yêu cầu tìm sách
- Upload ảnh, thống kê admin
- Health: `GET /api/v1/health`
- Docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

Cổng mặc định: **8000**. Migration chạy tự động khi container backend start (`alembic upgrade head`).

---

## Frontend (`frontend/`)

Giao diện shop (mobile-first) và trang admin (desktop).

| Khu vực | Route |
| --- | --- |
| Cửa hàng | `/`, `/books`, `/books/[slug]` |
| Auth | `/login`, `/register`, `/forgot-password` |
| Người mua | `/cart`, `/checkout`, `/orders`, `/reservations`, `/account/...` |
| Admin | `/admin`, `/admin/books`, `/admin/orders`, ... |

Cổng mặc định: **3000**. Biến `NEXT_PUBLIC_API_URL` trỏ tới origin backend (không thêm `/api/v1`).

---

## Yêu cầu

**Cách nhanh (Docker):** Docker Desktop / Docker Engine + Compose.

**Chạy từng phần trên máy:**

- Python 3.12+ và [uv](https://docs.astral.sh/uv/)
- Node.js 22+
- PostgreSQL 16

---

## Cài đặt bằng Docker (khuyến nghị)

Từ thư mục gốc repo:

```bash
cp .env.example .env
docker compose up --build
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Đợi Postgres healthy, backend migrate, frontend `npm run dev`.

| Dịch vụ | URL |
| --- | --- |
| Shop | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/api/v1/docs |
| Postgres | `localhost:5432` (user/pass/db: `bookstore`) |

Dừng: `Ctrl+C`, hoặc `docker compose down`. Dữ liệu Postgres nằm trong volume `pgdata`.

### Dữ liệu mẫu

Sau khi backend đã lên:

```bash
docker compose exec backend python -m app.cli seed-admin --email admin@example.com --password secret --name "Admin"
docker compose exec backend python -m app.cli seed-demo
```

Đăng nhập admin: `admin@example.com` / `secret`. `seed-demo` thêm vài danh mục và sách nếu catalog đang trống.

---

## Cài đặt local (không Docker full-stack)

1. Copy env và sửa URL database về máy host:

```bash
cp .env.example .env
```

Trong `.env`, đổi:

```
DATABASE_URL=postgresql+asyncpg://bookstore:bookstore@localhost:5432/bookstore
MEDIA_ROOT=./backend/media
```

2. Tạo database Postgres `bookstore` (user/password trùng `.env`). Extension `unaccent`, `pg_trgm`, `citext` được bật bởi `backend/docker/init-db.sql` nếu dùng container `db`; nếu tự cài Postgres thì chạy file đó một lần.

### Backend

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Seed (từ `backend/`, env đã trỏ đúng DB):

```bash
uv run python -m app.cli seed-admin --email admin@example.com --password secret --name "Admin"
uv run python -m app.cli seed-demo
```

Chỉ chạy Postgres bằng Docker, backend/frontend trên máy:

```bash
docker compose up db
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Mở http://localhost:3000. Backend phải chạy trước nếu trang cần API.

Sinh lại client TypeScript sau khi đổi API:

```bash
npm run gen:api
```

---

## Biến môi trường chính

Xem đầy đủ trong [`.env.example`](.env.example).

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Postgres async (`postgresql+asyncpg://...`) |
| `JWT_SECRET` | Secret ký JWT — đổi khi deploy |
| `CORS_ORIGINS` | Origin frontend, ví dụ `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Origin backend, ví dụ `http://localhost:8000` |
| `MEDIA_ROOT` | Thư mục lưu ảnh |
| `MAIL_BACKEND` | `console` (dev) hoặc `smtp` |
| `BANK_TRANSFER_INFO` | Thông tin CK hiện khi checkout |

Production: dùng `docker-compose.prod.yml` (nginx + TLS). Checklist nằm cuối `.env.example`.

---

## Tài liệu thêm

- [docs/PLAN-codebase.md](docs/PLAN-codebase.md) — kế hoạch kỹ thuật
- [docs/spec/summary.md](docs/spec/summary.md) — checklist triển khai
- [docs/Outline hệ thống quản lý và bán sách cũ.md](docs/Outline%20hệ%20thống%20quản%20lý%20và%20bán%20sách%20cũ.md) — yêu cầu nghiệp vụ
