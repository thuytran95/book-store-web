# Hook: Admin

APIs used: [../api/catalog.md](../api/catalog.md), [../api/orders.md](../api/orders.md), [../api/reservations.md](../api/reservations.md), [../api/book-requests.md](../api/book-requests.md), [../api/users.md](../api/users.md), [../api/reports.md](../api/reports.md), [../api/media.md](../api/media.md)  |  Location: `frontend/src/features/admin/hooks/`

## Books
- [ ] `useAdminBooks(filters)`, `useAdminBook(id)`
- [ ] `useSaveBook()` (create/update), `useDeleteBook()`, `useToggleVisible()`, `useMarkSold()`
- [ ] `useUploadBookImage()`, `useDeleteBookImage()`

## Categories
- [ ] `useAdminCategories()`, `useSaveCategory()`
- [ ] `useDeleteCategory({ moveTo? })`; handles CATEGORY_NOT_EMPTY

## Orders
- [ ] `useAdminOrders(status, page)`, `useAdminOrder(id)`
- [ ] `useTransitionOrder()`; handles INVALID_TRANSITION, OUT_OF_STOCK

## Reservations and requests
- [ ] `useAdminReservations()`, `useCancelAdminReservation()`
- [ ] `useAdminBookRequests(status)`, `useResolveBookRequest()`

## Users
- [ ] `useAdminUsers(search, page)`, `useSetUserLocked()`

## Reports
- [ ] `useRevenue(granularity, range)`, `useSummary()`, `useBestSellers()`, `useLowStock()`

## Done
- [ ] All bullets above complete
