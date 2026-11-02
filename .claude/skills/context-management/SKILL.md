---
name: context-management
description: Manage Claude Code context window efficiently in long CLIQ engineering sessions — prioritize which files to read, avoid redundant reads, use targeted searches, and preserve token budget for implementation work.
---

# Context Management Skill

## When to Activate
- Starting a complex feature that spans multiple files
- Session is running long and context may be approaching limits
- User asks about a file or subsystem not yet read in this session
- Planning to make many simultaneous changes

## CLIQ Context Priority Order

When context budget is limited, read in this order:

1. **`CLAUDE.md`** — project overview, commands, architecture (usually auto-loaded)
2. **`docs/IMPLEMENTATION_STATUS.md`** — what is done/broken/planned
3. **Specific source files for the task** — only files directly relevant
4. **`docs/DECISIONS.md`** — before making architectural decisions
5. **`CLAUDE_HANDOVER/`** files — only for deep context on specific subsystems

## Targeted Search Before Full File Reads

```bash
# Find where a function is defined — don't read whole file
grep -n "def calculate_health_score" backend/app/services/financial_health/health_engine.py

# Find all usages of a function
grep -rn "apiFetch" frontend/lib/ frontend/app/ --include="*.ts" --include="*.tsx"

# Find which file exports a specific type
grep -rn "export.*TransactionResponse" frontend/ --include="*.ts"
```

Use Grep and Glob tools instead of reading entire files for discovery.

## Avoiding Redundant Reads

If a file was already read in this session, use the information from that read. Do not re-read unless:
- The file was modified since reading
- More than 50 messages have passed
- You need a specific section you didn't capture

## Partial File Reads

Use `offset` and `limit` parameters:

```
Read file_path="..." offset=100 limit=50  # lines 100-150 only
```

For large files (>300 lines), read only the section you need:
- First 30 lines: imports, class definitions, constants
- Specific line range: where the function of interest lives
- Last 50 lines: often utility methods, seeding functions

## CLIQ File Size Reference

Large files to read partially:
- `backend/app/models/entities.py` — 450+ lines, read by section
- `backend/app/services/offers/offer_service.py` — 800+ lines, search first
- `backend/app/main.py` — 250+ lines, read init_db section if needed
- `frontend/lib/translations.ts` — 600+ lines, search for specific section

## Session State Tracking

Before reading a file, check if it was already read in this session from:
1. Tool call history in current context
2. Memory notes if this is a continuation session

## When Context Gets Tight

Signs context is filling:
- You're repeating information you know
- Simple tasks require more clarification than they should

Mitigations:
1. Complete the current discrete task before starting the next
2. Write key findings to `~/.claude/projects/-Users-rahuljain-CLIQ/memory/MEMORY.md`
3. Create a task report document so the next session can resume
4. Use the session-handoff skill to produce a clean handover

## Token-Efficient Patterns

```bash
# Instead of: read full file then search
# Do: search first, then read only relevant lines
grep -n "source_evidence" backend/tests/unit/test_hybrid_offer_discovery.py

# Instead of: read every related file
# Do: read the one that imports the most relevant things
grep -n "^from\|^import" backend/app/api/v1/transactions.py | head -20
```
