import {
  BasicConstraintsExtension,
  SubjectAlternativeNameExtension,
  X509Certificate,
} from '@peculiar/x509'

/**
 * Reads a certificate chain and a private key in the browser, so the did:x509 form can show what was uploaded and
 * whether it fits together before anything is sent. The agent still checks everything on import.
 */

export type CertificateRole = 'leaf' | 'intermediate' | 'root'

export interface InspectedCertificate {
  role: CertificateRole
  subject: string
  issuer: string
  commonName?: string
  serialNumber: string
  notBefore: Date
  notAfter: Date
  keyAlgorithm: string
  signatureAlgorithm: string
  isCa: boolean
  pathLength?: number
  /** SHA-256 fingerprint as colon separated hex. */
  fingerprint: string
  subjectAltNames: string[]
  /** Whether the certificate is valid at the time of the review. */
  validNow: boolean
}

export interface ReviewFinding {
  /** `error` blocks the import, `warning` is worth a look, `ok` is a check that passed. */
  level: 'error' | 'warning' | 'ok'
  message: string
}

export interface ChainReview {
  certificates: InspectedCertificate[]
  findings: ReviewFinding[]
  /** The DID the agent is expected to derive from the chain, when it can be worked out. */
  expectedDid?: string
  hasErrors: boolean
}

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, '0').toUpperCase(),
  ).join(':')

const toBase64Url = (buffer: ArrayBuffer): string =>
  btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

function commonNameOf(certificate: X509Certificate): string | undefined {
  return certificate.subjectName.getField('CN')[0]
}

function describeKey(certificate: X509Certificate): string {
  const algorithm = certificate.publicKey.algorithm as {
    name: string
    namedCurve?: string
    modulusLength?: number
  }
  if (algorithm.namedCurve) {
    return `${algorithm.name} ${algorithm.namedCurve}`
  }
  if (algorithm.modulusLength) {
    return `${algorithm.name} ${algorithm.modulusLength}`
  }
  return algorithm.name
}

function describeSignature(certificate: X509Certificate): string {
  const algorithm = certificate.signatureAlgorithm as {
    name: string
    hash?: { name: string }
  }
  return algorithm.hash
    ? `${algorithm.name} with ${algorithm.hash.name}`
    : algorithm.name
}

async function inspectCertificate(
  certificate: X509Certificate,
  role: CertificateRole,
  now: Date,
): Promise<InspectedCertificate> {
  const constraints = certificate.getExtension(BasicConstraintsExtension)
  const alternativeNames = certificate.getExtension(
    SubjectAlternativeNameExtension,
  )

  return {
    role,
    subject: certificate.subject,
    issuer: certificate.issuer,
    commonName: commonNameOf(certificate),
    serialNumber: certificate.serialNumber.toUpperCase(),
    notBefore: certificate.notBefore,
    notAfter: certificate.notAfter,
    keyAlgorithm: describeKey(certificate),
    signatureAlgorithm: describeSignature(certificate),
    isCa: constraints?.ca ?? false,
    pathLength: constraints?.pathLength,
    fingerprint: toHex(await certificate.getThumbprint('SHA-256')),
    subjectAltNames: (alternativeNames?.names.items ?? []).map(
      (name) => name.value,
    ),
    validNow: certificate.notBefore <= now && now <= certificate.notAfter,
  }
}

const label = (index: number, total: number): string => {
  if (index === 0) {
    return 'The leaf certificate'
  }
  return index === total - 1
    ? 'The last certificate'
    : `Certificate ${index + 1}`
}

/** The DID the agent derives from a chain: the last certificate's fingerprint and the common name of the leaf. */
async function expectedDidOf(
  certificates: X509Certificate[],
): Promise<string | undefined> {
  const commonName = commonNameOf(certificates[0])
  if (!commonName || !/^[A-Za-z0-9._-]+$/.test(commonName)) {
    return undefined
  }
  const fingerprint =
    await certificates[certificates.length - 1].getThumbprint('SHA-256')
  return `did:x509:0:sha256:${toBase64Url(fingerprint)}::subject:CN:${commonName}`
}

/**
 * Reviews PEM certificates in the order given (leaf first). Never throws for a bad chain: a certificate that cannot be
 * read, a wrong order, an expired certificate and so on come back as findings.
 */
export async function reviewCertificateChain(
  pems: string[],
  now: Date = new Date(),
): Promise<ChainReview> {
  const findings: ReviewFinding[] = []
  const parsed: X509Certificate[] = []

  for (let index = 0; index < pems.length; index += 1) {
    try {
      parsed.push(new X509Certificate(pems[index]))
    } catch {
      findings.push({
        level: 'error',
        message: `Certificate ${index + 1} could not be read`,
      })
    }
  }
  if (parsed.length !== pems.length || parsed.length === 0) {
    return { certificates: [], findings, hasErrors: true }
  }

  const lastSelfSigned = await parsed[parsed.length - 1].isSelfSigned()
  const certificates = await Promise.all(
    parsed.map((certificate, index) => {
      let role: CertificateRole = 'intermediate'
      if (index === 0) {
        role = 'leaf'
      } else if (index === parsed.length - 1 && lastSelfSigned) {
        role = 'root'
      }
      return inspectCertificate(certificate, role, now)
    }),
  )

  certificates.forEach((certificate, index) => {
    if (now < certificate.notBefore) {
      findings.push({
        level: 'error',
        message: `${label(index, parsed.length)} is not valid yet`,
      })
    } else if (now > certificate.notAfter) {
      findings.push({
        level: 'error',
        message: `${label(index, parsed.length)} has expired`,
      })
    }
  })

  // Each certificate must be signed by the next one.
  let orderOk = true
  for (let index = 0; index < parsed.length - 1; index += 1) {
    const signedByNext = await parsed[index]
      .verify({ publicKey: parsed[index + 1], signatureOnly: true })
      .catch(() => false)
    if (!signedByNext) {
      orderOk = false
      findings.push({
        level: 'error',
        message: `Certificate ${index + 1} was not issued by certificate ${index + 2}. The chain must run leaf first, then each issuer, with the root last.`,
      })
    }
  }

  if (parsed.length > 1 && orderOk) {
    findings.push({
      level: 'ok',
      message: 'Each certificate is signed by the next one',
    })
  }
  if (lastSelfSigned) {
    findings.push({
      level: 'ok',
      message: 'The chain ends at a self-signed root certificate',
    })
  } else {
    findings.push({
      level: 'warning',
      message:
        'The chain does not end at a self-signed root. The DID is anchored to the last certificate.',
    })
  }
  if (certificates[0].isCa) {
    findings.push({
      level: 'warning',
      message:
        'The first certificate is a CA certificate. A leaf (end-entity) certificate is expected first.',
    })
  }
  if (!certificates[0].commonName) {
    findings.push({
      level: 'warning',
      message: 'The leaf certificate has no common name (CN)',
    })
  }

  return {
    certificates,
    findings,
    expectedDid: orderOk ? await expectedDidOf(parsed) : undefined,
    hasErrors: findings.some((finding) => finding.level === 'error'),
  }
}

export type KeyMatch = 'match' | 'mismatch' | 'unverifiable'

export interface KeyReview {
  /** What the key is, for example "P-256 EC private key". */
  description: string
  match: KeyMatch
  /** What the review found, in a sentence fit for the form. */
  detail: string
}

const PEM_KEY = /-----BEGIN ([A-Z ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/

function derOf(body: string): Uint8Array {
  return Uint8Array.from(atob(body.replace(/\s+/g, '')), (char) =>
    char.charCodeAt(0),
  )
}

// --- minimal DER writing, to wrap SEC1 / PKCS#1 keys as PKCS#8 -------------------------------------------------

const derLength = (length: number): number[] => {
  if (length < 0x80) {
    return [length]
  }
  const bytes: number[] = []
  for (let rest = length; rest > 0; rest = Math.floor(rest / 256)) {
    bytes.unshift(rest % 256)
  }
  return [0x80 | bytes.length, ...bytes]
}

const derElement = (tag: number, content: number[]): number[] => [
  tag,
  ...derLength(content.length),
  ...content,
]

const OID_EC_PUBLIC_KEY = [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01]
const OID_RSA_ENCRYPTION = [
  0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
]
const CURVE_OIDS: Record<string, number[]> = {
  'P-256': [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07],
  'P-384': [0x2b, 0x81, 0x04, 0x00, 0x22],
  'P-521': [0x2b, 0x81, 0x04, 0x00, 0x23],
}

function wrapAsPkcs8(
  algorithmIdentifier: number[],
  privateKey: Uint8Array,
): Uint8Array {
  return Uint8Array.from(
    derElement(0x30, [
      ...derElement(0x02, [0]),
      ...algorithmIdentifier,
      ...derElement(0x04, Array.from(privateKey)),
    ]),
  )
}

type PublicKeyAlgorithm = {
  name: string
  namedCurve?: string
  modulusLength?: number
}

function importParameters(
  algorithm: PublicKeyAlgorithm,
): Record<string, unknown> {
  if (algorithm.name === 'ECDSA') {
    return { name: 'ECDSA', namedCurve: algorithm.namedCurve }
  }
  if (algorithm.name === 'RSASSA-PKCS1-v1_5' || algorithm.name === 'RSA-PSS') {
    return { name: algorithm.name, hash: 'SHA-256' }
  }
  return { name: algorithm.name }
}

/** Compares the public parts of two JWKs of the same kind. */
function samePublicKey(a: JsonWebKey, b: JsonWebKey): boolean {
  if (a.kty !== b.kty) {
    return false
  }
  if (a.kty === 'EC') {
    return a.crv === b.crv && a.x === b.x && a.y === b.y
  }
  if (a.kty === 'OKP') {
    return a.crv === b.crv && a.x === b.x
  }
  if (a.kty === 'RSA') {
    return a.n === b.n && a.e === b.e
  }
  return false
}

async function publicJwkOf(certificate: X509Certificate): Promise<JsonWebKey> {
  const key = await crypto.subtle.importKey(
    'spki',
    certificate.publicKey.rawData,
    importParameters(
      certificate.publicKey.algorithm as PublicKeyAlgorithm,
    ) as never,
    true,
    ['verify'],
  )
  return crypto.subtle.exportKey('jwk', key)
}

const unverifiable = (description: string, detail: string): KeyReview => ({
  description,
  match: 'unverifiable',
  detail,
})

function parseCertificate(pem: string): X509Certificate | null {
  try {
    return new X509Certificate(pem)
  } catch {
    return null
  }
}

async function publicJwkOrNull(
  certificate: X509Certificate,
): Promise<JsonWebKey | null> {
  try {
    return await publicJwkOf(certificate)
  } catch {
    return null
  }
}

/** The key as PKCS#8 DER, wrapping a SEC1 EC or PKCS#1 RSA key; null when the kind cannot be handled here. */
function pkcs8Of(
  kind: string,
  body: string,
  algorithm: PublicKeyAlgorithm,
): Uint8Array | null {
  if (kind === 'PRIVATE KEY') {
    return derOf(body)
  }
  if (
    kind === 'EC PRIVATE KEY' &&
    algorithm.namedCurve !== undefined &&
    algorithm.namedCurve in CURVE_OIDS
  ) {
    return wrapAsPkcs8(
      derElement(0x30, [
        ...derElement(0x06, OID_EC_PUBLIC_KEY),
        ...derElement(0x06, CURVE_OIDS[algorithm.namedCurve]),
      ]),
      derOf(body),
    )
  }
  if (kind === 'RSA PRIVATE KEY') {
    return wrapAsPkcs8(
      derElement(0x30, [
        ...derElement(0x06, OID_RSA_ENCRYPTION),
        ...derElement(0x05, []),
      ]),
      derOf(body),
    )
  }
  return null
}

/**
 * Checks a private key against the leaf certificate. A PEM key (PKCS#8, SEC1 or PKCS#1) or a private JWK is compared
 * with the certificate's public key. An encrypted key, or one this browser cannot work with, is reported as
 * unverifiable so the agent checks it on import.
 */
export async function reviewPrivateKey(
  keyText: string,
  leafPem: string,
): Promise<KeyReview> {
  const text = keyText.trim()
  const leaf = parseCertificate(leafPem)
  if (!leaf) {
    return unverifiable('Private key', 'The leaf certificate could not be read')
  }
  const algorithm = leaf.publicKey.algorithm as PublicKeyAlgorithm
  const leafJwk = await publicJwkOrNull(leaf)
  if (!leafJwk) {
    return unverifiable(
      'Private key',
      'This browser cannot compare keys of the certificate’s type. The agent checks the key on import.',
    )
  }

  try {
    if (text.startsWith('{')) {
      const jwk = JSON.parse(text) as JsonWebKey
      const description = `Private JWK (${jwk.kty}${jwk.crv ? ` ${jwk.crv}` : ''})`
      if (!jwk.d && !jwk.p) {
        return {
          description,
          match: 'mismatch',
          detail: 'This JWK holds no private key',
        }
      }
      return samePublicKey(jwk, leafJwk)
        ? {
            description,
            match: 'match',
            detail: 'The key matches the leaf certificate',
          }
        : {
            description,
            match: 'mismatch',
            detail: 'The key does not belong to the leaf certificate',
          }
    }

    const pem = PEM_KEY.exec(text)
    if (!pem) {
      return unverifiable(
        'Private key',
        'The key format could not be recognised',
      )
    }
    const [, kind, body] = pem
    if (
      kind === 'ENCRYPTED PRIVATE KEY' ||
      /Proc-Type: 4,ENCRYPTED/.test(text)
    ) {
      return unverifiable(
        'Encrypted private key',
        'The key is encrypted, so it cannot be compared here. The agent checks it on import.',
      )
    }

    const pkcs8 = pkcs8Of(kind, body, algorithm)
    if (!pkcs8) {
      return unverifiable(
        'Private key',
        'The key type could not be compared here',
      )
    }

    const description = `${algorithm.namedCurve ?? algorithm.name} private key`
    try {
      const key = await crypto.subtle.importKey(
        'pkcs8',
        pkcs8,
        importParameters(algorithm) as never,
        true,
        ['sign'],
      )
      const jwk = await crypto.subtle.exportKey('jwk', key)
      return samePublicKey(jwk, leafJwk)
        ? {
            description,
            match: 'match',
            detail: 'The key matches the leaf certificate',
          }
        : {
            description,
            match: 'mismatch',
            detail: 'The key does not belong to the leaf certificate',
          }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotSupportedError') {
        return unverifiable(
          description,
          'This browser cannot compare this type of key. The agent checks it on import.',
        )
      }
      return {
        description: 'Private key',
        match: 'mismatch',
        detail: `This is not a ${algorithm.namedCurve ?? algorithm.name} key like the leaf certificate’s`,
      }
    }
  } catch {
    return unverifiable('Private key', 'The key could not be read')
  }
}
