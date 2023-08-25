import 'react-toastify/dist/ReactToastify.css';

import { Alert, Button } from 'flowbite-react';
import { addPasswordDetails, checkUserExist, getFromLocalStorage, passwordEncryption, sendVerificationMail } from '../../api/Auth.js';
import { apiStatusCodes, passwordRegex, storageKeys } from '../../config/CommonConstant.js';
import type { AxiosError, AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

import SignUpUserPassword from './SignUpUserPassword.jsx';
import secureRandomPassword from 'secure-random-password';
import { startRegistration } from '@simplewebauthn/browser';
import type { IdeviceBody, RegistrationOptionInterface } from '../Profile/interfaces/index.js';
import secureRandomPassword from 'secure-random-password';
import React from 'react';
import SignUpUser4 from './signUpUser-password.jsx';

interface nameValues {
    firstName: string;
    lastName: string;
}
interface passwordValues {

    password: string,
    confirmPassword: string
}
interface emailValue {
    email: string;
}


const SignUpUserPasskey = ({firstName, lastName}: {firstName: string; lastName: string}) => {

    const [loading, setLoading] = useState<boolean>(false)
    const [erroMsg, setErrMsg] = useState<string | null>(null)
    const [verificationSuccess, setVerificationSuccess] = useState<string>('')
    const [enableName, setEnableName] = useState<boolean>(false)
    const [continuePasswordFlag, setContinuePasswordFlag] = useState<boolean>(false)
    const [userDetails, setUserDetails] = useState<nameValues>({
        firstName: '',
        lastName: ''
    })
    const [addSuccess, setAddSuccess] = useState<string | null>(null)
    const [addfailure, setAddFailur] = useState<string | null>(null)
    const [emailAutoFill, setEmailAutoFill] = useState<string>('')
    const [fidoError, setFidoError] = useState("")
    const [showSignUpUser, setShowSignUpUser] = useState(true);
    const [showSignUpUser4, setShowSignUpUser4] = useState(false);
    const [currentComponent, setCurrentComponent] = useState<string>('email');


    useEffect(() => {

        if (window?.location?.search.length > 7) {
            setEmailAutoFill(window?.location?.search.split('=')[1])
        }
    }, [])

    const showFidoError = (error: unknown): void => {
        const err = error as AxiosError
        if (err.message.includes("The operation either timed out or was not allowed")) {
            const [errorMsg] = err.message.split('.')
            setFidoError(errorMsg)
            setTimeout(() => {
                setFidoError("")
            }, 5000)
        } else {
            setFidoError(err.message)
            setTimeout(() => {
                setFidoError("")
            }, 5000)
        }
    }

    const submit = async (passwordDetails: passwordValues, fidoFlag: boolean) => {
        const userEmail = await getFromLocalStorage(storageKeys.USER_EMAIL)
        const payload = {
            password: passwordEncryption(passwordDetails?.password),
            isPasskey: false,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName
        }
        setLoading(true)

        const userRsp = await addPasswordDetails(payload, userEmail)
        const { data } = userRsp as AxiosResponse
        setLoading(false)
        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            window.location.href = `/authentication/sign-in?signup=true?fidoFlag=${fidoFlag}`
        } else {
            setErrMsg(userRsp as string)
        }
        return userRsp;
    }


    const registerWithPasskey = async (flag: boolean): Promise<void> => {
        try {
            const userEmail = await getFromLocalStorage(storageKeys.USER_EMAIL)
            const RegistrationOption: RegistrationOptionInterface = {
                userName: userEmail,
                deviceFlag: flag
            }
            const generateRegistrationResponse = await generateRegistrationOption(RegistrationOption)
            const { data } = generateRegistrationResponse as AxiosResponse
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const opts = data?.data
                const challangeId = data?.data?.challenge


                if (opts) {
                    opts.authenticatorSelection = {
                        residentKey: "preferred",
                        requireResidentKey: false,
                        userVerification: "preferred"
                    }
                }
                setLoading(false)
                const attResp = await startRegistration(opts)
                const verifyRegistrationObj = {
                    ...attResp,
                    challangeId
                }

                await verifyRegistrationMethod(verifyRegistrationObj, userEmail);
            } else {
                setErrMsg(generateRegistrationResponse as string)
            }
        } catch (error) {
            showFidoError(error)
        }
    }
    const verifyRegistrationMethod = async (verifyRegistrationObj: any, OrgUserEmail: string) => {
        try {
            const verificationRegisterResp = await verifyRegistration(verifyRegistrationObj, OrgUserEmail)
            const { data } = verificationRegisterResp as AxiosResponse

            const credentialID = data?.data?.newDevice?.credentialID
            if (data?.data?.verified) {
                let platformDeviceName = ''

                if (verifyRegistrationObj?.authenticatorAttachment === "cross-platform") {
                    platformDeviceName = 'Passkey'
                } else {
                    platformDeviceName = navigator.platform
                }

                const deviceBody: IdeviceBody = {
                    userName: OrgUserEmail,
                    credentialId: credentialID,
                    deviceFriendlyName: platformDeviceName

                }
                await addDeviceDetailsMethod(deviceBody)
            }
        } catch (error) {
            showFidoError(error)
        }
    }
    const addDeviceDetailsMethod = async (deviceBody: IdeviceBody) => {
        try {
            const deviceDetailsResp = await addDeviceDetails(deviceBody)
            const { data } = deviceDetailsResp as AxiosResponse
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const password = secureRandomPassword.randomPassword({
                    characters: secureRandomPassword.lower + secureRandomPassword.upper + secureRandomPassword.digits,
                    length: 12,
                });
                const fidoPassword = {
                    password: `${password}@1`,
                    confirmPassword: `${password}@1`
                }

                submit(fidoPassword, true)
            } else {
                setAddFailur(deviceDetailsResp as string)
            }
            setTimeout(() => {
                setAddSuccess('')
                setAddFailur('')
            }, 5000);
        } catch (error) {
            showFidoError(error)
        }
    }


    return (
        <div className='h-50'>

            {currentComponent === 'email' &&

                <div className="w-full h-full bg-white flex-shrink-0">
                    <div className="flex flex-col md:flex-row" style={{ height: '830px' }}>
                        <div className="flex md:h-auto md:w-3/5 bg-white" style={{ justifyContent: 'center', padding: 100 }}>
                            <div className='absolute left-10 top-10'>
                                <a href="/" className="flex items-center">
                                    <img
                                        src="/images/CREDEBL_ICON.png"
                                        className="mr-2 h-6 sm:h-9"
                                        alt="CREDEBL Logo"
                                    />
                                    <span
                                        className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
                                    >
                                        CREDEBL</span>

                                </a>
                            </div>

                            <img className="flex"
                                src="/images/signin.svg"
                                alt="img" />

                            <div className="absolute left-10 bottom-10">
                                &copy; 2019 - {new Date().getFullYear()} —
                                <a className="hover:underline" target="_blank"
                                >CREDEBL</a> | All rights reserved.
                            </div>

                        </div>
                        <div className="flex items-center justify-center p-6 sm:p-12 md:w-2/5 shadow-xl shadow-blue-700">
                            <div className="w-full" style={{ height: '700px' }}>
                                {
                                    (verificationSuccess || erroMsg) &&
                                    <Alert
                                        color={verificationSuccess ? "success" : "failure"}
                                        onDismiss={() => setErrMsg(null)}
                                    >
                                        <span>
                                            <p>
                                                {verificationSuccess || erroMsg}
                                            </p>
                                        </span>
                                    </Alert>
                                }

                                <div className='mt-20 mb-24'>

                                    <div className="flex justify-center mb-4 text-center text-primary-700 text-blue-600 font-inter text-4xl font-bold leading-10 ">
                                        Create an account
                                    </div>
                                    <div className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
                                        Please enter your email id to login
                                    </div>

                                </div>

                                <div className='mt-24 text-[#6B7280] font-inter font-normal leading-[1.05] justify-center items-center'>
                                    <div className='text-base'>With Passkey you don’t need to remember complex passwords</div>

                                    <div className='mt-4'>
                                        <p className='text-xl text-gray-600'>What are passkeys?</p>
                                        <p className='text-base'>Passkeys are encrypted digital keys you create using fingerprint, face, or screen lock</p>

                                    </div>

                                    <div className='mt-4'>
                                        <p className='text-xl text-gray-600'>Where are passkeys saved?</p>
                                        <p className=' text-base'>Passkeys are saved to your password manager, so you can sign in on other devices.</p>

                                    </div>

                                </div>

                                <div className="flex justify-between mt-24">
                                    <button
                                        className="block w-2/5 py-2 px-4 rounded-md border text-center font-medium leading-5 border-blue-600 bg-white flex items-center justify-center"
                                        onClick={() => setCurrentComponent('password')}
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
                                        id='signupcreatepasskey'
                                        isProcessing={''}
                                        onClick={() => {
                                            registerWithPasskey(true)
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

                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-10 flex items-center justify-center">
                                    Already have an account?
                                    &nbsp;<a
                                        id='navigatetosignup'
                                        href="/authentication/sign-in"
                                        className="text-primary-700 hover:underline dark:text-primary-500"
                                    >
                                        {` Login here`}
                                    </a>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>}

            {
                currentComponent === 'password' && (
                    <SignUpUserPassword 
                    firstName={firstName}
                    lastName={lastName}
                    />
                )
            }
        </div>
    );
};

export default SignUpUserPasskey;
