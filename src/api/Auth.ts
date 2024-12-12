import {axiosGet, axiosPost, axiosPut} from '../services/apiRequests'
import CryptoJS from "crypto-js"
import { apiRoutes } from '../config/apiRoutes'
import { envConfig } from '../config/envConfig'
import { storageKeys } from '../config/CommonConstant'
import type { AddPassword } from '../components/Profile/interfaces'
import type { AstroCookies } from 'astro'

// import { TextEncoder, TextDecoder } from 'util'; // For encoding/decoding text to/from Uint8Array

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// Utility function to convert a base64 string to a Uint8Array
const base64ToUint8Array = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

// Utility function to convert a Uint8Array to a base64 string
const uint8ArrayToBase64 = (buffer: Uint8Array) => btoa(String.fromCharCode(...buffer));

// Utility function to generate an AES-GCM key (128 or 256 bits)
const getAesKey = async (key: string) => {
    console.log("🚀 ~ getAesKey ~ key:", key)
    const keyBuffer = ENCODER.encode(key.padEnd(32, '0')).slice(0, 32); // Pad key to 32 bytes for AES-256
    return await crypto.subtle.importKey(
        'raw', 
        keyBuffer, 
        { name: 'AES-GCM' }, 
        false, 
        ['encrypt', 'decrypt']
    );
};

// **Encrypt Data** using AES-GCM with WebCrypto
export const encryptData = async (value: any): Promise<string> => {
    try {
        const CRYPTO_PRIVATE_KEY = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`;
        
        const key = await getAesKey(CRYPTO_PRIVATE_KEY);

        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }

        const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte random initialization vector
        const encodedData = ENCODER.encode(value);

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv }, 
            key, 
            encodedData
        );

        // Concatenate IV and encrypted data and convert to base64
        const ivBase64 = uint8ArrayToBase64(iv);
        const encryptedBase64 = uint8ArrayToBase64(new Uint8Array(encryptedData));

        return `${ivBase64}:${encryptedBase64}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return '';
    }
};

export const decryptData = async (value: string): Promise<string> => {
    console.log("🚀 ~ decryptData ~ value:", value)
    try {
        const CRYPTO_PRIVATE_KEY = envConfig.PUBLIC_CRYPTO_PRIVATE_KEY;
        console.log("🚀 ~ decryptData ~ envConfig:", envConfig)
        console.log("🚀 ~ decryptData ~ envConfig.PUBLIC_CRYPTO_PRIVATE_KEY;:", envConfig.PUBLIC_CRYPTO_PRIVATE_KEY)
        console.log("🚀 ~ decryptData ~ CRYPTO_PRIVATE_KEY:", CRYPTO_PRIVATE_KEY)

        const key = await getAesKey(CRYPTO_PRIVATE_KEY);
        console.log("🚀 ~ decryptData ~ key:", key)

        if (!value) {
            console.error('No value to decrypt.');
            return '';
        }

        const [ivBase64, encryptedBase64] = value.split(':');
        if (!ivBase64 || !encryptedBase64) {
            console.error('Invalid encrypted data format.');
            return '';
        }

        const iv = base64ToUint8Array(ivBase64);
        const encryptedData = base64ToUint8Array(encryptedBase64);
        console.log("🚀 ~ decryptData ~ encryptedData:", encryptedData)

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );
        console.log("🚀 ~ decryptData ~ decryptedData:", decryptedData)

        return DECODER.decode(new Uint8Array(decryptedData));
    } catch (error) {
        console.error('Decryption error:', error);
        return ''; // Return an empty string to avoid app crashes
    }
};

// **Set to Local Storage** (Encrypt and Save)
export const setToLocalStorage = async (key: string, value: any): Promise<boolean> => {
    try {
        if (typeof value === 'object' && Boolean(Object.keys(value).length <= 0)) {
            return false;
        }

        if (typeof value === 'string' && !value.trim()) {
            return false;
        }

        const encryptedValue = await encryptData(value);
        localStorage.setItem(key, encryptedValue);
        return true;
    } catch (error) {
        console.error('Error setting to localStorage:', error);
        return false;
    }
};

export const getFromLocalStorage = async (key: string): Promise<any> => {
    try {
        const encryptedValue = localStorage.getItem(key);
        console.log("🚀 ~ getFromLocalStorage ~ encryptedValue:", encryptedValue)
        if (!encryptedValue) {
            console.warn(`No value found in localStorage for key: ${key}`);
            return null;
        }

        const decryptedValue = await decryptData(encryptedValue);
        console.log("🚀 ~ getFromLocalStorage ~ decryptedValue:", decryptedValue)

        try {
            return JSON.parse(decryptedValue);
        } catch {
            console.warn('Decrypted value is not valid JSON.');
            return decryptedValue;
        }
    } catch (error) {
        console.error(`Decryption error for key [${key}]:`, error);
        return null;
    }
};
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

// export const encryptData = (value: any): string => {
 
//     const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`

//     try {
//         if (typeof (value) !== 'string') {
//             value = JSON.stringify(value)
//         }
//         return CryptoJS.AES.encrypt(value, CRYPTO_PRIVATE_KEY).toString();
//     } catch (error) {
//         // Handle encryption error
//         console.error('Encryption error:', error);
//         return '';
//     }
// }

// export const decryptData = (value: string): string => {
//     const CRYPTO_PRIVATE_KEY: string = `${envConfig.PUBLIC_CRYPTO_PRIVATE_KEY}`;

//     try {
//         // Ensure input is valid and not empty
//         if (!value || typeof value !== "string") {
//             throw new Error("Invalid input for decryption");
//         }

//         const bytes = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY);
//         const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

//         // Ensure the output is valid UTF-8
//         if (!decryptedText) {
//             throw new Error("Decryption failed or returned empty result");
//         }

//         return decryptedText;
//     } catch (error) {
//         console.error("Decryption error:", error);
//         return ''; // Return a fallback value to prevent crashes
//     }
// };

// export const setToLocalStorage = async (key: string, value: any) =>{

//     // If passed value is object then checked empty object
// 	if (typeof value === 'object' && Boolean(Object.keys(value).length <= 0)) {
// 		return;
// 	}

// 	// If passed value is string then checked if value is falsy
// 	if (typeof value === 'string' && !value?.trim()) {
// 		return;
// 	}

//     const convertedValue = await encryptData(value)
//     const setValue = await localStorage.setItem(key, convertedValue as string)
//     return true
// }

// export const getFromLocalStorage = async (key: string) => {

//     try {
//         const encryptedValue = localStorage.getItem(key);

//         if (!encryptedValue) {
//             console.warn(`No value found in localStorage for key: ${key}`);
//             return null;
//         }

//         const decryptedValue = encryptedValue ? decryptData(encryptedValue) : '';

//         return decryptedValue;
//     } catch (error) {
//         console.error(`Decryption error for key [${key}]:`, error);
//         return null;
//     }
// };

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