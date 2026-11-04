# Model: BookRequest

Source: plan section 2 (book_requests)  |  Prototype: n/a

## Purpose
- [x] Buyer request for a book not in stock

## Database
- [x] Table `book_requests`: id, user_id FK, title, author, note, status (`pending`/`available`/`rejected`), admin_note, timestamps
- [x] Alembic migration created

## Backend models
- [x] Enum `BookRequestStatus`; SQLAlchemy model in `app/modules/book_requests/models.py`
- [x] Pydantic: `BookRequestCreate`, `BookRequestRead`, `ResolveIn`

## Frontend types
- [x] Zod schema `lib/validation/book-request.ts` (title required)

## Related
- [x] API: [../api/book-requests.md](../api/book-requests.md)

## Done
- [x] All bullets above complete
