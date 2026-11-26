# ADR 0002: Holder wallet access is a user capability with live revalidation

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Studio maintainers
- **Related:** [ADR 0001](0001-live-platform-admin-revalidation.md),
  [epic #1377](https://github.com/credebl/studio/issues/1377)

## Context

A person may be an individual holder, an organization member, a platform
operator, or any combination. Platform v2.3.0 gives every new user the `holder`
realm role and a `holder` user-org-role with `orgId: null`; the same platform
release exposes user-scoped cloud-wallet APIs on a shared base agent.

Studio previously derived only `isPlatformAdmin` and `hasOrgAccess` from
`userOrgRoles`. Counting `holder` as an organization role sent holder-only users
to a dashboard of 403s. Modeling holder as another org role would also suggest
creating a fake personal organization, which the platform does not need.

## Decision

1. **Holder is a user-level capability**, represented by `hasHolderAccess`, not
   an organization role. `hasOrgAccess` only considers roles attached to a
   non-null `orgId` that are not `platform_admin`, `holder`, or ecosystem-only
   roles.
2. **`holder`, `platform_admin` and org access are independent claims.** Landing
   and shell switching use the combination; no sign-up role choice is added.
3. **The session claims are UI hints only.** `src/lib/server/holder.ts`
   re-validates the live `holder` role on every guarded request, using the same
   token exchange and React request cache pattern as ADR 0001.
4. **The holder shell lives at `/holder`** with its own layout and hardened
   headers. It is excluded from the organization `PageLayout`.
5. **No personal organization, fake `orgId`, or dedicated agent is created.**
   The platform's shared base wallet provisioning is used as released.
6. **Only released APIs are consumed.** Features that require unreleased
   platform fields, such as OID4VP credential selection, stay out of scope.

## Consequences

### Positive

- Holder-only users land in a usable shell; dual-role users can switch.
- Revoking the holder role takes effect on the next request.
- No backend release, schema change, or new deployment topology is needed.
- Holder and organization endpoints cannot be confused because holder calls
  never accept an `orgId`.

### Negative

- Every holder request adds one profile lookup in addition to the session-token
  exchange. Both are request-cached, but the extra hop remains.
- The wallet onboarding probe is indirect until platform#1861 adds an explicit
  status endpoint.
- OID4VP selection remains unavailable until platform#1855 ships.

## Alternatives considered

| Option                            | Why it was not chosen                                             |
| --------------------------------- | ----------------------------------------------------------------- |
| Add a `holder` option to sign-up  | Registration is unchanged for all users; the role already exists. |
| Create a personal organization    | The platform wallet is user-scoped and uses a shared base agent.  |
| Trust the `hasHolderAccess` claim | Role revocation would not take effect until token re-issue.       |
| Build a standalone holder app     | The requirement is one product surface with role-scoped shells.   |
