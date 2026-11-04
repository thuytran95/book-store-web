# Feature: Admin Dashboard

Routes: `/admin`  |  Role: admin  |  Prototype: n/a

## Uses
- [ ] Hooks: `useRevenue`, `useSummary`, `useBestSellers`, `useLowStock` from [../hook/use-admin.md](../hook/use-admin.md)
- [ ] Components: [../component/admin-layout.md](../component/admin-layout.md)

## Pages
- [ ] `admin/layout.tsx` using AdminLayout, guarded by middleware
- [ ] `admin/page.tsx`: revenue chart (Recharts) with day/month toggle and date range
- [ ] Order counts by status cards
- [ ] Best sellers list
- [ ] Low stock list with link to the book

## Behaviour
- [ ] Loading skeletons, empty state when no data
- [ ] Revenue uses completed orders only (note in UI)

## Done
- [ ] All bullets above complete
