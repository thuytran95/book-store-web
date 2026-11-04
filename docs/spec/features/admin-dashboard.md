# Feature: Admin Dashboard

Routes: `/admin`  |  Role: admin  |  Prototype: n/a

## Uses
- [x] Hooks: `useRevenue`, `useSummary`, `useBestSellers`, `useLowStock` from [../hook/use-admin.md](../hook/use-admin.md)
- [x] Components: [../component/admin-layout.md](../component/admin-layout.md)

## Pages
- [x] `admin/layout.tsx` using AdminLayout, guarded by middleware
- [x] `admin/page.tsx`: revenue chart (Recharts) with day/month toggle and date range
- [x] Order counts by status cards
- [x] Best sellers list
- [x] Low stock list with link to the book

## Behaviour
- [x] Loading skeletons, empty state when no data
- [x] Revenue uses completed orders only (note in UI)

## Done
- [x] All bullets above complete
