---
name: session-handoff
description: Produce a clean session handoff document and update project memory at the end of a CLIQ engineering session — ensuring the next session can resume without losing context, verifying test state, and recording decisions made.
---

# Session Handoff Skill

## When to Activate
- User says "we're done for now" or "wrap up"
- Session is approaching context limits
- A phase or major milestone has been completed
- User asks for a summary of what was done

## Handoff Procedure

### Step 1 — Run the test suite

```bash
cd /Users/rahuljain/CLIQ/backend && PYTHONPATH=. .venv/bin/pytest tests/unit/ tests/security/ -q 2>&1 | tail -5
cd /Users/rahuljain/CLIQ/frontend && npm test 2>&1 | tail -5
cd /Users/rahuljain/CLIQ/frontend && npm run build 2>&1 | tail -10
```

Record: passed/failed/skipped counts for each suite.

### Step 2 — Run git status

```bash
cd /Users/rahuljain/CLIQ && git status
```

List all modified and untracked files created this session.

### Step 3 — Update IMPLEMENTATION_STATUS.md

For each newly completed feature or defect fix:
```
| Feature name | IMPLEMENTED | Location |
| DEF-XX | description | Phase X.X | FIXED |
```

### Step 4 — Create phase report (if applicable)

If a phase completed, create `PHASE_X_Y_REPORT.md` at repo root:
- Executive summary
- Defects fixed
- Features delivered
- Files modified
- Test results
- Known remaining issues

### Step 5 — Update memory

Update `~/.claude/projects/-Users-rahuljain-CLIQ/memory/MEMORY.md` with:
- Key architectural discoveries from this session
- Corrections to previous beliefs
- New defect identifiers
- What was fixed and where

### Step 6 — Brief summary to user

Provide a concise summary:
1. What was completed
2. Test baseline (X/Y passing)
3. Files created/modified (list)
4. Anything that needs user decision before next session
5. What to do next (next phase or open issue)

## Phase Report Template

```markdown
# PHASE X.Y — [Phase Name] Report

**Date:** YYYY-MM-DD
**Status:** COMPLETE / PARTIAL

## Executive Summary
[2-3 sentences]

## Defects Fixed
| DEF | Description | Fix Location |
| :--- | :--- | :--- |

## Features Delivered
[Bulleted list]

## Files Modified
[Bulleted list with paths]

## Test Results
| Suite | Result |
| Backend unit | X/X passing |
| Frontend | 42/42 passing |
| Build | 23/23 pages |

## Known Issues
[Any remaining issues or next steps]
```

## Memory Update Template

```markdown
## [Date] — Session Notes

### Fixed this session
- DEF-XX: [description] in [file]

### Key discoveries
- [architectural fact that surprised you]

### Corrections to previous beliefs
- Previously: [X]. Actually: [Y]. Updated in [file].

### Next session should
- [specific task or phase]
```

## What NOT to Include in Handoff
- Speculative architectural ideas not yet implemented
- File contents that can be re-read (don't paste code into memory)
- Temporary test state or debugging notes
- Sensitive values (credentials, API keys, PII)
