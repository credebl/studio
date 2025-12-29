// eslint-disable-next-line
import 'server-only'
import Base64 from 'crypto-js/enc-base64'
import Hex from 'crypto-js/enc-hex'
import { openSSLHeader } from '@/constants/data'

export const passwordEncryption = (password: string): string => {
  if (typeof window !== 'undefined') {
    throw new Error('passwordEncryption is server-only')
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AES = require('crypto-js/aes')

  const { CRYPTO_PRIVATE_KEY } = process.env
  if (!CRYPTO_PRIVATE_KEY) {
    throw new Error('Missing CRYPTO_PRIVATE_KEY in environment variables')
  }

  const encrypted = AES.encrypt(password, CRYPTO_PRIVATE_KEY)

  if (encrypted.salt) {
    const saltedHeader = Hex.parse(openSSLHeader)

    const combined = saltedHeader
      .concat(encrypted.salt)
      .concat(encrypted.ciphertext)

    return Base64.stringify(combined)
  }

  return encrypted.toString(Base64)
}
