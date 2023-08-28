import './global.css'

import { Alert, Button } from 'flowbite-react';
import { UserSignInData, getUserProfile, loginUser, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { generateAuthenticationOption, verifyAuthentication } from '../../api/Fido';

import type { AxiosResponse } from 'axios';
import SignInUser from './SignInUser';
import SignInUser3 from './SignInUserPassword';
import { startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';
import React from 'react';
import SignInUserPassword from './SignInUserPassword';

interface signInUserProps {
    email: string
}
const SignInUserPasskey = (signInUserProps: signInUserProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [showSignInUser, setShowSignInUser] = useState(true);
    const [showSignInUserPassword, setShowSignInUserPassword] = useState(false);
    const [fidoLoader, setFidoLoader] = useState<boolean>(false)
    const [fidoUserError, setFidoUserError] = useState("")
    const [failure, setFailur] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)


    const handleSvgClick = () => {

        setShowSignInUser(!showSignInUser);
    };

    const handlePasswordButtonClick = () => {
        setShowSignInUserPassword(true);
        setShowSignInUser(false);
    };

    const verifyAuthenticationMethod = async (verifyAuthenticationObj: unknown, userData: { userName: string }): Promise<string | AxiosResponse> => {
        try {
            return await verifyAuthentication(verifyAuthenticationObj, userData);
        } catch (error) {
            setFidoLoader(false)
            throw error;
        }
    };

    const getUserDetails = async (access_token: string) => {
        const userDetails = await getUserProfile(access_token);
        const { data } = userDetails as AxiosResponse
        if (data?.data?.userOrgRoles?.length > 0) {
            const permissionArray: number | string[] = []
            data?.data?.userOrgRoles?.forEach((element: { orgRole: { name: string } }) => permissionArray.push(element?.orgRole?.name));
            await setToLocalStorage(storageKeys.PERMISSIONS, permissionArray)
            await setToLocalStorage(storageKeys.USER_PROFILE, data?.data)
            await setToLocalStorage(storageKeys.USER_EMAIL, data?.data?.email)

            window.location.href = '/dashboard'
        } else {
            setFailur(userDetails as string)
        }
        setLoading(false)
    }

    const showFidoError = (error: unknown): void => {
        const err = error as string
        if (err.includes("The operation either timed out or was not allowed")) {
            const [errorMsg] = err.split('.')
            setFidoUserError(errorMsg)
            setTimeout(() => {
                setFidoUserError("")
            }, 5000)
        } else {
            setFidoUserError(err)
            setTimeout(() => {
                setFidoUserError("")
            }, 5000)
        }
    }

    const authenticateWithPasskey = async (email: string): Promise<void> => {
        try {
            setFidoLoader(true)


            const obj = { userName: email }


            const generateAuthenticationResponse: any = await generateAuthenticationOption(obj);
            const challangeId: string = generateAuthenticationResponse?.data?.data?.challenge;

            setFidoUserError(generateAuthenticationResponse?.data?.error);

            const opts = generateAuthenticationResponse?.data?.data;
            const attResp = await startAuthentication(opts);

            const verifyAuthenticationObj = {
                ...attResp,
                challangeId
            };
            const verificationResp = await verifyAuthenticationMethod(verifyAuthenticationObj, { userName: email });
            const { data } = verificationResp as AxiosResponse

            if (data?.data?.verified) {
                const payload: UserSignInData = {
                    email: email,
                    isPasskey: true
                };
                const loginRsp = await loginUser(payload);
                const { data } = loginRsp as AxiosResponse;

                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    setFidoLoader(false)
                    await setToLocalStorage(storageKeys.TOKEN, data?.data?.access_token);
                    getUserDetails(data?.data?.access_token);
                } else {
                    setFidoLoader(false)
                    setFailur(loginRsp as string);
                    setTimeout(() => {
                        setFailur(null);
                    }, 3000);
                }
            } else if (data?.error) {
                setFidoLoader(false)
                setFidoUserError(data?.error);
                setTimeout(() => {
                    setFidoUserError("");
                }, 3000);
            }
        } catch (error) {
            if (error instanceof DOMException) {
                setFidoLoader(false)
                setFidoUserError('The operation either timed out or was not allowed.');
            } else {
                setFidoLoader(false)
                showFidoError(error.message);
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (

        <div className='h-full'>
            {showSignInUser ? (

                <div className="bg-white flex-shrink-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex justify-center px-50 py-50 md:w-3/5 bg-blue-500 bg-opacity-10" >
                        <img 
							className='hidden sm:block'
                                src="/images/choose-password-passkey.svg"
                                alt="img" />


                        </div>
                        <div className="flex items-center justify-center p-6 sm:p-12 md:w-2/5 ">
                            <div className="w-full">

                                {
                                    (success || failure || fidoUserError) &&
                                    <Alert
                                        color={success ? "success" : "failure"}
                                        onDismiss={() => setSuccess(null)}
                                    >
                                        <span>
                                            <p>
                                                {success || failure || fidoUserError}
                                            </p>
                                        </span>
                                    </Alert>
                                }

                                <div className='flex'>

                                    <button className='flex mt-32' onClick={handleSvgClick} >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 37 20" fill="none">
                                            <path d="M0.201172 9.23695C0.00108337 9.60157 -0.0512199 10.0028 0.050869 10.3898C0.152962 10.7769 0.404865 11.1324 0.774712 11.4114L11.3468 19.391C11.5906 19.5815 11.8823 19.7335 12.2047 19.838C12.5272 19.9426 12.874 19.9976 13.2249 19.9999C13.5759 20.0022 13.9239 19.9518 14.2487 19.8514C14.5735 19.7511 14.8686 19.603 15.1168 19.4157C15.365 19.2284 15.5612 19.0057 15.6941 18.7605C15.827 18.5153 15.8939 18.2526 15.8908 17.9878C15.8878 17.7229 15.8149 17.4611 15.6763 17.2177C15.5378 16.9743 15.3365 16.7542 15.084 16.5702L9.02094 11.9939L34.357 11.9939C35.0579 11.9939 35.7302 11.7837 36.2259 11.4096C36.7215 11.0355 37 10.5281 37 9.999C37 9.46992 36.7215 8.96251 36.2259 8.5884C35.7302 8.21428 35.0579 8.00411 34.357 8.00411L9.02094 8.00411L15.0814 3.4298C15.3338 3.24578 15.5352 3.02565 15.6737 2.78227C15.8122 2.53888 15.8851 2.27711 15.8882 2.01223C15.8912 1.74735 15.8244 1.48466 15.6915 1.2395C15.5586 0.994335 15.3623 0.771599 15.1142 0.584293C14.866 0.396986 14.5709 0.248857 14.2461 0.148552C13.9213 0.0482464 13.5732 -0.00222778 13.2223 7.43866e-05C12.8714 0.00237656 12.5245 0.0574093 12.2021 0.161961C11.8796 0.26651 11.588 0.418484 11.3442 0.609016L0.772064 8.58861C0.527206 8.77433 0.333214 8.99464 0.201172 9.23695Z" fill="#1F4EAD" />
                                        </svg>
                                    </button>

                                    <div className='mt-28 mb-20 w-full'>

                                        <div className="flex justify-center mb-4 text-center text-primary-700 text-blue-600 font-inter text-4xl font-bold leading-10 ">
                                            Login
                                        </div>
                                        <div className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
                                            Please select your login method
                                        </div>

                                    </div>
                                </div>
                                <div className="lg:hidden sm:block bg-blue-500 bg-opacity-10" >

                                    <img
                                        src="/images/choose-password-passkey.svg"
                                        alt="img" />
                                </div>

                                <div className='flex mt-30 mb-20 text-gray-700 font-inter text-xl font-medium leading-[1.05] justify-center items-center'>
                                    With Passkey you don’t need to <br /> remember complex passwords
                                </div>

                                <div className="flex justify-between">

                                    <button
                                        className="w-2/5 px-4 rounded-md text-center font-medium leading-5 border-blue-600 flex items-center justify-center hover:bg-secondary-700 bg-transparent ring-2 text-black rounded-lg text-sm"
                                        onClick={handlePasswordButtonClick}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 39 39" fill="none">
                                            <path d="M15.4505 31.8307H9.99045C8.44878 31.8307 7.16406 30.6513 7.16406 29.236V23.6338C7.16406 22.2185 8.44878 21.0391 9.99045 21.0391H27.2057" stroke="#1F4EAD" stroke-width="1.5" stroke-miterlimit="10" />
                                            <path d="M26.6315 21.0391H34.0613C36.2097 21.0391 38 22.2185 38 23.6338V29.236C38 30.6513 36.2097 31.8307 34.0613 31.8307H10.25" stroke="#1F4EAD" stroke-width="1.5" stroke-miterlimit="10" />
                                            <path d="M13.0297 28.1187C14.0514 28.1187 14.8797 27.2246 14.8797 26.1218C14.8797 25.019 14.0514 24.125 13.0297 24.125C12.008 24.125 11.1797 25.019 11.1797 26.1218C11.1797 27.2246 12.008 28.1187 13.0297 28.1187Z" fill="#1F4EAD" />
                                            <path d="M18.2563 28.1187C19.278 28.1187 20.1063 27.2246 20.1063 26.1218C20.1063 25.019 19.278 24.125 18.2563 24.125C17.2345 24.125 16.4062 25.019 16.4062 26.1218C16.4062 27.2246 17.2345 28.1187 18.2563 28.1187Z" fill="#1F4EAD" />
                                            <path d="M22.8813 28.1187C23.903 28.1187 24.7313 27.2246 24.7313 26.1218C24.7313 25.019 23.903 24.125 22.8813 24.125C21.8595 24.125 21.0312 25.019 21.0312 26.1218C21.0312 27.2246 21.8595 28.1187 22.8813 28.1187Z" fill="#1F4EAD" />
                                            <path d="M27.5063 28.1187C28.528 28.1187 29.3563 27.2246 29.3563 26.1218C29.3563 25.019 28.528 24.125 27.5063 24.125C26.4845 24.125 25.6562 25.019 25.6562 26.1218C25.6562 27.2246 26.4845 28.1187 27.5063 28.1187Z" fill="#1F4EAD" />
                                            <path d="M32.1312 28.1187C33.153 28.1187 33.9812 27.2246 33.9812 26.1218C33.9812 25.019 33.153 24.125 32.1312 24.125C31.1095 24.125 30.2812 25.019 30.2812 26.1218C30.2812 27.2246 31.1095 28.1187 32.1312 28.1187Z" fill="#1F4EAD" />
                                            <path d="M24.9868 17.9689V14.5625H8.5" stroke="#1F4EAD" stroke-width="1.5" stroke-miterlimit="10" />
                                            <path d="M22.1118 10.8079C22.1118 5.40476 18.0309 1 13.025 1C8.01912 1 3.88382 5.40476 3.88382 10.8079V14.5667H1V38H24.9956V34.1238" stroke="#1F4EAD" stroke-width="1.5" stroke-miterlimit="10" />
                                        </svg>

                                        <span className="ml-2 text-primary-700">Password</span>

                                    </button>

                                    <Button
                                        id='loginwithpasskey'
                                        isProcessing={''}
                                        onClick={() => {

                                            authenticateWithPasskey(signInUserProps?.email)
                                        }}

                                        className='w-2/5 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 37 37" fill="none">
                                            <path d="M22.9319 8.88C22.9319 13.3701 19.292 17.01 14.8019 17.01C10.3118 17.01 6.67188 13.3701 6.67188 8.88C6.67188 4.38993 10.3118 0.75 14.8019 0.75C19.292 0.75 22.9319 4.38993 22.9319 8.88Z" stroke="white" stroke-width="1.5" />
                                            <path d="M33.4534 23.3732C34.401 22.854 35.2173 22.1032 35.8288 21.1812C36.5894 20.0342 36.9976 18.6757 36.9996 17.284C37.0038 16.0481 36.6876 14.8337 36.0839 13.7677C35.4802 12.7018 34.6113 11.8233 33.568 11.2243C32.5247 10.6252 31.3452 10.3274 30.1528 10.3621C28.9604 10.3968 27.7989 10.7626 26.7897 11.4214C25.7804 12.0802 24.9604 13.0077 24.4154 14.1071C23.8704 15.2065 23.6204 16.4373 23.6915 17.671C23.7626 18.9047 24.1522 20.096 24.8196 21.1204C25.487 22.1448 26.4076 22.9646 27.4854 23.4943L33.4534 23.3732ZM33.4534 23.3732L33.2769 23.1903L32.7372 23.7112L33.0157 24.4076C33.1097 24.37 33.2028 24.3305 33.295 24.2891L33.4534 23.3732ZM36.2496 17.2814L36.2496 17.2829C36.2478 18.5292 35.8822 19.7437 35.2037 20.7667C34.5255 21.7894 33.5675 22.5715 32.4588 23.0148L31.4226 23.4291L32.1976 24.232L34.0544 26.1559L31.7029 28.5924L31.2002 29.1132L31.7029 29.6341L34.0544 32.0705L30.3396 35.9194L28.2354 33.7392V23.4943V23.0272L27.8162 22.8212C26.8618 22.3522 26.0431 21.6244 25.448 20.711C24.8528 19.7974 24.5039 18.7326 24.4403 17.6279C24.3766 16.5232 24.6007 15.4221 25.0874 14.4402C25.5741 13.4585 26.3046 12.6337 27.1996 12.0494C28.0944 11.4654 29.1218 11.1424 30.1746 11.1118C31.2273 11.0812 32.2702 11.3439 33.1945 11.8747C34.1191 12.4056 34.8926 13.186 35.4313 14.1373C35.9701 15.0887 36.2534 16.1747 36.2496 17.2814ZM28.4545 13.3975L28.9941 13.9183L28.4545 13.3975C28.0856 13.7797 27.8372 14.2635 27.7368 14.7864C27.6364 15.3092 27.6877 15.8513 27.8852 16.3453C28.0828 16.8395 28.4191 17.2662 28.8556 17.5683C29.2924 17.8708 29.8089 18.034 30.3396 18.034C31.052 18.034 31.7295 17.7405 32.2248 17.2274C32.7192 16.7151 32.9925 16.0258 32.9925 15.3124C32.9925 14.7799 32.8402 14.2574 32.5521 13.8106C32.2638 13.3636 31.8513 13.011 31.3636 12.8017C30.8756 12.5923 30.337 12.537 29.817 12.6442C29.2973 12.7513 28.8237 13.015 28.4545 13.3975Z" stroke="white" stroke-width="1.5" />
                                            <path d="M17.4183 21.4688C17.4183 21.4688 17.4184 21.4688 17.4185 21.4688C18.8529 21.4695 20.2714 21.7411 21.5925 22.266C22.2661 23.5916 23.2277 24.7608 24.41 25.6964V34.7688H0.75V31.8188C0.75 29.085 1.8858 26.4559 3.9194 24.512C5.95415 22.567 8.7208 21.4688 11.6123 21.4688H17.4183Z" stroke="white" stroke-width="1.5" />
                                        </svg>
                                        <span className="ml-2">Passkey</span>

                                    </Button>

                                </div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-6 mt-6 flex items-center justify-center">
                                    Don't have an account yet?
                                    &nbsp;<a
                                        id='navigatetosignup'
                                        href="/authentication/sign-up"
                                        className="text-primary-700 hover:underline dark:text-primary-500"
                                    >
                                        {` Create an account`}
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>) : (

                showSignInUserPassword ? <SignInUserPassword isPasskey={false} email={signInUserProps.email} /> : <SignInUser />

            )}


        </div>

    );
};

export default SignInUserPasskey;