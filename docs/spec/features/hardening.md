# Feature: Hardening and Deployment

Routes: n/a  |  Role: ops  |  Prototype: n/a

## Backend
- [ ] Rate limiting verified on login, register, forgot password
- [ ] Structured JSON logs with request id on all requests
- [ ] Seed command to create the first admin user
- [ ] Seed command with sample categories and books (optional dev data)

## Database
- [ ] Backup container in compose: daily `pg_dump`, 7-day retention

## Deployment
- [ ] Production compose: nginx reverse proxy, HTTPS, media served by nginx
- [ ] Production env checklist (strong `JWT_SECRET`, CORS origin, SMTP settings)

## Frontend
- [ ] Mobile viewport pass on shop pages (375 px)
- [ ] Error boundary and 404 pages
- [ ] Escape all user-provided text (no `dangerouslySetInnerHTML`)

## Done
- [ ] All bullets above complete
