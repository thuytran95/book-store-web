# API: Catalog (books + categories)

Base path: `/api/v1/books`, `/categories`, `/admin/books`, `/admin/categories`  |  Models: [../model/book.md](../model/book.md), [../model/category.md](../model/category.md)

## Module files
- [x] `app/modules/catalog/router.py` (public), `admin_router.py`, `service.py`, `search.py`, `schemas.py`

## Public endpoints
- [x] `GET /categories` | public | list
- [x] `GET /books` | public | query: text, category, price_min, price_max, condition_min, in_stock, sort (newest|price_asc|price_desc|relevance), page, size | returns Page[BookCard]
- [x] `GET /books/{slug}` | public | returns BookDetail incl. available qty from inventory | errors: NOT_FOUND

## Admin endpoints
- [x] `GET /admin/books` | admin | includes hidden, search/filter
- [x] `POST /admin/books` | admin | body: BookCreate
- [x] `GET/PATCH /admin/books/{id}` | admin
- [x] `DELETE /admin/books/{id}` | admin | hide if it has order history, else delete
- [x] `POST /admin/books/{id}/mark-sold` | admin | sets quantity 0 via inventory
- [x] `GET/POST /admin/categories`, `PATCH /admin/categories/{id}` | admin
- [x] `DELETE /admin/categories/{id}?move_to=` | admin | errors: CATEGORY_NOT_EMPTY; with `move_to` moves books and deletes in one transaction

## Service operations
- [x] `search_books(BookQuery)`: full-text + `unaccent` + `pg_trgm` typo tolerance (e.g. "tieng viet" matches "tiếng Việt")
- [x] Slug generation, unique on collision
- [x] Public queries only return `is_visible` books

## Cross-cutting
- [x] Admin router uses `require_admin`
- [x] OpenAPI regenerated

## Done
- [x] All bullets above complete
