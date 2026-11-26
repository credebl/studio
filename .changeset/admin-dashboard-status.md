---
'next-shadcn-dashboard-starter': minor
---

Extend the platform admin console:

- a richer `/admin` dashboard with organizations, schemas, credential
  definitions, ledgers, an invitation breakdown, recent organizations and a
  platform status strip; each card loads on its own and shows "Unavailable"
  when its source fails
- a "Known to Studio" card listing the agents Studio can find
- a view-only `/admin/platform-settings` page (the email API key is shown only
  as configured or not set)
- a `/admin/status` page with reachability checks for the platform services,
  with a list of what cannot be checked
- the admin sidebar is grouped into Overview, Platform and Ecosystem, and
  "Settings" is now "Ecosystem settings"
