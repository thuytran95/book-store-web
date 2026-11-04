# Template: Feature spec (`spec/features/<flow>.md`)

```markdown
# Feature: <Flow>

Routes: `/...`  |  Role: guest/buyer/admin  |  Prototype: <screen or "n/a">

## Uses
- [ ] Hooks: [../hook/<area>.md](../hook/<area>.md)
- [ ] Components: [../component/<name>.md](../component/<name>.md)

## Pages
For each route:
- [ ] `src/app/<path>/page.tsx` (Server or Client Component: <which>)
- [ ] Layout: Shop / Admin / Auth
- [ ] Route guard in `middleware.ts` (if protected)

## Behaviour
- [ ] Happy path: <steps>
- [ ] Empty state
- [ ] Loading state (skeleton)
- [ ] Error states: <CODE -> message>
- [ ] Responsive: mobile layout / desktop layout

## Rules
- [ ] <business rule visible in UI, e.g. cancel only while pending>

## Done
- [ ] All bullets above complete
```
