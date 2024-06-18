import {axiosGet, axiosPost, axiosPut} from '../services/apiRequests'
import CryptoJS from "crypto-js"
import { apiRoutes } from '../config/apiRoutes'
import { envConfig } from '../config/envConfig'
import { storageKeys } from '../config/CommonConstant'
import type { AddPassword } from '../components/Profile/interfaces'
import type { AstroCookies } from 'astro'

export interface UserSignUpData {
    email: string,
    clientId: string,
    clientSecret: string
}
export interface AddPasswordDetails {
    email:string
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

export interface KeyCloakData {
	email: string,
	oldPassword: string,
	newPassword: string
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

export const resetPassword = async(payload: { password: string; token: string | null }, email: string | null) => {   
	const details = {
			url: `${apiRoutes.auth.resetPassword}/${email}`,
			payload
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

export const forgotPassword = async(payload: {email: string}) => {
	const details = {
			url: apiRoutes.auth.forgotPassword,
			payload
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

export const resetPasswordKeyCloak = async(payload: KeyCloakData) => {
	
	const details = {
			url: apiRoutes.auth.keyClockResetPassword,
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
        url: apiRoutes.users.userProfile,
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
        url:`${apiRoutes.users.checkUser}${payload}`,
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

export const addPasswordDetails = async(payload: AddPasswordDetails) => {
    const details ={
        url: `${apiRoutes.auth.addDetails}`,
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

export const addPasskeyUserDetails = async(payload: AddPassword, email:string) => {
    const token = await getFromLocalStorage(storageKeys.TOKEN)
    const details ={
        url: `${apiRoutes.auth.passkeyUserDetails}${email}`,
        payload,
        config: { headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }, }
    }
    try{
        const response = await axiosPut(details)
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
 
    const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`

    try {
        if (typeof (value) !== 'string') {
            value = JSON.stringify(value)
        }
        return CryptoJS.AES.encrypt(value, CRYPTO_PRIVATE_KEY).toString();
    } catch (error) {
        // Handle encryption error
        console.error('Encryption error:', error);
        return '';
    }
}

export const decryptData = (value: any): string => {
    const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`

    try {
        let bytes = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        // Handle decryption error or invalid input
        console.error('Decryption error:', error);
        return '';
    }
}

export const setToLocalStorage = async (key: string, value: any) =>{
    // If passed value is object then checked empty object
	if (typeof value === 'object' && Boolean(Object.keys(value).length <= 0)) {
		return;
	}

	// If passed value is string then checked if value is falsy
	if (typeof value === 'string' && !value?.trim()) {
		return;
	}

    const convertedValue = await encryptData(value)
    const setValue = await localStorage.setItem(key, convertedValue as string)
    return true
}

export const getFromLocalStorage = async (key: string) =>{
    const value = await localStorage.getItem(key)
    const convertedValue = value ? await decryptData(value) : ''
    return convertedValue
}

export const setToCookies = (cookies: AstroCookies, key: string, value: any, option: {[key: string]: any }) =>{
    // If passed value is object then checked empty object
	if (typeof value === 'object' && Boolean(Object.keys(value).length <= 0)) {
		return;
	}

	// If passed value is string then checked if value is falsy
	if (typeof value === 'string' && !value?.trim()) {
		return;
	}
    
    // Set HttpOnly, Secure, and SameSite attributes in the options
    const updatedOption: { [key: string]: any }= {
        ...option,
        httpOnly: true,
        secure: true, // Set to true if using HTTPS
        sameSite: 'strict', 
      };
    cookies.set(key, value as string, updatedOption)

    return true
}

export const getFromCookies = (cookies: AstroCookies, key: string) =>{
    const value = cookies.get(key)?.value
    return value
}

export const removeFromLocalStorage = async (key: string) => {
	await localStorage.removeItem(key);
	return true;
};
