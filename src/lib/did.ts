/** The method part of a DID, for example `web` for `did:web:example.com`. */
export const getDidMethod = (did?: string | null): string | undefined =>
  did?.split(':')[1]

/**
 * The HTTPS URL a did:web document must be served from, following the did:web method specification:
 *   did:web:example.com            -> https://example.com/.well-known/did.json
 *   did:web:example.com:users:bob  -> https://example.com/users/bob/did.json
 *   did:web:example.com%3A3000     -> https://example.com:3000/.well-known/did.json
 * Returns null when the value is not a well-formed did:web identifier.
 */
export function didWebToUrl(did?: string | null): string | null {
  if (!did?.startsWith('did:web:')) {
    return null
  }

  try {
    const [host, ...path] = did
      .slice('did:web:'.length)
      .split(':')
      .map((part) => decodeURIComponent(part))
    if (!host) {
      return null
    }
    return path.length > 0
      ? `https://${host}/${path.join('/')}/did.json`
      : `https://${host}/.well-known/did.json`
  } catch {
    return null
  }
}
