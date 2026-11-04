# Template: Hook spec (`spec/hook/<area>.md`)

```markdown
# Hook: <area>

APIs used: [../api/<module>.md](../api/<module>.md)  |  Location: `frontend/src/features/<area>/hooks/`

## Hooks
For each hook:
- [ ] `use<Name>(params)` returns `{ ... }`
  - [ ] Query key: `[...]`
  - [ ] Endpoint: `METHOD /path`
  - [ ] Mutation + cache invalidation / optimistic update: <...>
  - [ ] Error codes handled: <CODE -> behaviour>

## Forms
- [ ] react-hook-form + Zod schema `<name>` (see model spec)
- [ ] Server field errors mapped onto form fields

## State (only if needed)
- [ ] URL search params <-> filter object mapping
- [ ] Session: `useSession()` / `getSession()`

## Done
- [ ] All bullets above complete
```
