# Template: Model spec (`spec/model/<entity>.md`)

Copy this structure for each entity. Every bullet is a checkbox.

```markdown
# Model: <Entity>

Source: <plan section>  |  Prototype: <screen or "n/a">

## Purpose
- [ ] <one line: what this entity represents>

## Database (PostgreSQL)
- [ ] Table `<name>` with columns: <col type constraints, ...>
- [ ] Foreign keys and ON DELETE behaviour: <...>
- [ ] Indexes / unique constraints: <...>
- [ ] Alembic migration created

## Backend models
- [ ] SQLAlchemy model in `backend/app/modules/<module>/models.py`
- [ ] Pydantic schemas: Create / Update / Read in `schemas.py`
- [ ] Enums: <...>

## Frontend types
- [ ] TS types come from the generated `schema.d.ts` (no hand-written duplicates)
- [ ] Zod schema for forms in `lib/validation/<entity>.ts` (mirror backend constraints)

## Business rules
- [ ] <invariant, e.g. quantity >= 0>

## Related
- [ ] API: [../api/<module>.md](../api/<module>.md)

## Done
- [ ] All bullets above complete
```
