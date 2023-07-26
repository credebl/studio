import type { AxiosError } from 'axios'
import { apiRoutes } from '../config/apiRoutes'
import {axiosGet, axiosPost} from '../services/apiRequests'
import CryptoJS from "crypto-js"
import { number, string } from 'yup'

export interface UserSignUpData {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
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

export const verifyUserMail = async(payload: EmailVerifyData) => {
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

export const passwordEncryption = (password: string): string => {
    const CRYPTO_PRIVATE_KEY: string = `${import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY}`
    const encryptedPassword: string = CryptoJS.AES.encrypt(JSON.stringify(password), CRYPTO_PRIVATE_KEY).toString()
    return encryptedPassword
}

export const encryptData = (value: any): string => {
    if(typeof(value) !== 'string'){
        value = JSON.stringify(value)
    }
    const CRYPTO_PRIVATE_KEY: string = `${import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY}`
    const convrtedValue: string = CryptoJS.AES.encrypt(value, CRYPTO_PRIVATE_KEY).toString()
    return convrtedValue
}

export const decryptData = (value: any): string => {
    const CRYPTO_PRIVATE_KEY: string = `${import.meta.env.PUBLIC_CRYPTO_PRIVATE_KEY}`
    const bytes = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY)
    var originalValue: string = bytes.toString(CryptoJS.enc.Utf8);
    return originalValue
}

export const setToLocalStorage = async (key: string, value: any) =>{
    const convrtedValue = await encryptData(value)
    const setValue = await localStorage.setItem(key, convrtedValue as string)
    return true
}

export const getFromLocalStorage = async (key: string) =>{
    const value = await localStorage.getItem(key)
    const convrtedValue = await decryptData(value)
    return convrtedValue
}