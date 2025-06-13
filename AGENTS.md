# AGENTS.md – Rules of the Repo

## 📦 Project Map
- `/src`        — app logic Codex may edit
- `/__tests__`  — must stay green (test directory; not `/tests`)
- `/infra`      — IaC files; **read only** (reserved, may not exist)
- `/database`   — migrations; **read only** (reserved, may not exist)
- `/docs`       — auto-update OK
- `/__mocks__`  — API/service mocks for tests

## ✨ Code Style
- Language: TypeScript 5.x
- Formatter: `eslint --fix && prettier`
- Naming: `camelCase` functions, `PascalCase` React comps
- Comment complex branches; skip obvious getters

## 🧪 Testing & Linting
```bash
npm ci               # install deps
npm run lint         # ESLint + Prettier check
npm test             # Vitest unit tests
```
All commands must succeed before opening a PR.

🚀 Run Local Dev:
```bash
npm run dev          # Next.js dev server
```

🔀 Pull-Request Template  
Title: [Fix|Feat|Chore]: <concise summary>

Body :

- What changed & why
- Testing done
- Screenshots (if UI)

Label docs-only PRs with docs.

🛑 Do NOT
- Touch files in /infra or /database/migrations
- Introduce new deps without asking

✅ Programmatic Checks
After edits, run:
```bash
npm run type-check   # tsc --noEmit
npm run build        # static build to ensure no runtime TS errors
```
Push only if all pass.

🤖 Agent Etiquette
- Prefer refactors over quick patches
- Chunk large work into multiple small PRs
- Cite sources when pasting from external docs

---

## 🛠️ Helpful Stubs & References

- **Environment variables:** No environment variables are currently required by this codebase. See `.env.example` for details.
- **Architecture:** See [`docs/architecture-notes.md`](docs/architecture-notes.md) for folder structure, DDD, and reserved directories.
- **API Mocks:** See [`__mocks__/stripe.ts`](__mocks__/stripe.ts) for third-party API mocking patterns.
- **Changelog:** See [`CHANGELOG.md`](CHANGELOG.md) and update with every user-facing or infrastructure change.

## 🏷️ Branch Strategy

- `main`: production-ready code
- `develop`: integration branch for features
- Feature branches: `feat/<short-desc>`, `fix/<short-desc>`, etc.
- Tag releases as `vX.Y.Z`

## 📝 Changelog Rules

- Keep `CHANGELOG.md` up to date (see template).
- Use [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## ⚖️ Precedence & Overrides

- Instructions apply to the directory tree they sit in.
- Nested files overrule parent ones.
- A direct user/system prompt beats anything in `AGENTS.md`.