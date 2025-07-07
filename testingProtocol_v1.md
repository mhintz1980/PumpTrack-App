PumpTrack-App AI Testing Protocol v1.0

Reference doc for the Firebase Studio built-in assistant

1 — Objective

Create an automated, multi-agent loop that delivers ≥ 90 % green tests on the first CI run for every Next .js 15 / TypeScript feature developed in PumpTrack-App.

2 — Actors & Prompts

Role

Concrete Tool

Prompt Contract (high-level)

Programmer

Firebase Studio Built-In Assitant & OpenAI Codex

Input: feature spec.Output: src/** code produced via “Problem → Algorithm → Pseudocode → Code” headings.

Test-Designer

OpenAI o3 (ChatGPT)

Input: same spec (no code).Output: • X.spec.ts (unit) • X.component.spec.tsx (component) • X.e2e.ts (Playwright)Include basic, edge, and property tests; target 90 % line coverage; use seeded faker data.

Executor & Feedback

pnpm scripts + GitHub Actions + o3 in separate window/Gemini in IDX

Run tests → on failure, feed stack trace to LLM → patch code (≤ 2 auto retries).

3 — Toolchain Prereqs

pnpm add -D vitest @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event \
  jsdom @vitest/coverage-c8 \
  playwright fast-check faker

vitest.config.ts (jsdom env, coverage reporter)vitest.setup.ts imports @testing-library/jest-dom.

4 — Workflow (CI-gated)

Bootstrap → ensure pnpm test passes with “No tests found”.

run-agents.ts (or Firebase function) orchestrates:

Read /spec/*.md.

Call Programmer → generate implementation branch.

Call Test-Designer → commit tests.

Execute pnpm test && pnpm e2e && pnpm coverage.

On failure → call Feedback prompt for a patch (max 2).

GitHub Action blocks merge unless:

All tests pass.

Global Istanbul coverage ≥ 90 %.

Hidden-spec tests (private to maintainers) also pass.

Human review enforces Tailwind token usage, RSC conventions, a11y.

5 — Prompt Snippets (store centrally)

### Test-Designer
You are “TestDesigner”. Receive ONLY the feature spec.
Generate Vitest and Playwright tests:
  • Cover basic + edge + property cases
  • Aim for ≥90% line coverage
  • Use faker.seed(42) for determinism
Do NOT view or depend on implementation code.

### Feedback
Here is the failing test output:
---
{FAILURE_LOG}
---
Fix the implementation only; do not change tests.

6 — Enforcement Checklist for Firebase Studio AI



7 — Next Incremental Task

Step 1: Developer must run pnpm add -D … and commit vitest.config.ts + setup file.Firebase Studio AI should block progression until this passes pnpm test.

End of protocol – keep this document pinned for reference by all AI agents.