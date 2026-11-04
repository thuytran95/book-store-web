# API: Mail

Base path: n/a (internal)  |  Used by: [auth.md](auth.md)

## Module files
- [x] `app/modules/mail/port.py`: `Mailer` protocol `send(to, subject, body)`
- [x] `ConsoleMailer` (logs message; default in dev)
- [x] `SmtpMailer` (uses `SMTP_*` settings)
- [x] Factory selecting adapter from `MAIL_BACKEND`

## Done
- [x] All bullets above complete
