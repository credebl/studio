/**
 * Turns uploaded certificate and private key files (PEM text or binary DER) into the PEM text the did:x509 form
 * takes, so a user can upload the files she has instead of opening them and pasting the text.
 */

/** The largest file accepted; certificates and keys are a few kilobytes. */
export const MAX_UPLOAD_BYTES = 256 * 1024

const PEM_BLOCK = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g

export class UploadedFileError extends Error {}

const textOf = (bytes: Uint8Array): string => new TextDecoder().decode(bytes)

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

/** Wraps binary DER bytes as a PEM block with 64 character lines. */
export function derToPem(bytes: Uint8Array, label: string): string {
  const body =
    toBase64(bytes)
      .match(/.{1,64}/g)
      ?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

function pemBlocks(text: string): { label: string; pem: string }[] {
  return Array.from(text.matchAll(PEM_BLOCK)).map((match) => ({
    label: match[1],
    pem: match[0],
  }))
}

function isBinary(bytes: Uint8Array): boolean {
  // A DER structure starts with a SEQUENCE tag; PEM and JSON files are text.
  return bytes[0] === 0x30
}

function checkSize(name: string, bytes: Uint8Array): void {
  if (bytes.length === 0) {
    throw new UploadedFileError(`${name} is empty`)
  }
  if (bytes.length > MAX_UPLOAD_BYTES) {
    throw new UploadedFileError(`${name} is too large to be a certificate`)
  }
}

/** Certificates found in one uploaded file, as PEM blocks. */
export function certificatesFromFile(
  name: string,
  bytes: Uint8Array,
): string[] {
  checkSize(name, bytes)

  if (isBinary(bytes)) {
    return [derToPem(bytes, 'CERTIFICATE')]
  }

  const blocks = pemBlocks(textOf(bytes))
  if (blocks.some((block) => block.label.includes('PRIVATE KEY'))) {
    throw new UploadedFileError(
      `${name} contains a private key. Upload it in the private key field instead.`,
    )
  }
  const certificates = blocks.filter((block) => block.label === 'CERTIFICATE')
  if (certificates.length === 0) {
    throw new UploadedFileError(
      `${name} has no certificate. Use a PEM (.pem, .crt, .cer) or DER (.der, .cer) file; PKCS#12 (.pfx, .p12) bundles are not supported.`,
    )
  }
  return certificates.map((block) => block.pem)
}

interface Tlv {
  tag: number
  /** Start of the element, including its header. */
  start: number
  /** Start of the content. */
  content: number
  /** End of the element. */
  end: number
}

/** Reads one DER element at `offset`. */
function readTlv(bytes: Uint8Array, offset: number): Tlv {
  const tag = bytes[offset]
  let length = bytes[offset + 1]
  let content = offset + 2
  if (length === undefined || tag === undefined) {
    throw new UploadedFileError('The file is not a valid DER structure')
  }
  if (length & 0x80) {
    const count = length & 0x7f
    if (count === 0 || count > 4) {
      throw new UploadedFileError('The file is not a valid DER structure')
    }
    length = 0
    for (let i = 0; i < count; i += 1) {
      length = length * 256 + bytes[content + i]
    }
    content += count
  }
  const end = content + length
  if (end > bytes.length) {
    throw new UploadedFileError('The file is not a valid DER structure')
  }
  return { tag, start: offset, content, end }
}

const hex = (bytes: Uint8Array, from: number, to: number): string =>
  Array.from(bytes.slice(from, to), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')

function pemToDer(pem: string): Uint8Array {
  const body = pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '')
  return Uint8Array.from(atob(body), (char) => char.charCodeAt(0))
}

/** The DER encoded issuer and subject names of a certificate, as hex strings. */
function certificateNames(pem: string): { issuer: string; subject: string } {
  const der = pemToDer(pem)
  const certificate = readTlv(der, 0)
  const tbs = readTlv(der, certificate.content)

  let offset = tbs.content
  let element = readTlv(der, offset)
  if (element.tag === 0xa0) {
    // The optional explicit version
    offset = element.end
    element = readTlv(der, offset)
  }
  // serial number, signature algorithm, issuer, validity, subject
  const serial = element
  const signature = readTlv(der, serial.end)
  const issuer = readTlv(der, signature.end)
  const validity = readTlv(der, issuer.end)
  const subject = readTlv(der, validity.end)

  return {
    issuer: hex(der, issuer.start, issuer.end),
    subject: hex(der, subject.start, subject.end),
  }
}

/** The issuer and subject of each certificate, or null when one cannot be read. */
function namesOf(pems: string[]): { issuer: string; subject: string }[] | null {
  try {
    return pems.map(certificateNames)
  } catch {
    return null
  }
}

/**
 * Puts certificates in chain order: the leaf first, then each certificate's issuer, the root last. Certificates that do
 * not link up are kept in the order given, after the chain that was found.
 */
export function orderCertificateChain(pems: string[]): string[] {
  const names = namesOf(pems)
  if (!names) {
    return pems
  }

  const issuers = new Set(
    names
      .filter((name) => name.issuer !== name.subject)
      .map((name) => name.issuer),
  )
  const leafIndex = names.findIndex((name) => !issuers.has(name.subject))
  if (leafIndex < 0) {
    return pems
  }

  const ordered = [leafIndex]
  let current = names[leafIndex]
  while (current.issuer !== current.subject) {
    const wanted = current.issuer
    const next = names.findIndex(
      (name, index) => !ordered.includes(index) && name.subject === wanted,
    )
    if (next < 0) {
      break
    }
    ordered.push(next)
    current = names[next]
  }
  names.forEach((_, index) => {
    if (!ordered.includes(index)) {
      ordered.push(index)
    }
  })
  return ordered.map((index) => pems[index])
}

/**
 * The PEM text of every certificate in the uploaded files, leaf first. Files are read in the order given and a file
 * may hold several certificates.
 */
export function certificateChainFromFiles(
  files: { name: string; bytes: Uint8Array }[],
): string {
  const certificates = files.flatMap((file) =>
    certificatesFromFile(file.name, file.bytes),
  )
  return orderCertificateChain(certificates).join('\n')
}

/**
 * The private key text of an uploaded key file: a PEM key as it is, a JWK as JSON, or a binary DER key wrapped as PEM.
 */
export function privateKeyFromFile(name: string, bytes: Uint8Array): string {
  checkSize(name, bytes)

  if (isBinary(bytes)) {
    const sequence = readTlv(bytes, 0)
    const version = readTlv(bytes, sequence.content)
    const next = readTlv(bytes, version.end)
    // PKCS#8 is SEQUENCE { INTEGER 0, SEQUENCE ... }, PKCS#1 RSA is SEQUENCE { INTEGER 0, INTEGER ... } and SEC1 EC is
    // SEQUENCE { INTEGER 1, OCTET STRING ... }.
    if (version.tag !== 0x02) {
      throw new UploadedFileError(`${name} is not a private key`)
    }
    if (next.tag === 0x30) {
      return derToPem(bytes, 'PRIVATE KEY')
    }
    if (next.tag === 0x04) {
      return derToPem(bytes, 'EC PRIVATE KEY')
    }
    if (next.tag === 0x02) {
      return derToPem(bytes, 'RSA PRIVATE KEY')
    }
    throw new UploadedFileError(`${name} is not a private key`)
  }

  const text = textOf(bytes).trim()
  if (text.startsWith('{')) {
    return text
  }
  const keys = pemBlocks(text).filter((block) =>
    block.label.includes('PRIVATE KEY'),
  )
  if (keys.length === 0) {
    throw new UploadedFileError(
      `${name} has no private key. Use a PEM (.pem, .key) or DER (.der) key file, or a JWK (.json); PKCS#12 (.pfx, .p12) bundles are not supported.`,
    )
  }
  if (keys.length > 1) {
    throw new UploadedFileError(`${name} holds more than one private key`)
  }
  return keys[0].pem
}

/** Whether PEM text is an encrypted private key that needs a passphrase. */
export function isEncryptedPrivateKey(text: string): boolean {
  return (
    text.includes('-----BEGIN ENCRYPTED PRIVATE KEY-----') ||
    text.includes('Proc-Type: 4,ENCRYPTED')
  )
}
