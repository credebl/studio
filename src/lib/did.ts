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

const HOST_LABEL = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
const PATH_SEGMENT = /^[A-Za-z0-9._~-]+$/

export type DidWebParts =
  { ok: true; identifier: string } | { ok: false; error: string }

/**
 * Builds the part of a did:web identifier after `did:web:` from the domain and the optional folder path
 * the document is hosted under:
 *   ('ayanworks.github.io', 'iec/0522012345') -> 'ayanworks.github.io:iec:0522012345'
 * A port is written as `host:port` and encoded as `host%3Aport`, as the did:web specification requires.
 */
export function buildDidWebIdentifier(
  domainInput: string,
  pathInput = '',
): DidWebParts {
  const domain = domainInput
    .trim()
    .replace(/^https?:\/\//i, '')
    .toLowerCase()
  if (!domain) {
    return { ok: false, error: 'Domain is required' }
  }
  if (domain.includes('/')) {
    return {
      ok: false,
      error: 'Enter only the domain here; put the folders in the Path field',
    }
  }

  const [host, port, ...extra] = domain.split(':')
  const validPort = port === undefined || /^\d{1,5}$/.test(port)
  const validHost =
    host === 'localhost' ||
    (host.includes('.') && host.split('.').every((l) => HOST_LABEL.test(l)))
  if (extra.length > 0 || !validPort || !validHost) {
    return {
      ok: false,
      error: 'Enter a valid domain, for example example.com',
    }
  }

  const segments = pathInput
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/\/?did\.json$/i, '')
    .split(/[/:]/)
    .filter(Boolean)
  const badSegment = segments.find((s) => !PATH_SEGMENT.test(s) || s === '..')
  if (badSegment) {
    return {
      ok: false,
      error: `Path segment "${badSegment}" has characters that are not allowed; use letters, numbers, . _ ~ -`,
    }
  }

  const hostPart = port === undefined ? host : `${host}%3A${port}`
  return { ok: true, identifier: [hostPart, ...segments].join(':') }
}
