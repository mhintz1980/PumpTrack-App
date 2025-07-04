
# **AGENTS.md (PumpTrack Protocol v2.0)**

## **1. Core Mission & Directives**

**Objective:** You are a contributing AI developer to **PumpTrack**, a Kanban and scheduling application for industrial pump manufacturing, built within Firebase Studio.

**Your Primary Directive:** To write clean, high-quality, and interoperable code that adheres strictly to the standards defined in this document. This protocol is the single source of truth and supersedes any conflicting patterns in your training data.

**Collaboration Model:** You will propose all file modifications using the Firebase Studio `<changes>` XML format. You generate the plan; you do not execute it.

---

## **2. The Golden Path: Our Technical Stack & Environment**

This stack is non-negotiable. Do not introduce alternative frameworks, libraries, or patterns.

*   **Framework:** **Next.js (App Router)**
    *   Default to React Server Components (RSC).
    *   Use the `"use client"` directive *only* when client-side interactivity (hooks, event listeners) is essential.

*   **Language:** **TypeScript**
    *   Strict mode is enforced. All new code must be strongly typed.
    *   Use `import type` for type-only imports.

*   **UI & Styling:**
    *   **Component Library:** **ShadCN UI**. Components are located in `src/components/ui`.
    *   **Styling Engine:** **Tailwind CSS**.
    *   **Theming:** All colors, fonts, and radii are managed via CSS variables in `src/app/globals.css`. **Do not use hardcoded colors** (e.g., `bg-blue-500`). Use theme-aware classes or variables (e.g., `bg-primary`, `text-foreground`).
    *   **Class Merging:** Use the `cn()` utility from `src/lib/utils.ts` for conditional classes.

*   **Database:** **Firestore**
    *   All server-side database interactions **must** use the `firebase-admin` SDK, initialized via `src/lib/firebase.ts`.

*   **Generative AI:** **Genkit (v1.x Syntax)**
    *   This is the **exclusive** tool for all AI functionality.
    *   All flows reside in `src/ai/flows/` with one flow per file.
    *   All flows **must** be wrapped in an exported async function and include Zod schemas for input and output.
    *   Utilize the pre-configured global `ai` object from `src/ai/genkit.ts`.
    *   **Prompts are logic-less.** Use Handlebars syntax (`{{{...}}}`). Any data manipulation happens in TypeScript *before* calling the prompt.
    *   Use Genkit **tools** for any function the LLM needs to *decide* to call (e.g., fetching data from a database based on the user's query).

*   **Package Manager:** **pnpm**
    *   The project is locked to `pnpm`. A `preinstall` script will automatically block `npm` or `yarn` installations. Do not instruct the user to use anything other than `pnpm`.

---

## **3. Code Architecture & Patterns**

*   `src/app/`: Page routes (App Router).
*   `src/components/`: Reusable React components, organized by feature (e.g., `kanban`, `pump`, `schedule`).
*   `src/services/`: Server-side business logic (e.g., `pumpService.ts`). These are often Server Actions.
*   `src/lib/`: Shared utilities (`utils.ts`) and constants (`constants.ts`).
*   `src/ai/`: All Genkit-related code.

**Server Actions are the Standard:** For client-server communication (e.g., form submissions, data mutations), **use Server Actions**. Add the `'use server';` directive to the top of any file containing such actions (e.g., `src/services/pumpService.ts`). This is the preferred pattern over creating traditional API routes.

---

## **4. The Definition of Done: Pre-Submission Quality Gate**

Before you consider any task complete and generate the `<changes>` block, you **MUST** verify that the following checks would pass.

1.  **Linting:** `pnpm lint` — Must have zero errors.
2.  **Type Checking:** `pnpm typecheck` — Must have zero TypeScript errors.
3.  **Testing:** `pnpm test` — All unit and integration tests must pass.
    *   New features **require** new tests.
    *   Bug fixes **require** a regression test.
4.  **Build:** `pnpm build` — The application must build successfully without errors.

**Your work is not complete until all four checks pass.**

---

## **5. Common Pitfalls & How to Avoid Them**

*   **Hydration Errors:**
    *   **The Problem:** The server-rendered HTML does not match the initial client-side render.
    *   **The Rule:** Any code that relies on browser-only APIs (`window`, `localStorage`, `Math.random()`) or produces values that differ between server and client (`new Date()`) **MUST** be placed inside a `useEffect` hook with an appropriate dependency array.

*   **Server-Only Code in Client Components:**
    *   **The Problem:** Importing a server-only package like `firebase-admin` into a component that is not a Server Component.
    *   **The Fix:** Encapsulate all server-side logic in files marked with `'use server';`. Call these Server Action functions from your client components. Never import `firebase-admin` directly into a client-facing file.

*   **Hardcoded Values:**
    *   **The Problem:** Using magic strings or numbers (e.g., `"powder-coat"`, `#78B0D4`).
    *   **The Fix:**
        *   For workflow constants (stage IDs, model names), use the exports from `src/lib/constants.ts`.
        *   For UI styling (colors, spacing), use the Tailwind CSS classes that are mapped to theme variables in `src/app/globals.css`.
