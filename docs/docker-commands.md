# Các lệnh Docker cơ bản

Project có 4 service trong `docker-compose.yml`: **db** (Postgres 16), **backend** (FastAPI, cổng 8000),
**frontend** (Next.js, cổng 3000) và **backup** (`pg_dump` mỗi ngày). Bản production
(`docker-compose.prod.yml`) có thêm **nginx**.

Tất cả lệnh dưới đây chạy từ thư mục gốc của repo.

## 1. Chuẩn bị lần đầu

```bash
cp .env.example .env
```

## 2. Khởi động và dừng

```bash
docker compose up --build        # build và chạy tất cả, log hiện ra terminal
docker compose up -d --build     # chạy nền
docker compose up -d backend     # chỉ chạy một service (db sẽ tự chạy theo)
docker compose ps                # xem trạng thái các container
docker compose stop              # dừng, giữ container
docker compose down              # dừng và xoá container, dữ liệu DB vẫn còn
docker compose down -v           # ⚠️ xoá luôn volume pgdata và media, MẤT HẾT DỮ LIỆU
docker compose restart backend   # khởi động lại một service
```

Địa chỉ:

- Shop: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/api/v1/docs

## 3. Xem log

```bash
docker compose logs -f                    # log tất cả service
docker compose logs -f backend            # log một service
docker compose logs --tail=100 frontend   # 100 dòng log cuối
```

## 4. Seed dữ liệu

```bash
docker compose exec backend python -m app.cli seed-admin --email admin@example.com --password secret --name "Admin"
docker compose exec backend python -m app.cli seed-demo
```

## 5. Migration (Alembic)

Backend tự chạy `alembic upgrade head` mỗi lần khởi động. Nếu muốn chạy tay:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend alembic current      # revision hiện tại
docker compose exec backend alembic downgrade -1 # quay lại 1 bước
```

## 6. Vào shell và database

```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec db psql -U bookstore -d bookstore
```

## 7. Lint và typecheck trong container

```bash
docker compose exec backend ruff check .
docker compose exec backend ruff format .
docker compose exec frontend npm run lint
docker compose exec frontend npx tsc --noEmit
```

## 8. Sau khi thêm dependency

`node_modules` và `.venv` nằm trong anonymous volume nên cần build lại:

```bash
docker compose up --build
# nếu vẫn dùng bản cũ, thêm -V để tạo lại anonymous volume:
docker compose up --build -V
```

## 9. Backup và restore DB

```bash
docker compose exec db pg_dump -U bookstore bookstore > backups/manual.sql          # backup tay
docker compose exec -T db psql -U bookstore -d bookstore < backups/manual.sql       # restore
```

Service `backup` cũng tự dump mỗi ngày vào `backups/`.

## 10. Production

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml down
```

Cần chuẩn bị trước:

- Cert TLS ở `deploy/certs/fullchain.pem` và `deploy/certs/privkey.pem`.
- Trong `.env`: `JWT_SECRET` mạnh, `CORS_ORIGINS` là domain thật, `NEXT_PUBLIC_API_URL` là domain thật
  (không có `/api/v1`), `POSTGRES_PASSWORD`, và `MAIL_BACKEND=smtp` kèm các biến `SMTP_*`.

## Lưu ý

Sau khi đổi schema hoặc endpoint ở backend, chạy `docker compose restart backend`, rồi chạy
`npm run gen:api` trong `frontend/` ở máy host (lệnh này gọi tới localhost:8000).
