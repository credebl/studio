import CryptoJS from 'crypto-js'

export const passwordEncryption = (password: string): string => {
  if (typeof window !== 'undefined') {
    throw new Error('passwordEncryption is server-only')
  }

  const { CRYPTO_PRIVATE_KEY } = process.env
  if (!CRYPTO_PRIVATE_KEY) {
    throw new Error('Missing CRYPTO_PRIVATE_KEY in environment variables')
  }

  return CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY,
  ).toString()
}
