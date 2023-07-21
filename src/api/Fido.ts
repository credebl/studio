import type { DeviceDetails, IdeviceBody, RegistrationOptionInterface, UserEmail, verifyRegistrationObjInterface } from "../components/Profile/interfaces"
import { storageKeys } from "../config/CommonConstant"
import { apiRoutes } from "../config/apiRoutes"
import { axiosDelete, axiosGet, axiosPost, axiosPut } from "../services/apiRequests"
import { getFromLocalStorage } from "./Auth"

export const generateRegistrationOption = async (payload: RegistrationOptionInterface) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.generateRegistration}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }
  
  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const verifyRegistration = async (payload:unknown, userEmail:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.verifyRegistration}${userEmail}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const addDeviceDetails = async (payload: IdeviceBody) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.userUpdate}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPut(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getUserDeviceDetails = async(userEmail:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.getDeviceList}${userEmail}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

export const deleteDeviceById = async(enCodedUrl:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.fidoDevice}?credentialId=${enCodedUrl}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosDelete(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

export const generateAuthenticationOption = async (payload:UserEmail) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.fidoAuthentication}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }
  
  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const verifyAuthentication = async (payload: any, userEmail:UserEmail) => {
  console.log("userEmail", userEmail)
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.fidoVerifyAuthentication}${userEmail?.userName}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const editDeviceDetails = async (payload:DeviceDetails) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.fido.updateDeviceName}?credentialId=${payload.enCodedUrl}&deviceName=${payload.updatedDeviceName}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPut(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}