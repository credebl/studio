# Holder cloud wallet in Studio

The holder wallet is a user-level capability in Studio at `/holder`. It is not
an organization role and it is not a separate application. A signed-in person
may have an organization membership, a personal wallet, both, or neither.

## API baseline

The implementation targets **platform v2.3.0** and **agent-controller v2.3.3**.
No new backend release is required.

Released endpoints used by Studio:

| Concern     | Endpoints                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wallet      | `POST /create-wallet`                                                                                                                                             |
| DIDs        | `GET /did`, `POST /did`, `POST /did/import/session`                                                                                                               |
| Credentials | `GET /holder/sd-jwt-vcs`, `GET /holder/mdoc-vcs`, `GET /holder/w3c-vcs`, `POST /holder/decode-sdjwt`, `POST /holder/mdoc-vcs/decode`, `DELETE /holder/credential` |
| OID4VCI     | `POST /oid4vc/holder/resolve-credential-offer`, `POST /oid4vc/holder/authorization-request`, `POST /oid4vc/holder/request-credential`                             |
| OID4VP      | `POST /oid4vc/holder/resolve-proof-request`, `POST /oid4vc/holder/accept-proof-request`                                                                           |
| DIDComm     | `GET/POST /proofs`, `POST /proofs/accept-request`, `GET/POST /connections`, `POST /receive-invitation-url`, `POST /accept-offer`                                  |

All of these are guarded by the platform `UserRoleGuard` and derive the user id
and email from the JWT. Studio never sends an `orgId` to these endpoints.

Platform v2.3.0 assigns every new user a `holder` Keycloak realm role and a
`holder` `userOrgRole` row with `orgId: null`. `GET /users/profile` returns that
row, so no new entitlement API is needed.

## Access model

Three independent claims are resolved during sign-in:

| Claim             | Source                                         | Grants             |
| ----------------- | ---------------------------------------------- | ------------------ |
| `isPlatformAdmin` | `platform_admin` role                          | `/admin` shell     |
| `hasOrgAccess`    | non-holder role attached to a non-null `orgId` | Organization shell |
| `hasHolderAccess` | `holder` role, regardless of `orgId`           | `/holder` shell    |

The claims are UI hints only. `src/lib/server/holder.ts` re-checks the live
`holder` role on every guarded request, mirroring ADR 0001. The platform APIs
remain the real authorization boundary.

## Landing rules

| Context                | Destination                                    |
| ---------------------- | ---------------------------------------------- |
| `redirectTo` present   | Honor it                                       |
| Platform admin, no org | `/admin`                                       |
| Holder only            | `/holder` (redirected to onboarding if needed) |
| Organization only      | `/dashboard`                                   |
| Holder + organization  | `/dashboard`; switch from either shell         |

## Onboarding

The platform provisions a tenant on a platform-configured shared base agent.
There is no personal organization and no shared/dedicated agent choice in
Studio.

There is no wallet-status `GET` in v2.3.0. Studio uses `GET /did` as a
side-effect-free probe: a 404 means no wallet exists, any other error means the
service is unavailable. `POST /create-wallet` returns 409 if a wallet already
exists, so that path remains safe against duplicate provisioning.

The shared DID form offers `did:key`, `did:web` and `did:polygon`. Platform
v2.3.0 requires a 32-character `seed` for `did:key` and `did:web` when no key is
imported, so Studio generates a fresh random seed in the server action. It is
never rendered in the browser, stored in Studio, or accepted from the form.

Holders can also import their own private key (PEM, base64 DER or private JWK;
a 64-character hex secp256k1 key for `did:polygon`). The browser requests a
single-use import session from `POST /did/import/session`, encrypts the key with
WebCrypto to the session's public key, and submits only the opaque JWE and
session id as `encryptedKey`. Plaintext private keys never reach Studio, the
platform gateway, NATS, or logs. Imported-key DIDs omit the generated seed.

`did:x509` is shown but disabled for holders. Platform v2.3.0 only exposes x509
under `/orgs/:orgId/agents/did/x509/import`, and the holder import-session DTO
rejects `x509`/`x509-certificate`, although agent-controller v2.3.3 supports
both. Holder x509 support is tracked in
[credebl/platform#1864](https://github.com/credebl/platform/issues/1864).

## Known limitations

- Holder list endpoints return a plain array with no query parameters, but an
  envelope `{ data, pagination, filters? }` when parameters are sent. Studio
  calls them without parameters and normalizes both shapes.
- OID4VP credential selection (`selectedCredentials`) and `verifierResponse`
  are supported by agent-controller v2.3.3 but not exposed by platform v2.3.0.
  Follow [credebl/platform#1855](https://github.com/credebl/platform/issues/1855).
- An explicit wallet-status endpoint is tracked in
  [credebl/platform#1861](https://github.com/credebl/platform/issues/1861).
