# AGENTS

## Task Startup Rules

- Before starting any task, read `AGENTS.md`.
- If the task is auth-related, also read `agents/auth.md` before making changes.

## Common Project Knowledge

- Stack: React + TypeScript + Vite + React Router + Zustand + TanStack Query + i18next.
- UI: shared design primitives live in `src/shared/ui`.
- Routing is configured in `src/app/providers/router.tsx`.
- Protected pages use `RequireAuth` in `src/app/providers/require-auth.tsx`.
- Session state is managed by Zustand in `src/entities/session`.
- API access goes through `BaseApiClient` in `src/shared/api/base-api-client.ts`.
- On HTTP 401, local session is cleared and user is redirected to `/`.
- Main protected page is `gallery` (`/gallery`).
- Root path `/` is the public welcome/auth entry.
- i18n resources are in `src/shared/i18n/index.ts` (en/es/ru).

## Working Conventions

- Keep feature boundaries (FSD style): `app`, `pages`, `features`, `entities`, `shared`.
- Prefer exporting through feature/public entry points (`index.ts`).
- Keep auth endpoint values configurable via `VITE_AUTH_*` env vars.
- Prefer simple redirect-based auth flow for external Java auth server.
