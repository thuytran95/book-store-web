# Hook: Catalog

APIs used: [../api/catalog.md](../api/catalog.md)  |  Location: `frontend/src/features/catalog/hooks/`

## Hooks
- [ ] `useCategories()` query `["categories"]`
- [ ] `useBookQuery()` reads filters from URL search params, returns `{ data, filters, setFilters, page }`
  - [ ] Query key `["books", filters]`, endpoint `GET /books`
  - [ ] Debounce text input
- [ ] `useBook(slug)` query `["book", slug]`

## State
- [ ] URL search params <-> `BookQuery` mapping (`lib/book-query.ts`)
- [ ] Server-side helpers to fetch home/list/detail data in Server Components

## Done
- [ ] All bullets above complete
