# Model: Book, BookImage

Source: plan section 2 (books, book_images), 3.4  |  Prototype: n/a

## Purpose
- [x] A used book with price, condition, stock and images

## Database
- [x] Table `books`: id, category_id FK (`RESTRICT`), title, slug unique, author, publisher, published_year, cost_price, sale_price, condition_pct (10-100), description, quantity (>= 0), is_visible, timestamps
- [x] Generated column `search_vector` (tsvector of unaccented title, author) + GIN index
- [x] Trigram indexes on `unaccent(title)` and `unaccent(author)`
- [x] Table `book_images`: id, book_id FK, url, position
- [x] CHECK constraints: prices >= 0, quantity >= 0, condition 10..100
- [x] Alembic migration created

## Backend models
- [x] SQLAlchemy models `Book`, `BookImage` in `catalog/models.py`
- [x] Pydantic: `BookCard`, `BookDetail`, `BookCreate`, `BookUpdate`, `BookQuery`

## Frontend types
- [x] Zod schema `lib/validation/book.ts` mirroring constraints

## Business rules
- [x] "Sold"/"out of stock" derived from `quantity = 0`; hiding uses `is_visible`
- [x] Only `inventory` module changes `quantity` after creation

## Related
- [x] API: [../api/catalog.md](../api/catalog.md), [../api/inventory.md](../api/inventory.md)

## Done
- [x] All bullets above complete
