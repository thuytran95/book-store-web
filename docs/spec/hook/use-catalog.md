# Hook: Catalog

APIs used: [../api/catalog.md](../api/catalog.md)  |  Location: `frontend/src/features/catalog/hooks/`

## Hooks
- [x] `useCategories()` query `["categories"]`
- [x] `useBookQuery()` reads filters from URL search params, returns `{ data, filters, setFilters, page }`
  - [x] Query key `["books", filters]`, endpoint `GET /books`
  - [x] Debounce text input
- [x] `useBook(slug)` query `["book", slug]`

## State
- [x] URL search params <-> `BookQuery` mapping (`lib/book-query.ts`)
- [x] Server-side helpers to fetch home/list/detail data in Server Components

## Done
- [x] All bullets above complete
