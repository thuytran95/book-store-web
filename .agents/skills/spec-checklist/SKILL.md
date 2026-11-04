---
name: spec-checklist
description: Turn a requirement or plan (e.g. docs/PLAN-codebase.md) into per-part implementation checklists in a new docs/spec/<task-slug>/ folder named from the task, split into model, api, hook, features and component, plus a summary.md overview. Use whenever the user asks to analyse requirements, break a plan into tasks, write a spec or checklist, "split into model/api/hook/feature/component", or prepare work for fast implementation, even if they don't say "checklist". Tests are intentionally excluded. Optionally follows a UI prototype.
---

# Spec Checklist

Analyse a requirement source and produce small, tickable spec files, one per implementation part. The goal is fast development: every bullet is an action the implementer can do and tick off. **Never add test tasks** (unit, e2e, coverage, fixtures). If the source plan has a testing section, ignore it.

## Rules (read first)

- [ ] Every generated `.md` file contains checkboxes (`- [ ]`), including `summary.md`.
- [ ] Each spec file ends with a `## Done` section: a checkbox list the user ticks once all bullets above are complete.
- [ ] No test tasks anywhere.
- [ ] Prototype is optional: ask once ("use a prototype? path/link"). If yes, add a `Prototype` line (screen name or path) to each component/feature item. If no, omit it and rely on the plan's screen tables.
- [ ] Keep bullets short and imperative. Name exact files, endpoints, fields.

## Workflow

- [ ] 1. **Read the source** (default `docs/PLAN-codebase.md`). Extract entities, endpoints, screens, business rules, and the stack.
- [ ] 2. **Ask about the prototype** (optional). Record the answer in `summary.md`.
- [ ] 3. **Create a new task folder** `docs/spec/<task-slug>/` from the task content (see Output layout). Never write into `docs/spec/` root or into another task's folder.
- [ ] 4. **Split the work** into the five parts below. One folder per part, one file per module/entity/screen inside it (use the templates in `references/`).
- [ ] 5. **Write `summary.md`** at the task-folder root, plus a `summary.md` inside each part folder (templates in `references/summary.md`).
- [ ] 6. **Cross-check**: every entity has a model file, every model has an api file, every api used by the UI has a hook, every screen has a feature and its components. Fix gaps.
- [ ] 7. **Report** to the user: task folder path, files created, open questions.

## The five parts

Order reflects dependency; implement top to bottom.

| Part | Folder (inside the task folder) | What goes in it | Template |
| --- | --- | --- | --- |
| Model | `model/` | DB tables, SQLAlchemy models, Pydantic schemas, TS types, enums, constraints, migrations | `references/model.md` |
| API | `api/` | FastAPI routes, services, auth/permission, errors, generated TS client | `references/api.md` |
| Hook | `hook/` | Frontend data hooks (TanStack Query), session, forms/validation | `references/hook.md` |
| Features | `features/` | User-facing flows combining hooks and components: pages/routes, states, rules | `references/features.md` |
| Component | `component/` | Reusable UI pieces: props, variants, states | `references/component.md` |

Splitting guidance:
- **Model**: one file per entity (e.g. `book.md`, `order.md`). Put business invariants (stock, status machine) here.
- **API**: one file per module (e.g. `orders.md`). List each endpoint as a bullet with method, path, auth, request, response, errors.
- **Hook**: one file per feature area (e.g. `use-cart.md`). Note the query key, mutation, invalidation.
- **Features**: one file per route group (e.g. `checkout.md`). Link the hooks and components it uses.
- **Component**: one file per component or tight family (e.g. `book-card.md`). Shared kit first, feature-specific after.

## Output layout

Each generate run creates **one new folder** for that task. Several tasks can live side by side under `docs/spec/` without mixing files.

```
docs/spec/
├── landing-page/             # one folder per task
│   ├── summary.md
│   ├── model/   summary.md + <entity>.md ...
│   ├── api/     summary.md + <module>.md ...
│   ├── hook/    summary.md + <area>.md ...
│   ├── features/summary.md + <flow>.md ...
│   └── component/ summary.md + <component>.md ...
└── checkout/                 # another task, same shape
    └── ...
```

### Naming `<task-slug>`

Pick a short kebab-case folder name from the task, in this order:

1. The name the user gave ("checklist landing page" → `landing-page`, "spec cho thanh toan" → `thanh-toan` or `checkout`).
2. Else the focused source name (`screen/landing-page/` → `landing-page`, `docs/PLAN-checkout.md` → `checkout`).
3. Else 2–4 words from the requirement title (English kebab-case, or Vietnamese without diacritics).

Do not use a generic slug like `spec`, `checklist`, or `task`. Do not write files directly into `docs/spec/` (no root `summary.md` next to task folders). If `docs/spec/<task-slug>/` already exists, do not overwrite it: use a more specific slug, or only update that folder when the user explicitly asks to regenerate/update that task.

## Writing each file

- [ ] Use the matching template from `references/` and fill every section; delete sections that truly don't apply rather than leaving them blank.
- [ ] Put a checkbox on **every** actionable bullet.
- [ ] Add the `## Done` checklist as the last section.
- [ ] Link to dependencies with relative links (e.g. `../model/order.md`).
- [ ] Mark scope: if the plan says "out of scope (v1)", do not create items for it.

## Summary files

See `references/summary.md`. The task-folder `summary.md` gives the overview and a progress table (one checkbox per part and per file). Each part summary lists its files with a one-line purpose, dependency order, and a checkbox per file.

## After generating

- [ ] Tell the user the task folder path (`docs/spec/<task-slug>/`) and how to work: tick bullets while implementing, tick `## Done`, then tick the file in its part `summary.md`, then the part in that task folder's `summary.md`.
