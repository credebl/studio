---
'next-shadcn-dashboard-starter': minor
---

Add the organization wallet page, browser-encrypted key import and X.509
certificate details:

- a `/wallet` page with the wallet details, a did:web DID document panel and
  per-DID actions: details, resolve, set as primary, archive, restore and delete
- import an existing private key when creating a did:key, did:web or
  did:polygon DID; the key is encrypted in the browser to a single-use import
  session and never leaves it in plaintext
- create a DID with any supported method, with API errors shown on the page
- did:web DIDs can be hosted under a folder path on the domain
- light, dark and system themes built on the CREDEBL colours
- X.509 certificate details, the common name and key type in the table, and
  the KMS backend (Askar, NodeKMS or OpenBao) of each certificate
- Next.js 16 with the CVE-2026-44578 fix and refreshed dependencies
