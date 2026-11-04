# Feature: Admin Orders

Routes: `/admin/orders`, `/admin/orders/[id]`  |  Role: admin  |  Prototype: n/a

## Uses
- [x] Hooks: order hooks in [../hook/use-admin.md](../hook/use-admin.md)
- [x] Components: [../component/status-timeline.md](../component/status-timeline.md), [../component/badges.md](../component/badges.md)

## Pages
- [x] `admin/orders/page.tsx`: status tabs (all, pending, confirmed, shipping, completed, cancelled), paginated table
- [x] `admin/orders/[id]/page.tsx`: items, buyer, address, payment, timeline
- [x] Only allowed transitions shown as buttons (confirm, ship, complete, cancel with reason)

## Behaviour
- [x] Confirm deducts stock, cancel restores it (explained in confirm dialog)
- [x] INVALID_TRANSITION and OUT_OF_STOCK messages
- [x] Refresh list after a transition

## Done
- [x] All bullets above complete
