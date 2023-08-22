import {axiosGet, axiosPost, axiosPut} from '../services/apiRequests'
import { number, string } from 'yup'

import type { AxiosError } from 'axios'
import CryptoJS from "crypto-js"
import { apiRoutes } from '../config/apiRoutes'
import { envConfig } from '../config/envConfig'
import { storageKeys } from '../config/CommonConstant'

export interface UserSignUpData {
    email: string,
}
export interface AddPasswordDetails {
    password:string
    isPasskey:boolean
    firstName: string|null
    lastName: string|null
}
export interface UserSignInData {
    email: string | undefined, 
    isPasskey:boolean, 
    password?: string
}
export interface EmailVerifyData {
    verificationCode: string,
    email: string
}

export const sendVerificationMail = async(payload:UserSignUpData) => {
    const details ={
        url: apiRoutes.auth.sendMail,
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

export const getUserProfile = async(accessToken: string) => {
    const details = {
        url: apiRoutes.auth.userProfile,
        config : { headers: { Authorization: `Bearer ${accessToken}` } }
    }
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        return err?.message
    }
}    

export const updateUserProfile = async(data: object ) => {
    const url = apiRoutes.users.update
    const payload = data
    const token = await getFromLocalStorage(storageKeys.TOKEN)

    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }
    const axiosPayload = {
        url,
        payload,
        config
    }

    try {
        return await axiosPut(axiosPayload);
    }
    catch (error) {
        const err = error as Error
        return err?.message
    }

}  

export const verifyUserMail = async(payload: EmailVerifyData ) => {
    const details ={
        url:`${apiRoutes.auth.verifyEmail}?verificationCode=${payload?.verificationCode}&email=${payload?.email}`,
        config: { headers: { "Content-type": "application/json" } }
    }
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        return err?.message
    }

   
}

export const checkUserExist = async(payload: string) => {
    const details ={
        url:`${apiRoutes.auth.checkUser}${payload}`,
        config: { headers: { "Content-type": "application/json" } }
    }
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        return err?.message
    }

   
}

export const addPasswordDetails = async(payload: AddPasswordDetails, email:string) => {
    const details ={
        url: `${apiRoutes.auth.addDetails}${email}`,
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
    const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`    
    const encryptedPassword: string = CryptoJS.AES.encrypt(JSON.stringify(password), CRYPTO_PRIVATE_KEY).toString()
    return encryptedPassword
}

export const encryptData = (value: any): string => {
    if(typeof(value) !== 'string'){
        value = JSON.stringify(value)
    }
    const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`
    const convrtedValue: string = CryptoJS.AES.encrypt(value, CRYPTO_PRIVATE_KEY).toString()
    return convrtedValue
}

export const decryptData = (value: any): string => {
    const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`
    const bytes = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY)
    var originalValue: string = bytes.toString(CryptoJS.enc.Utf8);
    return originalValue
}

export const setToLocalStorage = async (key: string, value: any) =>{
    const convertedValue = await encryptData(value)
    const setValue = await localStorage.setItem(key, convertedValue as string)
    return true
}

export const getFromLocalStorage = async (key: string) =>{
    const value = await localStorage.getItem(key)
    const convertedValue = value ? await decryptData(value) : ''
    return convertedValue
}

export const removeFromLocalStorage = async (key: string) => {
	await localStorage.removeItem(key);
	return true;
};
