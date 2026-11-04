# Spec Summary: Book Store (used-book shop)

Source: [../PLAN-codebase.md](../PLAN-codebase.md)  |  Prototype: none (use the plan's screen tables)  |  Tests: excluded (fast development)

## Overview
Next.js 15 (TypeScript, Tailwind, shadcn/ui, TanStack Query) frontend, FastAPI (SQLAlchemy async, Alembic) backend, PostgreSQL 16. Biggest risk is double-selling the single copy of a used book, so all stock changes go through one `inventory` module. Out of scope: online payment, coupons, reviews/wishlist, email/Zalo notifications, shipping integrations, Excel import.

## Implementation order
Model -> API -> Hook -> Component -> Features. Start with [model/00-project-setup.md](model/00-project-setup.md).

## Progress
- [x] Model: [model/summary.md](model/summary.md): 8 files
- [x] API: [api/summary.md](api/summary.md): 12 files
- [ ] Hook: [hook/summary.md](hook/summary.md): 9 files
- [ ] Component: [component/summary.md](component/summary.md): 10 files
- [ ] Features: [features/summary.md](features/summary.md): 14 files

## How to use
- [ ] Tick bullets while implementing, then tick `## Done` in the file
- [ ] Tick the file in its part summary, then the part here

## Open questions (from the plan)
- [ ] Prototype location (Figma/images)? Add to `docs/prototype/` and re-map screens
- [ ] Shipping fee: flat, free above threshold, or admin-entered?
- [ ] Bank transfer: admin confirms payment manually, or treated like COD?
- [ ] Reservation defaults: 3 days, 3 active holds per user. Confirm
- [ ] Password reset needs SMTP in production. Acceptable?
