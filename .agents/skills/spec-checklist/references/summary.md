# Template: Summary files

## Root `spec/summary.md`

```markdown
# Spec Summary: <Project>

Source: <plan path>  |  Prototype: <path/link or "none (use plan screen tables)">  |  Tests: excluded (fast development)

## Overview
<3-6 lines: what is being built, stack, main risk>

## Implementation order
Model -> API -> Hook -> Component -> Features

## Progress
- [ ] Model: [model/summary.md](model/summary.md): <n> files
- [ ] API: [api/summary.md](api/summary.md): <n> files
- [ ] Hook: [hook/summary.md](hook/summary.md): <n> files
- [ ] Component: [component/summary.md](component/summary.md): <n> files
- [ ] Features: [features/summary.md](features/summary.md): <n> files

## How to use
- [ ] Tick bullets while implementing, tick `## Done` in the file
- [ ] Tick the file in its part summary, then the part here

## Open questions
- [ ] <question from the plan>
```

## Part `spec/<part>/summary.md`

```markdown
# <Part> Summary

## Purpose
<2-3 lines: what this part covers and how it connects to the others>

## Files (in dependency order)
- [ ] [<file>.md](<file>.md): <one-line purpose> | depends on: <links or none>

## Shared rules
- [ ] <rule that applies to every file in this part>

## Done
- [ ] All files above ticked
```
