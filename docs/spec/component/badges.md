# Component: Badges (PriceTag, ConditionBadge, OrderStatusBadge)

File: `frontend/src/components/shared/`  |  Type: shared  |  Prototype: n/a

## Props
- [x] `PriceTag`: `amount: number`, `size?`, `strike?: number`
- [x] `ConditionBadge`: `pct: number` (e.g. 90%, 80%)
- [x] `OrderStatusBadge`: `status: OrderStatus`

## Behaviour
- [x] Use `formatVnd`, `conditionLabel`, `orderStatusLabel/Color` from `lib/format`
- [x] Color per status (pending, confirmed, shipping, completed, cancelled)

## Done
- [x] All bullets above complete
