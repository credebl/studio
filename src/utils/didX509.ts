/** The most certificates the gateway accepts in one chain. */
export const MAX_X509_CHAIN_LENGTH = 10

const PEM_CERTIFICATE =
  /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g

function isDerSequence(base64Body: string): boolean {
  try {
    // Every X.509 certificate is a DER SEQUENCE (tag 0x30).
    return atob(base64Body).charCodeAt(0) === 0x30
  } catch {
    return false
  }
}

/**
 * Splits pasted PEM text into its certificates, leaf first, as the platform expects. Throws an Error with a message
 * fit for the form when the text holds no certificate, a malformed one, or more than the gateway accepts.
 */
export function parseCertificateChain(value: string): string[] {
  const text = value.trim()
  if (!text) {
    throw new Error('Enter the certificate chain to import')
  }

  const certificates: string[] = []
  for (const match of Array.from(text.matchAll(PEM_CERTIFICATE))) {
    const body = match[1].replace(/\s+/g, '')
    if (!body || !/^[A-Za-z0-9+/]+={0,2}$/.test(body) || !isDerSequence(body)) {
      throw new Error(
        `Certificate ${certificates.length + 1} of the chain is not a valid PEM certificate`,
      )
    }
    certificates.push(
      `-----BEGIN CERTIFICATE-----\n${body.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`,
    )
  }

  if (certificates.length === 0) {
    throw new Error(
      'The certificate chain must contain PEM certificates (-----BEGIN CERTIFICATE-----)',
    )
  }
  if (certificates.length > MAX_X509_CHAIN_LENGTH) {
    throw new Error(
      `The certificate chain can hold at most ${MAX_X509_CHAIN_LENGTH} certificates`,
    )
  }
  // Text outside the PEM blocks means something was pasted that would be silently dropped.
  if (text.replace(PEM_CERTIFICATE, '').trim()) {
    throw new Error(
      'The certificate chain contains text outside the PEM certificates',
    )
  }
  return certificates
}
