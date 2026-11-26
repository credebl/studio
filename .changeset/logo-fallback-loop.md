---
'next-shadcn-dashboard-starter': patch
---

Fix the sign-in logo requesting a missing theme logo in an endless loop. A missing logo or favicon now falls back to the CREDEBL one once, and a theme name that does not ship with Studio (from `NEXT_PUBLIC_ACTIVE_THEME` or an old `active_theme` cookie) resolves to the CREDEBL theme.
