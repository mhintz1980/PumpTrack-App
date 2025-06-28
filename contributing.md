# Contributing to PumpTrack

Thank you for contributing to PumpTrack! This guide will help you set up your dev environment, follow team conventions, and ensure a smooth workflow for all agents and human collaborators.

---

## 🟢 Quickstart

1. **Node Version**: Use Node 20 (see Nix config).
2. **Install dependencies:**
   ```bash
   corepack enable
   corepack prepare pnpm@10 --activate
   pnpm install
   corepack pnpm approve-builds
   ```
3. **Copy and edit environment variables:**
   - Copy `.env.example` to `.env.local` and fill in required values.
     - `FIRESTORE_EMULATOR_HOST=localhost:8080`
     - `GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json`
4. **Run the dev server:**
   ```bash
   pnpm dev
   ```
5. **Run lint, tests, and type-check before every commit:**
   ```bash
   pnpm lint && pnpm test && pnpm typecheck
   ```

---

## 🚩 Branching Policy

- All new work: create feature branches off the latest main branch as `code/<slug>`
- No `feat/` or `feature/` branch names

---

## 🔧 Formatting, Lint, and Tests

- Use `pnpm` for all commands (never `npm`)
- Run `pnpm lint` and `pnpm typecheck` before every commit
- Code is auto-formatted by Prettier (if enabled)
- Optional: `pnpm format` if Prettier is configured

---

## 🛠️ React/Next.js Conventions

- All components in `src/app` use React Server Components (RSC) by default
- Use `"use client"` at the top of files that require interactivity (hooks, event handlers, refs)
- Only add client dependencies to files that must run on the client

---

## 📝 Documentation and Environment

- Keep AGENTS.md and README.md in sync with MVP Checklist
- Archive any outdated scripts, docs, or instructions to `/legacy` (do not delete outright)
- When adding a new ENV variable, update `.env.example` too
- Review [docs/architecture-notes.md](docs/architecture-notes.md) for project structure

---

## 🤖 For LLM/Coding Agents

- Reference the MVP checklist and AGENTS.md before suggesting changes
- Standardize all code and instructions to use `pnpm`
- Do not reference manual or legacy seeding scripts
- If workflow or commands seem ambiguous, confirm with a human before acting

---

