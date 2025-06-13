# Architecture Notes

## Folder Structure

- `/src` — Main application logic, organized by feature and component.
- `/__tests__` — Unit and integration tests (note: this is the test directory, not `/tests`).
- `/docs` — Project documentation and architectural plans.
- `/public` — Static assets (images, icons, etc.).
- `/__mocks__` — API and service mocks for testing.

## Domain-Driven Design (DDD)

- Features and services in `/src` are grouped by domain (e.g., `ai/`, `components/`, `services/`).
- Shared utilities are in `/src/lib/`.
- Types are centralized in `/src/types/`.

## Micro-Front-End Layout

- Not currently implemented, but structure supports modular React components and future MFE adoption.

## Reserved Directories

- `/infra` — Reserved for future Infrastructure-as-Code (IaC); must remain read-only.
- `/database` — Reserved for future migrations; do not create or edit.

## Notes

- Follow the conventions in `AGENTS.md` for all code and documentation changes.
- Update this file if the architecture evolves.