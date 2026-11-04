# Feature: Book Requests (buyer)

Routes: `/book-requests`  |  Role: buyer  |  Prototype: n/a

## Uses
- [x] Hooks: [../hook/use-book-requests.md](../hook/use-book-requests.md)

## Pages
- [x] `(shop)/book-requests/page.tsx`: request form (title, author, note) + list
- [x] Status chips: pending, available, rejected; show admin note

## Behaviour
- [x] Prefill title from `?title=` when coming from an out-of-stock detail page
- [x] Empty state, success toast
- [x] Responsive form

## Done
- [x] All bullets above complete
