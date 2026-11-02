---
name: implementation-tracking
description: Track CLIQ feature implementation progress, defect status, and phase completion — updating IMPLEMENTATION_STATUS.md, assigning DEF identifiers to new defects, and maintaining the phase matrix as development advances.
---

# Implementation Tracking Skill

## When to Activate
- A feature, defect fix, or phase has been completed
- A new defect is discovered during testing
- User asks about project status or what's been done
- Starting a new phase

## File to Update
`docs/IMPLEMENTATION_STATUS.md` — authoritative project progress reference.

## Marking a Feature Complete

```markdown
| Feature name | IMPLEMENTED | `path/to/implementation.py` |
```

## Marking a Phase Complete

```markdown
| Phase 4 | Financial Scam Shield | COMPLETE | ScamShieldEngine, merchant detection |
```

## Recording a New Defect

Next available identifier: **DEF-11** (DEF-01–10 are taken).

```markdown
| DEF-11 | [description of defect] | Phase X | OPEN |
```

## Marking a Defect Fixed

```markdown
| DEF-11 | [description] | Phase X.Y | FIXED |
```

## Phase Completion Criteria

A phase is COMPLETE only when:
1. All specified features implemented
2. New tests written and passing
3. All existing tests still passing (zero regressions)
4. Phase report `PHASE_X_Y_REPORT.md` created at repo root
5. `docs/IMPLEMENTATION_STATUS.md` updated
6. `CLAUDE.md` updated if architecture changed

## Current Baseline

- Phases 0–3.3: COMPLETE
- Phase 4 (Scam Shield): NOT STARTED
- DEF-01 through DEF-10: FIXED
- Next defect ID: DEF-11
- Test baseline (Phase 3.3): 170/170 passing (after DEF-10 fix)
