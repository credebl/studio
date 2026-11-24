---
'next-shadcn-dashboard-starter': patch
---

Harden the platform admin console:

- re-validate the live `platform_admin` role on every guarded request so a
  revoked admin loses access immediately instead of keeping the stale JWT claim
- apply the hardened `no-store`/`noindex`/`nosniff` headers to `/api/admin/*`
