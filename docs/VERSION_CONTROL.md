# CLIQ — Version Control & Release Management System

This document outlines the professional Git version-control, branching strategy, semantic versioning policy, and release-management workflow for **CLIQ** (AI-Driven Financial Insights and Credit Card Reward Optimization Platform).

---

## 1. Current Release State

| Property | Value |
| :--- | :--- |
| **Current Active Version** | `v0.1.0` |
| **Published Release Commit** | `97f1c04c839ead71d300afec46d05d8ebc0be620` |
| **Release Tag** | `v0.1.0` (Annotated: `CLIQ foundation and authentication`) |
| **Production Branch** | `main` |
| **Integration / Development Branch** | `first` |
| **Remote Repository** | `https://github.com/Rahul2006MILLION/AI-Driven-Financial-Insights-and-Credit-Card-Reward-Optimization-Platform.git` |

---

## 2. Semantic Versioning Policy (SemVer 2.0.0)

CLIQ adheres strictly to [Semantic Versioning 2.0.0](https://semver.org/):

$$\text{Format: } \mathbf{MAJOR.MINOR.PATCH}$$

- **MAJOR (`X.0.0`)**: Incompatible API changes, breaking architectural refactors, or major product milestones (e.g., `v1.0.0` Hackathon Launch).
- **MINOR (`0.Y.0`)**: Backwards-compatible feature additions, new subsystem capabilities, or milestone completions.
- **PATCH (`0.0.Z`)**: Backwards-compatible bug fixes, security patches, hotfixes, or performance tuning.

### Proposed Milestone Roadmap

> [!IMPORTANT]
> The roadmap below represents planned delivery milestones. Milestones are **never** tagged or marked complete until all associated code, database migrations, security controls, and automated tests are independently verified. Pre-emptive tagging is strictly prohibited.

| Milestone | Target Scope | Current Status |
| :--- | :--- | :--- |
| **`v0.1.0`** | **Foundation and Authentication** (FastAPI backend, Next.js Liquid Glass UI, session lifecycle, token persistence, IDOR enforcement, basic card models, 100 backend / 13 frontend tests). | **RELEASED & VERIFIED** |
| **`v0.2.0`** | **Credit Card Management** (Interactive Fan Wallet, card catalogue, issuer selection, custom card addition, reward rule configuration, benefit tracking). | *In Development* |
| **`v0.3.0`** | **Offer Intelligence** (Hybrid offer ingestion, HTML/PDF circular parsing, staged human-in-the-loop review, source health monitoring, deduplication). | *In Development* |
| **`v0.4.0`** | **Purchase Intelligence** (Real-time merchant normalization, Decimal reward calculation engine, monthly reward cap tracking, card recommendation API). | *In Verification* |
| **`v0.5.0`** | **AI Assistant & Privacy Gateway** (Zero-trust Privacy Gateway, PII/PCI redactor, user consent enforcement, Google Gemini 2.5 Flash integration, local fallback). | *In Verification* |
| **`v1.0.0`** | **Official Hackathon Release** (End-to-end integration, full documentation, production deployment configuration, comprehensive audit sign-off). | *Target Milestone* |

---

## 3. Git Branching Strategy

CLIQ utilizes a structured, trunk-and-stage branching model designed for high auditability and stability:

```mermaid
gitGraph
    commit id: "12d8375" tag: "origin/first"
    branch feature/auth-lifecycle
    checkout feature/auth-lifecycle
    commit id: "auth-impl"
    commit id: "auth-tests"
    checkout main
    merge feature/auth-lifecycle id: "97f1c04" tag: "v0.1.0"
    checkout first
    merge main id: "sync-first"
```

### Branch Responsibilities

1. **`main` (Production Branch)**:
   - Holds exclusively tested, approved, and production-ready code.
   - Every commit on `main` that represents a milestone is tagged with an annotated SemVer tag (`vX.Y.Z`).
   - Direct pushing to `main` without testing is prohibited.
2. **`first` (Integration / Staging Branch)**:
   - Serves as the primary staging and multi-feature integration branch.
   - Feature branches branch off `first` and merge back into `first` via pull requests or verified merges.
   - Full automated test suites (backend unit/integration/security and frontend unit/component tests) must pass on `first` before promoting changes to `main`.
3. **`feature/<feature-name>` (Feature Branches)**:
   - Isolated branches for specific functional additions (e.g., `feature/card-wallet`, `feature/offer-ingestion`).
   - Branched from `first`.
   - Never contain production credentials or `.env` files.
4. **`fix/<bug-name>` or `hotfix/<patch-name>` (Fix Branches)**:
   - Bug fixes during development branch off `first`.
   - Critical production hotfixes branch directly off `main`, undergo regression testing, and are merged to both `main` (with a PATCH bump, e.g., `v0.1.1`) and back into `first`.

---

## 4. Commit Message Conventions (Conventional Commits)

All commit messages in the CLIQ repository must adhere to the [Conventional Commits v1.0.0 specification](https://www.conventionalcommits.org/):

$$\text{Format: } \mathbf{<type>(<scope>): <short\ description>}$$

### Allowed Types

- `feat`: A new user-facing or backend capability.
- `fix`: A bug fix or error correction.
- `docs`: Documentation additions, updates, or API references.
- `style`: Formatting, whitespace, semicolon changes (no code logic changes).
- `refactor`: Code restructurings that neither fix bugs nor add features.
- `perf`: Performance optimizations (e.g., query tuning, asset compression).
- `test`: Adding missing tests or correcting existing test suites.
- `security`: Security patches, privacy gateway hardening, audit remediation.
- `chore`: Build processes, dependency updates, configuration adjustments.

### Examples

```bash
feat(auth): complete authentication lifecycle and session persistence
fix(cards): prevent overflow clipping in fan wallet animation
security(privacy): enforce Luhn-checked PAN redaction in privacy gateway
docs(release): publish v0.1.0 release notes and version control guidelines
test(rewards): add test coverage for monthly reward cap boundary conditions
```

---

## 5. Rules for Protecting Secrets and Sensitive Files

Fintech systems manage sensitive financial configurations and private keys. The following policies are mandatory:

1. **Strict `.gitignore` Enforcement**:
   - Environment files (`.env`, `.env.local`, `.env.production`) must never be tracked.
   - Database files (`*.db`, `*.sqlite3`, `*.sqlite`, `data/*.db`) are strictly untracked.
   - Private keys, certificates (`*.pem`, `*.key`, `*.p12`, `*.pfx`) are strictly blocked.
   - Cache artifacts (`__pycache__/`, `.pytest_cache/`, `.next/`, `node_modules/`) are untracked.
2. **Template Only (`.env.example`)**:
   - Only mock variable templates with dummy placeholders are allowed in version control (e.g., `GEMINI_API_KEY=your_gemini_api_key_here`).
3. **Pre-Push Secret Scanning**:
   - Before pushing, developers must verify that no API keys (Google Gemini, Supabase, JWT secret keys) or database credentials exist in the commit diff.
4. **Automated Redaction**:
   - All diagnostic logs and audit tables (`ai_request_audit_logs`) record execution metadata only. Prompts, raw responses, and card numbers are never written to logs.

---

## 6. Feature Completion & Release Procedure

Follow this step-by-step checklist to release a new version:

### Step 1: Feature Development & Testing
```bash
# Branch off integration branch
git checkout first
git pull origin first
git checkout -b feature/my-feature

# Implement changes, verify tests
cd backend && pytest -v
cd ../frontend && npm test
```

### Step 2: Merge into Integration Branch (`first`)
```bash
git checkout first
git merge --no-ff feature/my-feature -m "feat(module): integrate my-feature"
git push origin first
```

### Step 3: Integration Verification
- Execute full test suite on `first`:
  - 100% test pass rate required.
  - No secret leaks.
  - Clean working directory.

### Step 4: Promotion to `main`
```bash
git checkout main
git pull origin main
git merge --no-ff first -m "chore(release): prepare v0.X.0 release"
```

### Step 5: Update Documentation & Changelog
- Update `CHANGELOG.md` with verified additions, fixes, and security enhancements under `[X.Y.Z] - YYYY-MM-DD`.
- Update the active version table in `docs/VERSION_CONTROL.md`.
- Commit changes:
  ```bash
  git add CHANGELOG.md docs/VERSION_CONTROL.md
  git commit -m "docs(release): update changelog and version docs for v0.X.0"
  ```

### Step 6: Create Annotated SemVer Tag
```bash
git tag -a v0.X.0 -m "CLIQ v0.X.0 — <Milestone Description>"
```

### Step 7: Push to GitHub
```bash
git push origin main
git push origin v0.X.0
```

---

## 7. Rollback & Hotfix Procedure

If a critical flaw is identified in production:

### Rollback via Revert (Preferred)
```bash
# Never reset or force-push main! Revert the specific faulty commit:
git checkout main
git revert <faulty_commit_hash> -m "fix(revert): rollback faulty commit <hash>"
git push origin main
```

### Hotfix Deployment
```bash
# Branch directly from main
git checkout main
git checkout -b hotfix/v0.1.1-fix-name

# Apply minimal fix, run tests
pytest tests/security/

# Merge to main and tag PATCH version
git checkout main
git merge --no-ff hotfix/v0.1.1-fix-name -m "fix(security): resolve issue description"
git tag -a v0.1.1 -m "Hotfix v0.1.1: resolve issue description"
git push origin main
git push origin v0.1.1

# Sync hotfix back into development branch
git checkout first
git merge main -m "chore: sync hotfix v0.1.1 into first"
git push origin first
```

---

## 8. Verification & Audit Commands

Run these standard verification commands to audit repository health:

```bash
# Verify working tree status
git status

# Inspect branch tracking and synchronization
git branch -vv

# Review commit history and tags
git log -5 --oneline --decorate --all

# List all local tags
git tag --list -n1

# Inspect remote branch references
git ls-remote --heads origin

# Inspect remote tag references and commit bindings
git ls-remote --tags origin
```

