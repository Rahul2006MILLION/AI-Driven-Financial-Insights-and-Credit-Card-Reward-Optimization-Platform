---
name: implementation-tracking
description: Track feature implementation progress, defect status, and phase completion in CLIQ — updating IMPLEMENTATION_STATUS.md, assigning DEF identifiers to new defects, and maintaining the phase completion matrix as development advances.
---

# Implementation Tracking Skill

## When to Activate
- A feature, defect fix, or phase has been completed
- A new defect is discovered during testing
- User asks about project status or what's been done
- Starting a new phase and need to record entry conditions

## Updating IMPLEMENTATION_STATUS.md

File: `docs/IMPLEMENTATION_STATUS.md`

### Marking a feature complete
Find the feature row and change `PLANNED` → `IMPLEMENTED`:
```markdown
| Feature name | IMPLEMENTED | `path/to/implementation.py` |
```

### Marking a phase complete
Find the phase row and change status:
```markdown
| Phase 4 | Financial Scam Shield | COMPLETE | ScamShieldEngine, merchant detection, subscription traps |
```

### Recording a new defect
Add to the Known Defects Log table:
```markdown
| DEF-11 | [description of defect] | [phase discovered] | OPEN |
```

### Marking a defect fixed
```markdown
| DEF-11 | [description] | [phase fixed] | FIXED |
```

## Defect Identifier Convention

Defects are numbered sequentially: DEF-01 through DEF-10 are taken. Next: DEF-11.

When a defect is found:
1. Assign next available DEF-XX identifier
2. Add to `docs/IMPLEMENTATION_STATUS.md` Known Defects Log
3. Describe: what fails, where it was found, root cause if known
4. Status: OPEN until fixed and verified by test

## Phase Completion Criteria

A phase is only COMPLETE when:
1. All features listed in the phase specification are implemented
2. All new tests pass
3. All existing tests still pass (zero regressions)
4. Phase report created (`PHASE_X_Y_REPORT.md` at repo root)
5. `docs/IMPLEMENTATION_STATUS.md` updated
6. `CLAUDE.md` updated if architecture changed

## Phase Entry Criteria (Before Starting)

Before starting any new phase:
1. Previous phase marked COMPLETE with verified test results
2. User has explicitly authorized the new phase
3. Phase spec read from `CLAUDE_HANDOVER/MASTER_ROADMAP.md`
4. Relevant capability spec read from `CLAUDE_HANDOVER/PRODUCT_VISION_AND_REQUIREMENTS.md`
5. Database schema changes planned and Alembic migration drafted

## Current Phase Baseline

From `docs/IMPLEMENTATION_STATUS.md`:
- Phases 0–3.3: COMPLETE
- Phase 4 (Scam Shield): NOT STARTED — awaiting user authorization
- All 9 original defects (DEF-01–09): FIXED
- DEF-10: FIXED in Phase 3.3
- Test baseline: 169/170 passing (post Phase 3.3 fix: 170/170)

## Tracking New Work in Progress

When starting a multi-step task, track in conversation:
- [ ] Step 1 — description
- [ ] Step 2 — description
- [ ] Run tests
- [ ] Update IMPLEMENTATION_STATUS.md
- [ ] Create phase report if phase complete

Do not mark work complete until tests confirm it.
