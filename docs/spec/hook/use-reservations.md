# Hook: Reservations

APIs used: [../api/reservations.md](../api/reservations.md)  |  Location: `frontend/src/features/reservations/hooks/`

## Hooks
- [x] `useReservations()` query `["reservations"]`
- [x] `useReserve()` mutation `POST /reservations`; handles OUT_OF_STOCK, RESERVATION_LIMIT; invalidates book detail
- [x] `useCancelReservation()` mutation
- [x] `useCountdown(expiresAt)` returns remaining time, flags expired

## Done
- [x] All bullets above complete
