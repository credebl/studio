# next-shadcn-dashboard-starter

## 2.2.0

### Minor Changes

- a0e35e3: Add the platform admin console at `/admin` for platform-wide operations:
  
  - overview metrics, ecosystem-owner invitations, and the ecosystem feature
    toggle
  - server-side `platform_admin` authorization on the layout, every server action
    and the invitations API route
  - server-only access-token exchange; backend tokens never reach the browser
  - hardened `no-store`/`noindex` headers and a negative Vitest security suite
- 46d39f3: Polish the dark theme and the shared navigation:
  
  - deepen the dark background, card and sidebar surfaces and replace the heavy
    shadows with restrained elevation
  - give active navigation a quiet accent fill, a 2px cyan rail and a single soft
    glow instead of a solid primary block
  - remove the hard-coded table border and use muted uppercase header labels
  - flatten cards and make the platform admin header sticky and translucent
  - move the light/dark toggle next to the user menu in both the organization and
    platform admin headers
  
  Light mode keeps the existing solid primary navigation and is materially
  unchanged.

### Patch Changes

- a0e35e3: Harden the platform admin console:
  
  - re-validate the live `platform_admin` role on every guarded request so a
    revoked admin loses access immediately instead of keeping the stale JWT claim
  - apply the hardened `no-store`/`noindex`/`nosniff` headers to `/api/admin/*`
