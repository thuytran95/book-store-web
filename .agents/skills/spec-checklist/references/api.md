# Template: API spec (`spec/api/<module>.md`)

```markdown
# API: <Module>

Base path: `/api/v1/<...>`  |  Models: [../model/<entity>.md](../model/<entity>.md)

## Module files
- [ ] `backend/app/modules/<module>/router.py`
- [ ] `service.py` (business logic; deep operations listed below)
- [ ] Router registered in `main.py`

## Endpoints
For each endpoint one checkbox, with details inline:
- [ ] `METHOD /path` | auth: public/buyer/admin | body: <schema> | returns: <schema> | errors: <CODE, ...>

## Service operations
- [ ] `<function>(args) -> result`: <rule it enforces, transaction notes>

## Cross-cutting
- [ ] Auth dependency applied (`current_user` / `require_admin`)
- [ ] Input validation via Pydantic
- [ ] Errors raised as `DomainError` with stable `code`
- [ ] OpenAPI schema regenerated (`npm run gen:api`)

## Done
- [ ] All bullets above complete
```
