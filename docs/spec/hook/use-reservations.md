# Hook: Reservations

APIs used: [../api/reservations.md](../api/reservations.md)  |  Location: `frontend/src/features/reservations/hooks/`

## Hooks
- [ ] `useReservations()` query `["reservations"]`
- [ ] `useReserve()` mutation `POST /reservations`; handles OUT_OF_STOCK, RESERVATION_LIMIT; invalidates book detail
- [ ] `useCancelReservation()` mutation
- [ ] `useCountdown(expiresAt)` returns remaining time, flags expired

## Done
- [ ] All bullets above complete
