import {
  IAddPassword,
  IDeviceDetails,
  IRegistrationOption,
  IUserEmail,
  IVerifyRegistrationObj,
  IdeviceBody,
} from '@/components/profile/interfaces'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
} from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import apiRoutes from './apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

const config = getHeaderConfigs()
export const generateRegistrationOption = async (
  payload: IRegistrationOption,
): Promise<AxiosResponse | string> => {
  const email = payload.userName
  const details = {
    url: `${apiRoutes.auth.generateRegistration}/${email}`,
    payload,
    config,
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const verifyRegistration = async (
  payload: IVerifyRegistrationObj,
  email: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.verifyRegistration}${email}`,
    payload,
    config,
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const addDeviceDetails = async (
  payload: IdeviceBody,
): Promise<AxiosResponse | string> => {
  const { credentialId } = payload
  const details = {
    url: `${apiRoutes.auth.userUpdate}/${credentialId}`,
    payload,
    config,
  }

  try {
    const response = await axiosPut(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const getUserDeviceDetails = async (
  email: string,
): Promise<AxiosResponse> => {
  const details = {
    url: `${apiRoutes.auth.getDeviceList}${email}`,
    config,
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const deleteDeviceById = async (
  credentialId: string,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.fidoDevice}/${credentialId}`,
    config,
  }

  try {
    const response = await axiosDelete(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const generateAuthenticationOption = async (
  payload: IUserEmail,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.fidoAuthentication}`,
    payload,
    config,
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const verifyAuthentication = async (
  payload: IVerifyRegistrationObj,
  email: { userName: string },
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.fidoVerifyAuthentication}${email.userName}`,
    payload,
    config,
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const editDeviceDetails = async (
  payload: IDeviceDetails,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.updateDeviceName}/${payload.enCodedUrl}?deviceName=${payload.updatedDeviceName}`,
    payload,
    config,
  }

  try {
    const response = await axiosPut(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const addPasskeyUserDetails = async (
  payload: IAddPassword,
  email: string | null,
): Promise<AxiosResponse | string> => {
  const details = {
    url: `${apiRoutes.auth.passkeyUserDetails}${email}`,
    payload,
    config,
  }
  try {
    const response = await axiosPut(details)
    return response
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
