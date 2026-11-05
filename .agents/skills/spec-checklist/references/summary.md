# Template: Summary file

There is exactly **one** summary per task: `docs/spec/<task-slug>/summary.md`.
Part folders (`model/`, `api/`, `hook/`, `component/`, `features/`) contain only spec files, no `summary.md`.

```markdown
# Spec Summary: <Task>

Source: <requirement>  |  Architecture: docs/architecture/backend.md, docs/architecture/frontend.md  |  Prototype: <path/link or "none">  |  Tests: excluded (fast development)

## Overview
<3-6 lines: what is being built, which existing modules/routes it touches, main risk>

## Implementation order
Model -> API -> Hook -> Component -> Features

## Model
<1-2 lines: what this part covers>
- [ ] [model/<entity>.md](model/<entity>.md): <one-line purpose> | depends on: <links or none>

## API
<1-2 lines>
- [ ] [api/<module>.md](api/<module>.md): <one-line purpose> | depends on: <links>

## Hook
<1-2 lines>
- [ ] [hook/<area>.md](hook/<area>.md): <one-line purpose> | depends on: <links>

## Component
<1-2 lines>
- [ ] [component/<component>.md](component/<component>.md): <one-line purpose> | depends on: <links>

## Features
<1-2 lines>
- [ ] [features/<flow>.md](features/<flow>.md): <one-line purpose> | depends on: <links>

## How to use
- [ ] Tick bullets while implementing, then tick `## Done` in that spec file
- [ ] Tick the file here once its `## Done` is ticked

## Open questions
- [ ] <question from the requirement>
```

Omit a part section entirely if the task has no files for it.
