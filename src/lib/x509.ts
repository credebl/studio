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

export const normalizeCertificate = (pem: string): string =>
  pem
    .replaceAll('-----BEGIN CERTIFICATE-----', '')
    .replaceAll('-----END CERTIFICATE-----', '')
    .replaceAll('\r', '')
    .replaceAll('\n', '')
    .trim()
