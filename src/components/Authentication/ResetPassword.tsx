import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Label } from 'flowbite-react';;
import { apiStatusCodes, passwordRegex, storageKeys } from '../../config/CommonConstant.js';
import { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { getSupabaseClient } from '../../supabase';
import { pathRoutes } from '../../config/pathRoutes.js';
import PasswordSuggestionBox from './PasswordSuggestionBox.js';
import FooterBar from './FooterBar.js';
import NavBar from './NavBar.js';
import { addPasskeyUserDetails, passwordEncryption, setToLocalStorage } from '../../api/Auth.js';
import type { AxiosResponse } from 'axios';
import { PassInvisible, PassVisible, SignUpArrow } from './Svg.js';
import React from 'react';

interface passwordValues {
    password: string;
    confirmPassword: string;
}

const ResetPassword = () => {

    const [loading, setLoading] = useState<boolean>(false)
    const [erroMsg, setErrMsg] = useState<string | null>(null)
    const [message, setMessage] = useState<string>('')
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [userToken, setUserToken] = useState<string>('');
    const [showSuggestion, setShowSuggestion] = useState(false);

    useEffect(() => {
        const setAccessToken = async () => {
            const hashPart = window.location.href.split("#")[1];
            const paramsArray = hashPart.split("&");
            let accessToken;
            for (const param of paramsArray) {
                const [key, value] = param.split("=");
                if (key === "access_token") {
                    accessToken = value;
                    break;
                }
            }
            if (accessToken) {
                setUserToken(accessToken);
            } else {
                setErrMsg('An error occurred while updating password in supabase.');
            }

        };
        setAccessToken();
    }, []);

    const submit = async (passwordDetails: passwordValues) => {
        try {
            await setToLocalStorage(storageKeys.TOKEN, userToken);
            setLoading(true);

            const { data, error } = await getSupabaseClient().auth.updateUser({ password: passwordDetails?.password });

            if (data?.user?.email) {
                await updatePasswordDetails(passwordEncryption(passwordDetails?.password), data.user.email);
            }

            if (!error) {
                setLoading(false);
                window.location.href = `${pathRoutes.auth.sinIn}?isPasswordSet=true`
            } else {
                setLoading(false);
                setErrMsg(error.message);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setErrMsg('An error occurred while updating password in supabase.');
        }
    };


    const updatePasswordDetails = async (password: string, email: string) => {
        try {
            const payload = {
                password: password
            }
            const passkeyUserDetailsResp = await addPasskeyUserDetails(payload, email);
            const { data } = passkeyUserDetailsResp as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setLoading(false);
            } else {
                setErrMsg(passkeyUserDetailsResp as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setErrMsg('An error occurred while updating password details.');
        }
    };


    return (
        <div>
            <div className='flex flex-col min-h-screen'>

                <NavBar />
                <div className="flex flex-1 flex-col md:flex-row">
                    <div className="hidden md:block md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
                        <div className="flex justify-center" >
                            <img
                                className='max-h-100/10rem'
                                src="/images/signin.svg"
                                alt="img" />
                        </div>
                    </div>
                    <div className="flex md:w-2/5 w-full p-10">
                        <div className="w-full">
                            {
                                (message || erroMsg) &&
                                <Alert
                                    color={message ? "success" : "failure"}
                                    onDismiss={() => setErrMsg(null)}
                                >
                                    <span>
                                        <p>
                                            {message || erroMsg}
                                        </p>
                                    </span>
                                </Alert>
                            }

                            <div className='flex lg:mt-8 w-full flex-col'>
                                <div className="flex justify-center text-center text-primary-700 text-blue-600 font-inter text-3xl font-bold leading-10 ">
                                    Reset Password
                                </div>
                                <div className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
                                    Please set new password
                                </div>

                            </div>

                            <div className="md:hidden block bg-blue-500 bg-opacity-10 mt-4" >

                                <img
                                    src="/images/signin.svg"
                                    alt="img" />
                            </div>


                            <Formik
                                initialValues={{
                                    firstName: '',
                                    lastName: '',
                                    password: '',
                                    confirmPassword: ''
                                }}
                                validationSchema={yup.object().shape({
                                    password: yup
                                        .string()
                                        .required('Password is required')
                                        .matches(passwordRegex, ' '),
                                    confirmPassword: yup
                                        .string()
                                        .required('Confirm Password is required')
                                        .oneOf([yup.ref('password')], 'Passwords must match'),
                                })}
                                validateOnBlur
                                validateOnChange
                                enableReinitialize

                                onSubmit={(
                                    values: passwordValues,
                                ) => {
                                    submit(values)
                                }}

                            >
                                {(formikHandlers): JSX.Element => (

                                    <Form className="mt-12 space-y-6" onSubmit={formikHandlers.handleSubmit}>

                                        <div>
                                            <div className="text-primary-700 font-inter text-base font-medium leading-5">
                                                <div className="block mb-2 text-sm font-medium  dark:text-white">
                                                    <Label className="text-primary-700" htmlFor="password" value="New Password" />
                                                    <span className='text-red-500 text-xs'>*</span>

                                                </div>
                                                <div className="relative">
                                                    <Field
                                                        id="resetpassword"
                                                        name="password"
                                                        placeholder="Please enter password"
                                                        className="truncate w-full bg-gray-200 pl-4 py-2 !pr-10 text-gray-700 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                        type={passwordVisible ? 'text' : 'password'}
                                                        onFocus={(): void => {
                                                            setShowSuggestion(true);
                                                        }}
                                                        onBlurCapture={(e: any): void => {
                                                            setShowSuggestion(false);
                                                            formikHandlers.handleBlur(e);
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPasswordVisible((prevVisible) => !prevVisible)}
                                                        className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"

                                                    >
                                                        {passwordVisible ? (
                                                            <PassInvisible />
                                                        ) : (
                                                            <PassVisible />
                                                        )}
                                                    </button>
                                                </div>
                                                {showSuggestion &&
                                                    formikHandlers?.errors?.password &&
                                                    formikHandlers.values.password && (
                                                        <PasswordSuggestionBox
                                                            show={true}
                                                            value={formikHandlers?.values?.password}
                                                        />
                                                    )}

                                                {
                                                    (formikHandlers?.errors?.password && formikHandlers?.touched?.password) &&
                                                    <span className="text-red-500 text-xs absolute mt-1">{formikHandlers?.errors?.password}</span>
                                                }
                                            </div>
                                            <div className="text-primary-700 font-inter text-base font-medium leading-5 mt-8 mb-6">
                                                <div className="block mb-2 text-sm font-medium  dark:text-white">
                                                    <Label className="text-primary-700" htmlFor="confirmPassword" value="Confirm New Password" />
                                                    <span className='text-red-500 text-xs'>*</span>

                                                </div>
                                                <div className="relative">
                                                    <Field
                                                        id="resetconfirmpassword"
                                                        name="confirmPassword"
                                                        placeholder="Please re-enter password"
                                                        className="truncate w-full bg-gray-200 px-4 py-2 text-gray-900 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                        type={confirmPasswordVisible ? 'text' : 'password'}
                                                        onBlur={(e: any): void => {
                                                            formikHandlers.handleBlur(e);
                                                        }}
                                                    />

                                                    <button

                                                        type="button"
                                                        onClick={() => setConfirmPasswordVisible((prevVisible) => !prevVisible)}
                                                        className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
                                                    >
                                                        {confirmPasswordVisible ? (
                                                            <svg className="h-6 w-6 text-black"
                                                                viewBox="0 0 24 24" fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                <circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-6 w-6 text-black"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                stroke-width="2"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round">
                                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                                <line x1="1" y1="1" x2="23" y2="23" />
                                                            </svg>)}
                                                    </button>

                                                </div>
                                                {
                                                    (formikHandlers?.errors?.confirmPassword && formikHandlers?.touched?.confirmPassword) &&
                                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.confirmPassword}</span>
                                                }
                                            </div>

                                            <div className="flex justify-end mt-12">

                                                <Button
                                                    id='signupbutton'
                                                    type="submit"
                                                    isProcessing={loading}
                                                    className='w-full font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 20" fill="none">
                                                        <path d="M29.8369 10.763C29.9991 10.3984 30.0415 9.99721 29.9588 9.61015C29.876 9.22309 29.6717 8.86759 29.3719 8.58861L20.7999 0.609018C20.6022 0.418485 20.3657 0.26651 20.1043 0.161959C19.8428 0.0574089 19.5616 0.00237707 19.2771 7.53215e-05C18.9925 -0.00222642 18.7103 0.0482475 18.447 0.148553C18.1836 0.248858 17.9443 0.396985 17.7431 0.584292C17.5419 0.771598 17.3828 0.994332 17.275 1.2395C17.1673 1.48466 17.1131 1.74735 17.1155 2.01223C17.118 2.27711 17.1771 2.53888 17.2894 2.78227C17.4018 3.02566 17.565 3.24578 17.7697 3.4298L22.6857 8.0061H2.14299C1.57464 8.0061 1.02956 8.21628 0.627668 8.59039C0.225779 8.96451 0 9.47192 0 10.001C0 10.5301 0.225779 11.0375 0.627668 11.4116C1.02956 11.7857 1.57464 11.9959 2.14299 11.9959H22.6857L17.7718 16.5702C17.5672 16.7542 17.4039 16.9743 17.2916 17.2177C17.1793 17.4611 17.1202 17.7229 17.1177 17.9878C17.1152 18.2526 17.1694 18.5153 17.2772 18.7605C17.3849 19.0057 17.5441 19.2284 17.7453 19.4157C17.9465 19.603 18.1858 19.7511 18.4491 19.8514C18.7125 19.9518 18.9947 20.0022 19.2792 19.9999C19.5638 19.9976 19.845 19.9426 20.1064 19.838C20.3679 19.7335 20.6043 19.5815 20.802 19.391L29.374 11.4114C29.5725 11.2257 29.7298 11.0054 29.8369 10.763Z" fill="white" />
                                                    </svg>
                                                    <span className="ml-2">Submit</span>
                                                </Button>

                                            </div>
                                        </div>

                                    </Form>

                                )}
                            </Formik>

                        </div>

                    </div>
                </div>
            </div>
            <FooterBar />
        </div>
    );
};

export default ResetPassword;
