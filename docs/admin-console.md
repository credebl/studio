# Platform Admin Console

The platform operations console lives inside Studio at `/admin`. It replaces
the former standalone `platform-admin` application and is deployed as part of
the Studio image.

## Access model

- Access requires the `platform_admin` role on the platform API.
- The role is resolved server-side during sign-in and stored as a signed
  `isPlatformAdmin` claim in the NextAuth JWT. Sessions minted before the claim
  existed are resolved lazily on their next request.
- `/admin` is guarded in two places:
  - `src/app/admin/layout.tsx` redirects non-admins to `/dashboard`.
  - Every server action and the `/api/admin/invitations` route re-check the
    live role before doing any work.
- Platform access tokens are never sent to the browser for these screens. The
  server exchanges the httpOnly NextAuth `sessionId` for an access token via
  `/auth/sessionDetails`, cached per request with React `cache`.
- `/admin` and `/api/admin` responses are sent with `Cache-Control: no-store`,
  `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff` and
  `Referrer-Policy: no-referrer`.
- The `isPlatformAdmin` claim is only a UI hint. Server guards re-check the live
  `platform_admin` role on every request, so revoking the role takes effect
  immediately; the platform API remains the final authorization boundary.

## Screens

| Route                | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `/admin`             | Platform metrics (ecosystems, invitations, orgs)      |
| `/admin/invitations` | List and create ecosystem-owner invitations           |
| `/admin/settings`    | Enable or disable the ecosystem feature platform-wide |

The previous standalone app's `/sessions` screen was dropped because Studio
already provides an equivalent sessions view under Profile.

## Security tests

`pnpm test` runs the Vitest negative suite in `tests/`. It mocks the session,
backend fetches and server actions, and covers:

- missing and non-admin sessions, a revoked admin with a stale claim, and failed
  profile lookups
- direct server-action invocation, invalid input and backend error redaction
- route-guard denial, paging/search clamping and `no-store` responses
- hardened headers on `/admin*` and `/api/admin/*`, plus token refresh-once
  behavior

A stale `isPlatformAdmin` claim is never trusted for authorization: every guard
call re-validates the role against the profile endpoint. The claim is still used
to decide whether the admin navigation is shown.

## Deployment

`next.config.js` sets `output: 'standalone'`. The `Dockerfile` builds with a
frozen lockfile, copies only the standalone server, static assets and `public`
directory, and runs `node server.js` as a non-root user with telemetry disabled.

## Known backend dependency

`GET /ecosystem/dashboard/summary` is still guarded by `EcosystemRolesGuard`
(which only admits `PLATFORM_ADMIN_EMAIL`) instead of `OrgRolesGuard`. Until
that is fixed in `credebl/platform`, the overview page will return the
"unavailable" state for platform admins other than that single email address.
The rest of the console is unaffected.
