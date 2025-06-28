# Firebase Studio

This is a Next.js starter built for Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

# PumpTrack App

## Onboarding

- Node version: 20 (see .nvmrc, Nix config)
- Dependency manager: pnpm (activate via corepack)

1. **Install dependencies and approve builds**
   ```bash
   pnpm install
   corepack pnpm approve-builds
   ```
2. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   # then fill in required values
   ```
   - `FIRESTORE_EMULATOR_HOST=localhost:8080`
   - `GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json`
3. **Start the dev server**
   ```bash
   pnpm dev
   ```
4. **Check code**
   ```bash
   pnpm lint && pnpm test && pnpm typecheck
   ```

## Coding & Branching

- All code lives under `code/<slug>` branches
- All client components in `src/app/` must use `"use client"` at file top
- Reference `AGENTS.md` and `CONTRIBUTING.md` for more info

## Documentation

- [PumpTrack MVP / Demo-Ready Checklist] is your task list and the only onboarding you need
- Remove/ignore all legacy/manual scripts/instructions
- See [docs/architecture-notes.md](docs/architecture-notes.md) for project structure
