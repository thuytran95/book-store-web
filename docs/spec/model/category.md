# Model: Category

Source: plan section 2 (categories)  |  Prototype: n/a

## Purpose
- [x] Book categories used for browsing and filtering

## Database
- [x] Table `categories`: id, name (unique), slug (unique), timestamps
- [x] Alembic migration created

## Backend models
- [x] SQLAlchemy model in `app/modules/catalog/models.py`
- [x] Pydantic schemas: `CategoryCreate/Update/Read`

## Frontend types
- [x] Zod schema `lib/validation/category.ts` (name required)

## Business rules
- [x] Slug generated from name
- [x] Category with books cannot be deleted unless books are moved (`CATEGORY_NOT_EMPTY`)

## Related
- [x] API: [../api/catalog.md](../api/catalog.md)

## Done
- [x] All bullets above complete
