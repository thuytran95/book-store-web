# Feature: Admin Orders

Routes: `/admin/orders`, `/admin/orders/[id]`  |  Role: admin  |  Prototype: n/a

## Uses
- [ ] Hooks: order hooks in [../hook/use-admin.md](../hook/use-admin.md)
- [ ] Components: [../component/status-timeline.md](../component/status-timeline.md), [../component/badges.md](../component/badges.md)

## Pages
- [ ] `admin/orders/page.tsx`: status tabs (all, pending, confirmed, shipping, completed, cancelled), paginated table
- [ ] `admin/orders/[id]/page.tsx`: items, buyer, address, payment, timeline
- [ ] Only allowed transitions shown as buttons (confirm, ship, complete, cancel with reason)

## Behaviour
- [ ] Confirm deducts stock, cancel restores it (explained in confirm dialog)
- [ ] INVALID_TRANSITION and OUT_OF_STOCK messages
- [ ] Refresh list after a transition

## Done
- [ ] All bullets above complete
