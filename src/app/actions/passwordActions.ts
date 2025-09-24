'use server'

import {
  IEncryptPasswordForSignIn,
  IEncryptPasswordResponse,
} from '@/common/interface'

import CryptoJS from 'crypto-js'

export const encryptPasswordActionForSignIn = async (
  password: string,
  email: string,
  isPassword: boolean,
): Promise<IEncryptPasswordForSignIn> => {
  const { CRYPTO_PRIVATE_KEY } = process.env

  if (!CRYPTO_PRIVATE_KEY) {
    throw new Error('CRYPTO_PRIVATE_KEY is missing!')
  }

  const encryptedPassword = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY,
  ).toString()

  return {
    password: encryptedPassword,
    email,
    isPassword,
  }
}

export const encryptPasswordAction = async (
  password: string,
): Promise<IEncryptPasswordResponse> => {
  const { CRYPTO_PRIVATE_KEY } = process.env

  if (!CRYPTO_PRIVATE_KEY) {
    throw new Error('CRYPTO_PRIVATE_KEY is missing!')
  }

  // Encrypt the password on the server
  const encryptedPassword = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY,
  ).toString()

  return {
    password: encryptedPassword,
  }
}
