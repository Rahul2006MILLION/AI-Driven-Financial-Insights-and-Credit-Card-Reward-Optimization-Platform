# Contributing to CLIQ

Thank you for contributing to CLIQ! We welcome contributions that maintain our high standards of architectural modularity, deterministic financial precision, security, and multilingual accessibility.

---

## 1. Development Principles

1. **Deterministic Financial Precision:** Never delegate numerical calculations or reward decisions to LLMs. All monetary values must use `Decimal`.
2. **Security by Design:** Every query must enforce user ownership (`user_id = current_user.id`). Never expose sensitive financial credentials.
3. **Multilingual Parity:** User-facing strings must have corresponding representations across English, Hindi, and Kannada.
4. **Tested Changes:** All new features must include automated unit, integration, or security tests.
5. **Documentation First:** Update corresponding `.md` files in `/docs` whenever modifying APIs, models, or architectures.

---

## 2. Commit & Branch Conventions

- Branch naming:
  - `feat/feature-name`
  - `fix/bug-fix`
  - `sec/security-patch`
  - `docs/documentation-update`
- Commit message format:
  ```text
  feat(reward-engine): add per-transaction cap enforcement
  fix(auth): enforce token expiration check
  docs(api): update swagger schemas for optimization endpoint
  ```

---

## 3. Pull Request Process

1. Create a feature branch from `main`.
2. Ensure backend tests pass: `pytest`
3. Ensure frontend builds cleanly: `npm run build`
4. Submit PR with detailed explanation of changes and test evidence.
