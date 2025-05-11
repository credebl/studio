import {
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

import apiRoutes from './apiRoutes'

export const generateRegistrationOption = async (
  payload: IRegistrationOption,
) => {
  const email = payload.userName
  const details = {
    url: `${apiRoutes.auth.generateRegistration}/${email}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
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
) => {
  const details = {
    url: `${apiRoutes.auth.verifyRegistration}${email}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const addDeviceDetails = async (payload: IdeviceBody) => {
  const { credentialId } = payload
  const details = {
    url: `${apiRoutes.auth.userUpdate}/${credentialId}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosPut(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const getUserDeviceDetails = async (email: string) => {
  const details = {
    url: `${apiRoutes.auth.getDeviceList}${email}`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const deleteDeviceById = async (credentialId: string) => {
  const details = {
    url: `${apiRoutes.auth.fidoDevice}/${credentialId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosDelete(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const generateAuthenticationOption = async (payload: IUserEmail) => {
  const details = {
    url: `${apiRoutes.auth.fidoAuthentication}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
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
) => {
  const details = {
    url: `${apiRoutes.auth.fidoVerifyAuthentication}${email.userName}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}

export const editDeviceDetails = async (payload: IDeviceDetails) => {
  const details = {
    url: `${apiRoutes.auth.updateDeviceName}/${payload.enCodedUrl}?deviceName=${payload.updatedDeviceName}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
      },
    },
  }

  try {
    const response = await axiosPut(details)
    return response
  } catch (error) {
    const err = error as Error
    throw new Error(err?.message)
  }
}
