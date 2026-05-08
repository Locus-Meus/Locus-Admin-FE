# Auth Knowledge

## Current Direction

- Auth is externalized to Java OAuth2/OIDC backend.
- Frontend uses Authorization Code + PKCE for both interactive login and silent re-auth.
- Public entry remains `/` (also `/sign-in`), protected app starts at `/gallery`.
- Local sign-up/reset pages are removed from frontend routing.

## Runtime Flow (Current)

- `AuthSessionManager` (`src/features/auth/ui/auth-session-manager.tsx`) is mounted by `App` (`src/app/App.tsx`) only in top-level window, not in iframe context.
- User-initiated sign in:
  - `navigateToLogin()` -> `createPkceAuthorizationRequest({ redirectUri })` -> browser redirect to `/oauth2/authorize`.
- Silent auth / silent refresh:
  - `authenticateSilently()` in `src/features/auth/model/silent-auth.ts` builds authorize URL with `prompt=none` and `redirectUri = AUTH_CONFIG.silentRedirectUri`.
  - Hidden iframe navigates to authorize endpoint.
  - IdP redirects iframe to `/silent-callback`.
  - `SilentCallbackPage` posts `{ type, search }` back to parent window.
  - Parent validates origin/source/state and calls `completePkceFlow(search, { redirectUri: silentRedirectUri })`.
- Token exchange:
  - `completePkceFlow()` exchanges `code + verifier` using `authApi.exchangeCodeForToken`.
  - Session is updated in Zustand via `setAuth`.
  - PKCE context for that state is cleared.

## PKCE Details

- PKCE generation uses `pkce-challenge` with `S256`.
- Authorization URL generation is centralized in:
  - `src/features/auth/model/create-pkce-authorization-request.ts`
- PKCE context storage is state-keyed:
  - `src/features/auth/model/pkce-storage.ts`
  - Storage format supports multiple concurrent states and expires old records (`10m` TTL).

## Session Model

Source:
- `src/entities/session/model/store.ts`

Fields:
- `isAuth`
- `token` (access token)
- `expiresAt` (epoch ms)
- `user`
- `isRefreshing`
- `authCheckComplete`

Notes:
- No refresh token is used or persisted.
- `AuthTokenResponse` currently expects only:
  - `access_token`
  - `expires_in`

## 401 Handling Strategy

Source:
- `src/shared/api/base-api-client.ts`

Behavior:
- Normal API requests include `Authorization: Bearer <token>` if present.
- On `401`:
  - Attempt one silent recovery (`recoverUnauthorizedRequest`) and retry original request once.
  - If recovery fails, execute `onAuthFailure` -> clear session -> redirect to `/`.
- Auth endpoints in `authApi` pass `skipAuthHandling: true` to avoid recursive interception.

## Guard + Routing

Router (`src/app/providers/router.tsx`):
- Public: `/`, `/sign-in`, `/callback`, `/silent-callback`
- Protected: `/gallery`

Guard (`src/app/providers/require-auth.tsx`):
- If auth status unknown, triggers silent auth and shows loading state.
- Redirects to `/` only after silent auth check fails.

## Config Source

Auth config is centralized in:
- `src/shared/config/auth.ts`

Important defaults:
- `issuer`: `http://localhost:8888`
- `clientId`: `react-client`
- `scope`: `openid profile read`
- `redirectUri`: `VITE_AUTH_REDIRECT_URI` or `<window.origin>/callback`
- `silentRedirectUri`: `VITE_AUTH_SILENT_REDIRECT_URI` or `<window.origin>/silent-callback`
- `endpoints.authorize`: `http://localhost:8888/oauth2/authorize`
- `endpoints.token`: `http://localhost:8888/oauth2/token`
- `endpoints.signUp`: `http://localhost:8888/sign-up` (unless overridden by env)

## Silent Auth Prerequisites

- IdP/client must register both redirect URIs (`/callback` and `/silent-callback`).
- IdP authorize endpoint must be embeddable in iframe for silent flow (`X-Frame-Options`/CSP must allow it).
- Silent callback page must stay same-origin with parent app (`window.location.origin` message validation).

## Open Questions

- Long-term ownership of user profile mapping (currently placeholder fallback in `completePkceFlow`).
- Whether token exchange should remain frontend-side or move fully server-side in future architecture.
