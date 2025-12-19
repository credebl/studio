// lib/x509.ts

export function parsePemCertificate(pem: string): {
  keyType: 'ed25519' | 'p256'
  commonName?: string
} {
  // Key type detection
  let keyType: 'ed25519' | 'p256' = 'p256'

  if (pem.includes('ED25519')) {
    keyType = 'ed25519'
  }

  const cnRegex = /CN\s*=\s*([^,\n]+)/
  const cnMatch = cnRegex.exec(pem)
  const commonName = cnMatch?.[1]

  return {
    keyType,
    commonName,
  }
}

/**
 * ✅ This is what you are missing
 */
export function parseBase64X509Certificate(base64Cert: string): {
  commonName?: string
  subjectAlternativeNames?: string[]
} {
  // Convert Base64 → PEM
  const pem = `-----BEGIN CERTIFICATE-----\n${base64Cert
    .match(/.{1,64}/g)
    ?.join('\n')}\n-----END CERTIFICATE-----`

  // Extract CN
  const cnRegex = /CN\s*=\s*([^,\n]+)/
  const cnMatch = cnRegex.exec(pem)
  const commonName = cnMatch?.[1]

  // Extract SANs
  const sanRegex = /DNS:([^,\n]+)/g
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
