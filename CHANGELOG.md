# credebl-studio

## 2.3.0

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
- 15ed90b: Add the organization wallet page, browser-encrypted key import and X.509
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
  - import a did:x509 from a reviewed certificate chain and key, and import an
    X.509 certificate together with its chain; the private keys are encrypted in
    the browser before they are sent
  - enable OID4VC SD-JWT and mDoc in the wallet setup, and show the KMS backend of
    each DID
  - OID4VC issuer management at `/oid4vc`: create and edit issuers, credential
    templates and offers, with offer details and lifecycle actions
  - Next.js 16 with the CVE-2026-44578 fix and refreshed dependencies

### Patch Changes

- a0e35e3: Harden the platform admin console:
  
  - re-validate the live `platform_admin` role on every guarded request so a
    revoked admin loses access immediately instead of keeping the stale JWT claim
  - apply the hardened `no-store`/`noindex`/`nosniff` headers to `/api/admin/*`
