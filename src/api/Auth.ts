import type { AxiosError } from 'axios'
import { apiRoutes } from '../config/apiRoutes'
import {axiosGet, axiosPost} from '../services/apiRequests'
import CryptoJS from "crypto-js"

export interface UserSignUpData {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
}

export interface UserSignInData {
    email: string, 
    isPasskey:boolean, 
    password?: string
}

export const registerUser = async(payload: UserSignUpData) => {
    const details ={
        url: apiRoutes.auth.signUp,
        payload,
        config: { headers: { "Content-type": "application/json" } }
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

export const loginUser = async(payload: UserSignInData) => {
    const details = {
        url: apiRoutes.auth.sinIn,
        payload,
        config: { headers: { "Content-type": "application/json" } }
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

export const passwordEncryption = (password: string): string => {
    const CRYPTO_PRIVATE_KEY: string = `${import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY}`
    const encryptedPassword: string = CryptoJS.AES.encrypt(JSON.stringify(password), CRYPTO_PRIVATE_KEY).toString()
    return encryptedPassword
}