import {
  KEY_TYPES,
  cnRegexPattern,
  sanRegexPattern,
} from '@/config/CommonConstant'

import { X509Certificate } from '@peculiar/x509'

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
