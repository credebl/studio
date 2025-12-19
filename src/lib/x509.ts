import {
  KEY_TYPES,
  cnRegexPattern,
  sanRegexPattern,
} from '@/config/CommonConstant'

export function parsePemCertificate(pem: string): {
  keyType: typeof KEY_TYPES.ED25519 | typeof KEY_TYPES.P256
  commonName?: string
} {
  let keyType: typeof KEY_TYPES.ED25519 | typeof KEY_TYPES.P256 = KEY_TYPES.P256

  if (pem.includes('ED25519')) {
    keyType = KEY_TYPES.ED25519
  }

  const cnRegex = cnRegexPattern
  const cnMatch = cnRegex.exec(pem)
  const commonName = cnMatch?.[1]

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
