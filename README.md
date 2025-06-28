# Firebase Studio

This is a Next.js starter built for Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

# PumpTrack App

## Onboarding

- Node version: 20 (see .nvmrc, Nix config)
- Dependency manager: pnpm (activate via corepack)
- Install: `pnpm install && corepack pnpm approve-builds`
- Start: `pnpm dev`
- Check code: `pnpm lint && pnpm test && pnpm typecheck`
- Add environment variables: copy `.env.example` to `.env.local` and fill in
  - `FIRESTORE_EMULATOR_HOST=localhost:8080`
  - `GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json`

## Coding & Branching

- All code lives under `code/<slug>` branches
- All client components in `src/app/` must use `"use client"` at file top
- Reference `AGENTS.md` and `CONTRIBUTING.md` for more info

## Documentation

- [PumpTrack MVP / Demo-Ready Checklist] is your task list and the only onboarding you need
- Remove/ignore all legacy/manual scripts/instructions
