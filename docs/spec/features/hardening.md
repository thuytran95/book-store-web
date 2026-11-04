# Feature: Hardening and Deployment

Routes: n/a  |  Role: ops  |  Prototype: n/a

## Backend
- [x] Rate limiting verified on login, register, forgot password
- [x] Structured JSON logs with request id on all requests
- [x] Seed command to create the first admin user
- [x] Seed command with sample categories and books (optional dev data)

## Database
- [x] Backup container in compose: daily `pg_dump`, 7-day retention

## Deployment
- [x] Production compose: nginx reverse proxy, HTTPS, media served by nginx
- [x] Production env checklist (strong `JWT_SECRET`, CORS origin, SMTP settings)

## Frontend
- [x] Mobile viewport pass on shop pages (375 px)
- [x] Error boundary and 404 pages
- [x] Escape all user-provided text (no `dangerouslySetInnerHTML`)

## Done
- [x] All bullets above complete
