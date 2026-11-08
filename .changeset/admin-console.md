---
'next-shadcn-dashboard-starter': minor
---

Add the platform admin console at `/admin` for platform-wide operations:

- overview metrics, ecosystem-owner invitations, and the ecosystem feature
  toggle
- server-side `platform_admin` authorization on the layout, every server action
  and the invitations API route
- server-only access-token exchange; backend tokens never reach the browser
- hardened `no-store`/`noindex` headers and a negative Vitest security suite
