# Hook: Admin

APIs used: [../api/catalog.md](../api/catalog.md), [../api/orders.md](../api/orders.md), [../api/reservations.md](../api/reservations.md), [../api/book-requests.md](../api/book-requests.md), [../api/users.md](../api/users.md), [../api/reports.md](../api/reports.md), [../api/media.md](../api/media.md)  |  Location: `frontend/src/features/admin/hooks/`

## Books
- [x] `useAdminBooks(filters)`, `useAdminBook(id)`
- [x] `useSaveBook()` (create/update), `useDeleteBook()`, `useToggleVisible()`, `useMarkSold()`
- [x] `useUploadBookImage()`, `useDeleteBookImage()`, `useReorderBookImages()`

## Categories
- [x] `useAdminCategories()`, `useSaveCategory()`
- [x] `useDeleteCategory({ moveTo? })`; handles CATEGORY_NOT_EMPTY

## Orders
- [x] `useAdminOrders(status, page)`, `useAdminOrder(id)`
- [x] `useTransitionOrder()`; handles INVALID_TRANSITION, OUT_OF_STOCK

## Reservations and requests
- [x] `useAdminReservations()`, `useCancelAdminReservation()`
- [x] `useAdminBookRequests(status)`, `useResolveBookRequest()`

## Users
- [x] `useAdminUsers(search, page)`, `useSetUserLocked()`

## Reports
- [x] `useRevenue(granularity, range)`, `useSummary()`, `useBestSellers()`, `useLowStock()`

## Done
- [x] All bullets above complete
