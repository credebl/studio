import { storageKeys } from "../config/CommonConstant"
import { apiRoutes } from "../config/apiRoutes"
import { axiosGet, axiosPost } from "../services/apiRequests"
import { getFromLocalStorage } from "./Auth"

export const generateRegistrationOption = async(paylaod:any) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN)
    const details = {
      url: `${apiRoutes.fido.generateRegistration}`,
      config: {
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
  }
        
      try{
          const response = await axiosPost(details)
          return response
      }
      catch(error){
          const err = error as Error
          return err?.message
      } 
  }

  export const verifyRegistration = async(paylaod:any) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN)
    const details = {
      url: `${apiRoutes.fido.verifyRegistration}`,
      config: {
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
  }
        
      try{
          const response = await axiosPost(details)
          return response
      }
      catch(error){
          const err = error as Error
          return err?.message
      } 
  }