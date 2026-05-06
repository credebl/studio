import crypto from 'crypto'

const SALTED_MAGIC = Buffer.from('Salted__')

function evpBytesToKey(
  password: Buffer,
  salt: Buffer,
  keyLen: number,
  ivLen: number,
): { key: Buffer; iv: Buffer } {
  let data = Buffer.alloc(0)
  let prev = Buffer.alloc(0)

  while (data.length < keyLen + ivLen) {
    const md5 = crypto.createHash('md5')
    md5.update(Buffer.concat([prev, password, salt]))
    prev = Buffer.from(md5.digest() as Uint8Array)
    data = Buffer.concat([data, prev])
  }

  return {
    key: data.subarray(0, keyLen),
    iv: data.subarray(keyLen, keyLen + ivLen),
  }
}

export function passwordEncryption(password: string): string {
  if (typeof window !== 'undefined') {
    throw new Error('Server-only function')
  }

  const secret = process.env.CRYPTO_PRIVATE_KEY
  if (!secret) {
    throw new Error('Missing CRYPTO_PRIVATE_KEY')
  }

  // OpenSSL uses 8-byte salt
  const salt = crypto.randomBytes(8)

  const { key, iv } = evpBytesToKey(
    Buffer.from(secret, 'utf8'),
    salt,
    32, // AES-256
    16, // IV
  )

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final(),
  ])

  // OpenSSL format: Salted__ + salt + ciphertext
  return Buffer.concat([SALTED_MAGIC, salt, encrypted]).toString('base64')
}
