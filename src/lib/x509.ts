import {
  AuthorityKeyIdentifierExtension,
  BasicConstraintsExtension,
  ExtendedKeyUsageExtension,
  Extension,
  IssuerAlternativeNameExtension,
  KeyUsagesExtension,
  SubjectAlternativeNameExtension,
  SubjectKeyIdentifierExtension,
  X509Certificate,
} from '@peculiar/x509'
import {
  KEY_TYPES,
  cnRegexPattern,
  sanRegexPattern,
} from '@/config/CommonConstant'

export function parsePemCertificate(pem: string): {
  keyType: 'Ed25519' | 'P-256'
  commonName?: string
} {
  const cert = new X509Certificate(pem)

  const algorithm = cert.publicKey.algorithm.name

  let keyType: 'Ed25519' | 'P-256' = 'P-256'
  if (algorithm === KEY_TYPES.ED25519) {
    keyType = 'Ed25519'
  } else if (
    algorithm === 'ECDSA' &&
    cert.publicKey.algorithm.name === KEY_TYPES.P_256
  ) {
    keyType = 'P-256'
  }

  const commonName = cert.subject
    .split(',')
    .map((s) => s.trim())
    .find((s) => s.startsWith('CN='))
    ?.substring(3)

  return {
    keyType,
    commonName,
  }
}

export function parseBase64X509Certificate(base64Cert: string): {
  commonName?: string
  subjectAlternativeNames?: string[]
} {
  const pem = `-----BEGIN CERTIFICATE-----\n${base64Cert
    .match(/.{1,64}/g)
    ?.join('\n')}\n-----END CERTIFICATE-----`

  const cnRegex = cnRegexPattern
  const cnMatch = cnRegex.exec(pem)
  const commonName = cnMatch?.[1]

  const sanRegex = sanRegexPattern
  const subjectAlternativeNames: string[] = []

  let sanMatch: RegExpExecArray | null = null

  while ((sanMatch = sanRegex.exec(pem)) !== null) {
    subjectAlternativeNames.push(sanMatch[1])
  }

  return {
    commonName,
    subjectAlternativeNames,
  }
}

const commonNameCache = new Map<string, string | undefined>()

const readCommonName = (certificate: string): string | undefined => {
  try {
    const [commonName] = new X509Certificate(certificate).subjectName.getField(
      'CN',
    )
    return commonName
  } catch {
    return undefined
  }
}

/**
 * Reads the subject common name of a certificate given as base64 DER or PEM. Returns undefined when the certificate has
 * no common name or cannot be parsed. The platform does not store a common name for a certificate, so it is read from
 * the certificate itself.
 */
export function getCertificateCommonName(
  certificate?: string | null,
): string | undefined {
  if (!certificate) {
    return undefined
  }
  if (commonNameCache.has(certificate)) {
    return commonNameCache.get(certificate)
  }

  const commonName = readCommonName(certificate)
  commonNameCache.set(certificate, commonName)
  return commonName
}

export const normalizeCertificate = (pem: string): string =>
  pem
    .replaceAll('-----BEGIN CERTIFICATE-----', '')
    .replaceAll('-----END CERTIFICATE-----', '')
    .replaceAll('\r', '')
    .replaceAll('\n', '')
    .trim()

const parseBase64Certificate = (
  base64Cert: string,
): X509Certificate | undefined => {
  try {
    const binary = atob(base64Cert.replace(/\s/g, ''))
    const der = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new X509Certificate(der)
  } catch {
    return undefined
  }
}

export function getCommonNameFromBase64(
  base64Cert: string,
): string | undefined {
  return parseBase64Certificate(base64Cert)?.subjectName.getField('CN')[0]
}

export interface CertificateDetails {
  commonName?: string
  subject: string
  issuer: string
  serialNumber: string
  notBefore: string
  notAfter: string
  publicKeyAlgorithm: string
  keySize?: number
  namedCurve?: string
  signatureAlgorithm: string
  subjectAlternativeNames: string[]
  issuerAlternativeNames: string[]
  keyUsage: string[]
  extendedKeyUsage: string[]
  isCA: boolean
  pathLength?: number
  subjectKeyIdentifier?: string
  authorityKeyIdentifier?: string
}

type PublicKeyAlgorithm = {
  name?: string
  namedCurve?: string
  modulusLength?: number
}

type SignatureAlgorithm = {
  name?: string
  hash?: { name?: string }
}

type AltName = { type: string; value: string }

const KEY_USAGE_LABELS: Record<number, string> = {
  1: 'digitalSignature',
  2: 'nonRepudiation',
  4: 'keyEncipherment',
  8: 'dataEncipherment',
  16: 'keyAgreement',
  32: 'keyCertSign',
  64: 'cRLSign',
  128: 'encipherOnly',
  256: 'decipherOnly',
}

const EXTENDED_KEY_USAGE_LABELS: Record<string, string> = {
  '1.3.6.1.5.5.7.3.1': 'TLS Web Server Authentication',
  '1.3.6.1.5.5.7.3.2': 'TLS Web Client Authentication',
  '1.3.6.1.5.5.7.3.3': 'Code Signing',
  '1.3.6.1.5.5.7.3.4': 'Email Protection',
  '1.3.6.1.5.5.7.3.8': 'Time Stamping',
  '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
  '1.3.6.1.5.5.7.3.6': 'IPSec End System',
  '1.3.6.1.5.5.7.3.7': 'IPSec Tunnel',
  '1.0.18013.5.1.2': 'ISO 18013-5 mDL',
  '2.5.29.37.0': 'Any Extended Key Usage',
}

const formatPublicKeyAlgorithm = (
  algorithm: PublicKeyAlgorithm,
): { label: string; keySize?: number; namedCurve?: string } => {
  const name = algorithm?.name || 'Unknown'
  if (name === 'ECDSA') {
    return {
      label: algorithm.namedCurve ? `ECDSA ${algorithm.namedCurve}` : 'ECDSA',
      namedCurve: algorithm.namedCurve,
    }
  }
  if (name.includes('RSA')) {
    const kind = name === 'RSA-PSS' ? 'RSA-PSS' : 'RSA'
    return {
      label: algorithm.modulusLength
        ? `${kind} ${algorithm.modulusLength}`
        : kind,
      keySize: algorithm.modulusLength,
    }
  }
  return { label: name }
}

const formatSignatureAlgorithm = (algorithm: SignatureAlgorithm): string => {
  const name = algorithm?.name || 'Unknown'
  const hash = algorithm?.hash?.name
  return hash ? `${name} with ${hash}` : name
}

const namesToStrings = (extension: {
  names?: { items: readonly AltName[] }
}): string[] =>
  (extension?.names?.items ?? []).map(
    (name) => `${name.type.toUpperCase()}: ${name.value}`,
  )

const getExtension = <T extends Extension>(
  cert: X509Certificate,
  type: new (raw: BufferSource) => T,
): T | undefined => {
  try {
    return (cert.getExtension(type) as T | null) ?? undefined
  } catch {
    return undefined
  }
}

export function getCertificateDetailsFromBase64(
  base64Cert: string,
): CertificateDetails | undefined {
  const cert = parseBase64Certificate(base64Cert)
  if (!cert) {
    return undefined
  }

  const publicKey = formatPublicKeyAlgorithm(
    cert.publicKey.algorithm as PublicKeyAlgorithm,
  )
  const basicConstraints = getExtension(cert, BasicConstraintsExtension)
  const keyUsages = getExtension(cert, KeyUsagesExtension)
  const extendedKeyUsages = getExtension(cert, ExtendedKeyUsageExtension)
  const subjectAltNames = getExtension(cert, SubjectAlternativeNameExtension)
  const issuerAltNames = getExtension(cert, IssuerAlternativeNameExtension)

  return {
    commonName: cert.subjectName.getField('CN')[0],
    subject: cert.subject,
    issuer: cert.issuer,
    serialNumber: cert.serialNumber,
    notBefore: cert.notBefore.toISOString(),
    notAfter: cert.notAfter.toISOString(),
    publicKeyAlgorithm: publicKey.label,
    keySize: publicKey.keySize,
    namedCurve: publicKey.namedCurve,
    signatureAlgorithm: formatSignatureAlgorithm(
      cert.signatureAlgorithm as SignatureAlgorithm,
    ),
    subjectAlternativeNames: subjectAltNames
      ? namesToStrings(subjectAltNames)
      : [],
    issuerAlternativeNames: issuerAltNames
      ? namesToStrings(issuerAltNames)
      : [],
    keyUsage: Object.entries(KEY_USAGE_LABELS)
      .filter(([bit]) => ((keyUsages?.usages ?? 0) & Number(bit)) !== 0)
      .map(([, label]) => label),
    extendedKeyUsage: (extendedKeyUsages?.usages ?? []).map(
      (oid) => EXTENDED_KEY_USAGE_LABELS[String(oid)] || String(oid),
    ),
    isCA: Boolean(basicConstraints?.ca),
    pathLength: basicConstraints?.pathLength,
    subjectKeyIdentifier: getExtension(cert, SubjectKeyIdentifierExtension)
      ?.keyId,
    authorityKeyIdentifier: getExtension(cert, AuthorityKeyIdentifierExtension)
      ?.keyId,
  }
}

const KMS_BACKEND_LABELS: Record<string, string> = {
  askar: 'Askar',
  node: 'NodeKMS',
  nodekms: 'NodeKMS',
  openbao: 'OpenBao',
}

export function formatKmsBackend(backend?: string | null): string {
  if (!backend) {
    return '—'
  }
  return KMS_BACKEND_LABELS[backend.toLowerCase()] || backend
}
