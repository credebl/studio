import { axiosGet, axiosPost, axiosPut } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import CryptoJS from 'crypto-js'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export interface IUserSignUpData {
  email: string
  clientId: string
  clientSecret: string
}
export interface IAddPasswordDetails {
  email: string
  password: string
  isPasskey: boolean
  firstName: string | null
  lastName: string | null
}
export interface IUserSignInData {
  email: string | undefined
  isPasskey: boolean
  password?: string
}
export interface IEmailVerifyData {
  verificationCode: string
  email: string
}

export interface IKeyCloakData {
  email: string
  oldPassword: string
  newPassword: string
}

export const sendVerificationMail = async (
  payload: IUserSignUpData,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()

  const details = {
    url: apiRoutes.auth.sendMail,
    payload,
    config,
  }
  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const resetPassword = async (
  payload: { password: string; token: string | null },
  email: string | null,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.resetPassword}/${email}`,
    payload,
  }
  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const forgotPassword = async (payload: {
  email: string
}): Promise<AxiosResponse | string> => {
  const details = {
    url: apiRoutes.auth.forgotPassword,
    payload,
  }
  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const loginUser = async (
  payload: IUserSignInData,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()

  const details = {
    url: apiRoutes.auth.sinIn,
    payload,
    config,
  }
  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const resetPasswordKeyCloak = async (
  payload: IKeyCloakData,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()

  const details = {
    url: apiRoutes.auth.keyClockResetPassword,
    payload,
    config,
  }
  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getUserProfile = async (
  accessToken: string,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()

  const details = {
    url: apiRoutes.users.userProfile,
    config: { ...config, Authorization: `Bearer ${accessToken}` },
  }
  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updateUserProfile = async (
  data: object,
): Promise<AxiosResponse | string> => {
  const url = apiRoutes.users.update
  const payload = data

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload,
    config,
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const verifyUserMail = async (
  payload: IEmailVerifyData,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()
  const details = {
    url: `${apiRoutes.auth.verifyEmail}?verificationCode=${payload?.verificationCode}&email=${payload?.email}`,
    config,
  }
  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const checkUserExist = async (
  payload: string,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()

  const details = {
    url: `${apiRoutes.users.checkUser}${payload}`,
    config,
  }
  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const addPasswordDetails = async (
  payload: IAddPasswordDetails,
): Promise<AxiosResponse | string> => {
  const config = getHeaderConfigs()

  const details = {
    url: `${apiRoutes.auth.addDetails}`,
    payload,
    config,
  }
  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const passwordEncryption = (password: string): string => {
  const CRYPTO_PRIVATE_KEY: string = process.env.NEXT_PUBLIC_CRYPTO_PRIVATE_KEY!
  const encryptedPassword: string = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY,
  ).toString()
  return encryptedPassword
}
