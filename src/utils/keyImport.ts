/**
 * Browser side of the encrypted DID key import flow.
 *
 * The private key is encrypted to the public key of a single-use import session before it leaves the browser, so it
 * never appears in an HTTP request body, a gateway or NATS log, or the agent service. The envelope is a standard
 * compact JWE (`RSA-OAEP-256` + `A256GCM`) whose protected header is also its AAD, which binds it to one session,
 * one DID method and one expiry.
 */

export interface KeyImportSession {
  sessionId: string
  kid: string
  method: string
  expiresAt: string
  alg: string
  enc: string
  publicKeyJwk: JsonWebKey
  protectedHeader: Record<string, unknown>
}

export interface KeyImportKeyMaterial {
  privateKey?: string
  privateKeyJwk?: Record<string, unknown>
  passphrase?: string
}

export interface EncryptedKey {
  sessionId: string
  jwe: string
}

export class KeyImportError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'KeyImportError'
  }
}

const TEXT_ENCODER = new TextEncoder()
const IV_LENGTH = 12
const TAG_LENGTH = 16

function base64UrlEncode(value: Uint8Array): string {
  let binary = ''
  for (let index = 0; index < value.length; index += 1) {
    binary += String.fromCharCode(value[index])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function subtleCrypto(): SubtleCrypto {
  const { crypto } = globalThis
  if (!crypto?.subtle) {
    throw new KeyImportError(
      'Key import needs WebCrypto. Use a modern browser over HTTPS (or localhost).',
    )
  }
  return crypto.subtle
}

/**
 * Parses the value pasted into the import field. A JSON object is treated as a private JWK, everything else as a PEM
 * or base64 DER private key.
 */
export function parseKeyMaterial(
  value: string,
  passphrase?: string,
): KeyImportKeyMaterial {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new KeyImportError('Enter the private key to import')
  }

  if (trimmed.startsWith('{')) {
    let parsed: unknown = null
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      throw new KeyImportError('The private JWK is not valid JSON')
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new KeyImportError('The private JWK is not a valid JSON object')
    }
    if (passphrase) {
      throw new KeyImportError(
        'A passphrase only applies to an encrypted PEM key',
      )
    }
    return { privateKeyJwk: parsed as Record<string, unknown> }
  }

  return { privateKey: trimmed, ...(passphrase ? { passphrase } : {}) }
}

/**
 * Encrypts key material to a session returned by the gateway. The caller sends the result back as `encryptedKey`.
 */
export async function encryptKeyMaterialForImport(
  session: KeyImportSession,
  material: KeyImportKeyMaterial,
): Promise<EncryptedKey> {
  if (session.alg !== 'RSA-OAEP-256' || session.enc !== 'A256GCM') {
    throw new KeyImportError(
      `Unsupported key import algorithm: ${session.alg}/${session.enc}`,
    )
  }
  if (!session.sessionId || !session.protectedHeader) {
    throw new KeyImportError('The key import session is invalid')
  }
  if (Boolean(material.privateKey) === Boolean(material.privateKeyJwk)) {
    throw new KeyImportError('Provide exactly one private key')
  }

  const subtle = subtleCrypto()
  const protectedSegment = base64UrlEncode(
    TEXT_ENCODER.encode(JSON.stringify(session.protectedHeader)),
  )

  const publicJwk: JsonWebKey = {
    kty: session.publicKeyJwk.kty ?? 'RSA',
    n: session.publicKeyJwk.n,
    e: session.publicKeyJwk.e,
    alg: 'RSA-OAEP-256',
    ext: true,
  }
  const publicKey = await subtle
    .importKey('jwk', publicJwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, [
      'encrypt',
    ])
    .catch(() => {
      throw new KeyImportError('The key import session public key is invalid')
    })

  const contentEncryptionKey = await subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt'],
  )
  const rawContentEncryptionKey = new Uint8Array(
    await subtle.exportKey('raw', contentEncryptionKey),
  )

  const encryptedKey = new Uint8Array(
    await subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      rawContentEncryptionKey,
    ),
  )

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const plaintext = TEXT_ENCODER.encode(JSON.stringify(material))
  const sealed = new Uint8Array(
    await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: TEXT_ENCODER.encode(protectedSegment),
        tagLength: TAG_LENGTH * 8,
      },
      contentEncryptionKey,
      plaintext,
    ),
  )

  // WebCrypto appends the authentication tag to the ciphertext; JWE compact uses a separate segment.
  const ciphertext = sealed.slice(0, sealed.length - TAG_LENGTH)
  const tag = sealed.slice(sealed.length - TAG_LENGTH)

  return {
    sessionId: session.sessionId,
    jwe: [
      protectedSegment,
      base64UrlEncode(encryptedKey),
      base64UrlEncode(iv),
      base64UrlEncode(ciphertext),
      base64UrlEncode(tag),
    ].join('.'),
  }
}
