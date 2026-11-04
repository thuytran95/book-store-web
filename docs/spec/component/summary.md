# Component Summary

## Purpose
Reusable UI pieces in `frontend/src/components/` (shared) and `src/features/<area>/components/` (feature-specific). Mobile-first for the shop, desktop-first for admin. Built on shadcn/ui primitives.

## Files (in dependency order)
- [ ] [ui-kit.md](ui-kit.md): shadcn primitives and small shared widgets | depends on: model/00
- [ ] [badges.md](badges.md): PriceTag, ConditionBadge, OrderStatusBadge | depends on: ui-kit
- [ ] [shop-layout.md](shop-layout.md): header, search, cart count, mobile bottom nav | depends on: ui-kit
- [ ] [admin-layout.md](admin-layout.md): sidebar layout | depends on: ui-kit
- [ ] [book-card.md](book-card.md): book grid card | depends on: badges
- [ ] [book-filters.md](book-filters.md): filters, sort, pagination, mobile drawer | depends on: ui-kit
- [ ] [cart-line.md](cart-line.md): cart line item | depends on: badges
- [ ] [address-picker.md](address-picker.md): address list/form | depends on: ui-kit
- [ ] [status-timeline.md](status-timeline.md): order status timeline | depends on: badges
- [ ] [image-uploader.md](image-uploader.md): admin image upload | depends on: ui-kit

## Shared rules
- [ ] Every component handles loading, empty and error states where relevant
- [ ] Labelled inputs and keyboard accessible

## Done
- [ ] All files above ticked
