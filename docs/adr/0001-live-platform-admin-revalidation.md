# ADR 0001: Re-validate the platform admin role on every guarded request

- **Status:** Accepted
- **Date:** 2026-11-08
- **Deciders:** Studio maintainers
- **Related:** [#1358](https://github.com/credebl/studio/pull/1358) (negative
  tests), [#1360](https://github.com/credebl/studio/pull/1360) (implementation)

## Context

The `/admin` console resolves `platform_admin` during sign-in and stores it as
the signed `isPlatformAdmin` claim in the NextAuth JWT. Server guards originally
trusted a `true` claim until the token was re-issued. Removing the role on the
platform API therefore did not take effect in Studio until the user signed out
or the JWT was re-issued. The negative suite pinned that gap with an `it.fails`
test in #1358.

The platform API already enforces `@Roles(OrgRoles.PLATFORM_ADMIN)` on the admin
endpoints (`apps/api-gateway/src/platform/platform.controller.ts`,
`apps/api-gateway/src/user/user.controller.ts`). The Studio guard is therefore
defense-in-depth and UX, not the only authorization boundary. Admin console
traffic is low (a small number of platform operators), and the app has no shared
cache or session store.

## Decision

We keep the strict option: **every call to `getPlatformAdminSession()` checks the
live role against `GET /users/profile`, regardless of the JWT claim.**

- The profile lookup is wrapped in React `cache`, so a layout, page and server
  action rendered in the same request share one call.
- A missing session, a failed lookup, a non-2xx response or a profile without
  `platform_admin` all fail closed.
- The `isPlatformAdmin` claim remains a UI hint for the admin navigation only; it
  is never an authorization source.

The implementation lands in #1360 and covers the layout, every server action and
the `/api/admin/invitations` route handler.

## Consequences

### Positive

- Revoking `platform_admin` takes effect on the next request instead of waiting
  for token re-issue.
- One authorization path is shared by layouts, pages, actions and route
  handlers, which keeps the security tests simple.
- No new cache, database, webhook or platform API change is required.
- Failure is closed: a profile outage denies admin access rather than allowing
  it.

### Negative

- Every guarded request makes one extra backend call (`/users/profile`) on top
  of the session-token exchange. The token exchange is already required for data
  access and both calls are request-cached, but the profile hop still adds
  latency.
- Admin console availability is coupled to the profile endpoint: if it is down,
  admins are redirected out.
- A stale `true` claim still shows the admin navigation until the JWT is
  re-issued; it grants no access, but the UI can be misleading.

### Revisit triggers

Re-open this decision if any of the following becomes true:

- p95 latency for `/admin` regresses or the profile endpoint load becomes
  material.
- The platform API starts returning the current roles (or an authorization
  version) from `/auth/sessionDetails` or the access token. That option keeps
  revocation immediate while reusing the token exchange Studio already needs, so
  it should replace this one.
- Studio runs multiple replicas and a bounded, shared revocation window becomes
  desirable. A 30–60 s role cache is then acceptable.
- The product requirement changes from immediate revocation to bounded
  revocation.

## Alternatives considered

| Option                                                              | Why it was not chosen now                                                                                                                                                                                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trust the `isPlatformAdmin` claim until re-issue                    | Revocation latency is unbounded (up to the JWT lifetime); this is the gap #1358 pinned.                                                                                                                          |
| Short-TTL role cache (30–60 s)                                      | Removes the extra hop but introduces a revocation window and, with multiple replicas, either per-instance windows or new cache infrastructure.                                                                   |
| Roles or an `authzVersion` in `/auth/sessionDetails` / access token | Best long-term option: immediate revocation with no extra round-trip because the token exchange is already request-cached. Requires a coordinated platform API change and a rollout fallback, so it is deferred. |
| Push invalidation from the platform on role change                  | Immediate and cheap on the fast path, but adds webhook/eventing infrastructure and new failure modes for a low-traffic console.                                                                                  |
| Rely only on backend `403` responses                                | The platform already enforces the role, but it would render admin shells and run server actions before failing. Keeping an explicit guard gives clearer UX and defense-in-depth.                                 |

## References

- [`docs/admin-console.md`](../admin-console.md) — access model and security tests
- [`src/lib/server/admin.ts`](../../src/lib/server/admin.ts) — guard implementation
- [`tests/admin-server.test.ts`](../../tests/admin-server.test.ts) — revocation tests
