import './global.css'

import * as yup from 'yup';

import { Button, Label, Spinner } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
} from 'formik';
import { getUserProfile, loginUser, passwordEncryption, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { useState } from 'react';

import { Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import React from 'react';
import SignInUserPasskey from './SignInUserPasskey';
import { getSupabaseClient } from '../../supabase';

interface passwordValue {
	password: string;
}

interface SignInUser3Props {
	email: string,
	isPasskey: boolean,
	password?: string
}

const SignInUserPassword = (signInUserProps: SignInUser3Props) => {
	const [email, setEmail] = useState(signInUserProps?.email)
	const [fidoUserError, setFidoUserError] = useState("")
	const [success, setSuccess] = useState<string | null>(null)
	const [failure, setFailure] = useState<string | null>(null)
	const [isForgotPassLoading, setForgotPassLoading] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [currentComponent, setCurrentComponent] = useState<string>('email');
	const [showSignInUser2, setShowSignInUser2] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);


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
			setFailure(userDetails as string)
		}
		setLoading(false)
	}


	const signInUser = async (values: passwordValue) => {
		const payload: SignInUser3Props = {
			email: email,
			isPasskey: false,
			password: passwordEncryption(values.password)
		}
		setLoading(true)
		const loginRsp = await loginUser(payload)
		const { data } = loginRsp as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			await setToLocalStorage(storageKeys.TOKEN, data?.data?.access_token)

			const response = await fetch('/api/auth/signin', {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.redirected) {
				getUserDetails(data?.data?.access_token)
			}

		} else {
			setLoading(false)
			setFailure(loginRsp as string)
			
		}
	}

	const handleBackButtonClick = () => {
		setShowSignInUser2(!showSignInUser2);

	};

	const forgotPassword = async () => {

		setForgotPassLoading(true);

		var base_url = window.location.origin;

		const { data, error } = await getSupabaseClient().auth.resetPasswordForEmail(email
			, {
				redirectTo: `${base_url}/reset-password`,
			});
		setForgotPassLoading(false);

		if (!error) {
			setSuccess('Reset password link has been sent to you on mail');
		} else {
			setFailure('Unable to send reset link for the password')
		}

	}


	return (
		<div>
			{showSignInUser2 ? (
				<SignInUserPasskey email={email as string} />
			) : (
				currentComponent === 'email' && (


					<div className="flex flex-col min-h-screen">
						<nav
							className="bg-white border-b border-gray-200 sm:py-2"
						>

							<div className="flex items-center justify-between">
								<div className="flex items-center justify-start">
									<a className="flex mr-4" href="/">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="ml-4"
											width="35"
											height="35"
											fill="none"
											viewBox="0 0 45 45"
										>
											<path
												fill="#25AFE1"
												d="M45 22.5C45 34.926 34.926 45 22.5 45S0 34.926 0 22.5 10.074 0 22.5 0 45 10.074 45 22.5Zm-41.785 0c0 10.65 8.634 19.285 19.285 19.285 10.65 0 19.285-8.634 19.285-19.285 0-10.65-8.634-19.285-19.285-19.285-10.65 0-19.285 8.634-19.285 19.285Z"
											></path>
											<path
												fill="#1F4EAD"
												d="M38.392 36.132a1.605 1.605 0 0 0-2.272 0 19.072 19.072 0 0 1-13.593 5.646c-10.6 0-19.224-8.648-19.224-19.278 0-10.63 8.624-19.278 19.224-19.278 5.07 0 9.854 1.962 13.47 5.524a1.604 1.604 0 0 0 2.712-1.17c0-.421-.165-.827-.46-1.128A22.276 22.276 0 0 0 22.527 0C10.155 0 .09 10.094.09 22.5.09 34.907 10.155 45 22.527 45c5.993 0 11.627-2.34 15.865-6.59a1.61 1.61 0 0 0 0-2.278Z"
											></path>
											<path
												fill="#1F4EAD"
												d="M32.442 11.283a2.047 2.047 0 0 0-2.9-.188c-1.703 1.514-4.68 6.1-6.552 11.059a33.11 33.11 0 0 0-1.112 3.498c-1.415-2.218-2.598-3.55-4.024-5.156-.98-1.104-2.086-2.35-3.51-4.19a2.055 2.055 0 0 0-1.363-.787 2.037 2.037 0 0 0-1.516.415 2.079 2.079 0 0 0-.368 2.901c1.483 1.919 2.654 3.237 3.692 4.407 2.157 2.43 3.701 4.17 6.667 10.139a2.056 2.056 0 0 0 2.245 1.267 2.056 2.056 0 0 0 1.336-.84 2.085 2.085 0 0 0 .356-1.544c-.408-2.467.303-5.627 1.44-8.64 1.648-4.362 4.088-8.236 5.422-9.423a2.077 2.077 0 0 0 .187-2.919Z"
											></path>
											<path
												fill="#1F4EAD"
												d="M18.979 8.44c-.59.146-.43.876.055.633.009 0 2.811-.948 4.648 1.991.226.361.527-.106.405-.363-.387-.81-2.055-3.015-5.108-2.261Zm-1.332 6.08c-.348-2.248.588-3.739 1.751-4.04 2.77-.72 4.14 2.719 4.14 4.528 0 1.765-1.25 2.542-2.142 2.464-1.498-.133-2.203-1.71-2.42-2.94-.054-.299-.466-2.604 1.383-2.617 1.26-.01 1.968 2.186 1.885 3.032-.054.553-.311 1.13-.894 1.079-.777-.07-1.063-1.194-1.102-1.639-.009-.07-.168-.942.256-.868.292.05.363.598.373.634.04.13.068.296.085.448.018.13-.011.278.04.421a.383.383 0 0 0 .322.273c.103.009.3-.097.306-.259.013-.861-.345-2.394-1.354-2.304-.568.05-.867.705-.705 1.76.157 1.027.688 2.157 1.738 2.25 1.154.102 1.62-.959 1.62-1.757 0-2.278-1.53-4.368-3.337-3.742-1.038.359-1.668 1.497-1.314 3.353.368 1.924 1.498 3.69 3.138 3.642 3.003-.088 2.794-3.309 2.794-3.309 0-2.96-2.381-6.384-5.435-5.05-1.258.55-2.243 2.403-1.871 4.665.943 5.738 5.06 5.079 5.252 5.049l.015.001c.656-.095.522-.833.041-.75-2.726.47-4.197-1.944-4.565-4.325Z"
											></path></svg>

										<span
											className="ml-2 self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
										>CREDEBL</span>

									</a>
								</div>
							</div>
						</nav>
						<div className="flex flex-1 flex-col md:flex-row">
							<div className="md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
								<div className='flex justify-center'>

									<img
										className='hidden sm:block'
										src="/images/signInPassword.svg"
										alt="img" />

								</div>
							</div>

							<div className="md:w-2/5 w-full p-10 flex">

								<div className="w-full">

									{
										(success || failure || fidoUserError) &&
										<Alert
											color={success ? "success" : "failure"}
											onDismiss={() => {
												setSuccess(null)
												setFailure(null)
											}}
										>
											<span>
												<p>
													{success || failure || fidoUserError}
												</p>
											</span>
										</Alert>
									}

									<div className='flex lg:mt-16'>

										<button className='flex mt-2' onClick={handleBackButtonClick} >
											<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 37 20" fill="none">
												<path d="M0.201172 9.23695C0.00108337 9.60157 -0.0512199 10.0028 0.050869 10.3898C0.152962 10.7769 0.404865 11.1324 0.774712 11.4114L11.3468 19.391C11.5906 19.5815 11.8823 19.7335 12.2047 19.838C12.5272 19.9426 12.874 19.9976 13.2249 19.9999C13.5759 20.0022 13.9239 19.9518 14.2487 19.8514C14.5735 19.7511 14.8686 19.603 15.1168 19.4157C15.365 19.2284 15.5612 19.0057 15.6941 18.7605C15.827 18.5153 15.8939 18.2526 15.8908 17.9878C15.8878 17.7229 15.8149 17.4611 15.6763 17.2177C15.5378 16.9743 15.3365 16.7542 15.084 16.5702L9.02094 11.9939L34.357 11.9939C35.0579 11.9939 35.7302 11.7837 36.2259 11.4096C36.7215 11.0355 37 10.5281 37 9.999C37 9.46992 36.7215 8.96251 36.2259 8.5884C35.7302 8.21428 35.0579 8.00411 34.357 8.00411L9.02094 8.00411L15.0814 3.4298C15.3338 3.24578 15.5352 3.02565 15.6737 2.78227C15.8122 2.53888 15.8851 2.27711 15.8882 2.01223C15.8912 1.74735 15.8244 1.48466 15.6915 1.2395C15.5586 0.994335 15.3623 0.771599 15.1142 0.584293C14.866 0.396986 14.5709 0.248857 14.2461 0.148552C13.9213 0.0482464 13.5732 -0.00222778 13.2223 7.43866e-05C12.8714 0.00237656 12.5245 0.0574093 12.2021 0.161961C11.8796 0.26651 11.588 0.418484 11.3442 0.609016L0.772064 8.58861C0.527206 8.77433 0.333214 8.99464 0.201172 9.23695Z" fill="#1F4EAD" />
											</svg>
										</button>

										<div className="w-full flex flex-col items-center justify-center ">

											<h2 className="text-primary-700 text-blue-600 font-inter text-3xl font-bold leading-10">
												Login
											</h2>

											<p className="text-gray-500 font-inter text-base font-medium leading-5 mt-2">
												Enter password to Login
											</p>

										</div>
									</div>

									</div>

									<div className="lg:hidden sm:block md:hidden sm:block bg-blue-500 bg-opacity-10 mt-4">
										<img
											src="/images/signInPassword.svg"
											alt="img" />
									</div>



									<Formik
										initialValues={{
											password: '',
										}}
										validationSchema={yup.object().shape({
											password: yup
												.string()
												.required('Password is required')
										})}
										validateOnBlur
										validateOnChange
										enableReinitialize
										onSubmit={(values: passwordValue) => signInUser(values)}					>
										{(formikHandlers): JSX.Element => (
											<Form className="mt-16 space-y-6" onSubmit={formikHandlers.handleSubmit}>
												<div className="text-primary-700 font-inter text-base font-medium leading-5 ">

													<div className="block mb-2 text-sm font-medium  dark:text-white">
														<Label className="text-primary-700" htmlFor="email2" value="Your Password" />
														<span className='text-red-500 text-xs'>*</span>
													</div>

													<div className="relative">
														<Field id='signinpassword'
															name='password'
															className="truncate w-full bg-gray-200 px-4 py-2 text-gray-900 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
															placeholder="Please enter your password"
															type={passwordVisible ? 'text' : 'password'} />

														<button
															type="button"
															onClick={() => setPasswordVisible((prevVisible) => !prevVisible)}
															className="bg-transparent ml-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
														>
															{passwordVisible ? (
																<svg className="h-6 w-6 text-black"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round">
																	<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
																	<circle cx="12" cy="12" r="3" /></svg>
															) : (
																<svg className="h-6 w-6 text-black"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	stroke-width="2"
																	stroke-linecap="round"
																	stroke-linejoin="round">
																	<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
																	<line x1="1" y1="1" x2="23" y2="23" /></svg>)}
														</button>
													</div>
													{
														(formikHandlers?.errors?.password && formikHandlers?.touched?.password) &&
														<span className="text-red-500 text-xs absolute mt-1">
															{formikHandlers?.errors?.password}</span>
													}

												</div>

												<div className="text-sm flex justify-end font-sm text-gray-500 dark:text-gray-400 text-primary-700  dark:text-primary-500  ml-auto">

													{isForgotPassLoading
														? <span>
															<Spinner
																className='mr-2'
																color="info"

															/>
															Loading...
														</span>
														: <span onClick={forgotPassword} className='hover:underline cursor-pointer'>

															{`Forgot Password?`}
														</span>
													}
												</div>


												<div>
													<Button
														id='signinsubmit'
														isProcessing={loading}
														type="submit"
														onClick={() => {
															if (formikHandlers.errors.password) {
																signInUser(formikHandlers.values);
															}
														}}

														className='w-full font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="22" height="21" viewBox="0 0 38 37" fill="none">
															<path d="M25.6203 21.2026C25.9292 21.2026 26.2293 21.053 26.389 20.7875C26.6242 20.3982 26.4697 19.9092 26.0451 19.6936C24.8394 19.0839 23.5513 18.6222 22.2245 18.2876C25.6888 16.7062 28.079 13.4342 28.079 9.65217C28.079 4.329 23.3565 0 17.5494 0C11.7423 0 7.01973 4.329 7.01973 9.65217C7.01973 13.4326 9.40823 16.7015 12.8672 18.2844C9.97157 19.0132 7.31283 20.4063 5.13493 22.4027C1.82335 25.4383 0 29.4793 0 33.7826V36.1956C0 36.6396 0.393134 37 0.877497 37C1.36186 37 1.75499 36.6396 1.75499 36.1956V33.7826C1.75499 29.9088 3.39762 26.2732 6.3775 23.5401C9.35739 20.8069 13.3253 19.3043 17.5494 19.3043C20.2257 19.3043 22.8705 19.9269 25.1975 21.1029C25.3308 21.1704 25.4765 21.2026 25.6203 21.2026ZM8.77472 9.65217C8.77472 5.217 12.711 1.60867 17.5494 1.60867C22.3877 1.60867 26.3241 5.217 26.3241 9.65217C26.3241 14.0873 22.3877 17.6957 17.5494 17.6957C12.711 17.6956 8.77472 14.0873 8.77472 9.65217Z" fill="white" />
															<path d="M21.2585 36.3855C19.9011 25.8284 27.5516 21.0023 36.3948 21.5679" stroke="white" stroke-linecap="round" />
															<path d="M33.6328 18.5L36.9964 21.5833L33.6328 24.6667" stroke="white" stroke-linecap="round" />
														</svg>
														<span className="ml-2">Login</span>

													</Button>
												</div>


												<div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-6 flex flex-col md:flex-row md:justify-center items-center justify-center">
													Don't have an account yet?
													&nbsp;<a
														id='navigatetosignup'
														href="/authentication/sign-up"
														className="text-primary-700 hover:underline dark:text-primary-500"
													>
														{` Create an account`}
													</a>
												</div>
											</Form>
										)}
									</Formik>
								</div>
							</div>
						</div>

						<footer className="bg-white border-b border-gray-200 sm:py-2 dark:bg-gray-800 dark:border-gray-700 ">

							<div className="dark:bg-gray-700 md:flex md:items-center md:justify-between p-3">
								<p className="text-sm text-center text-gray-500">
									&copy; 2019 - {new Date().getFullYear()} -
									<a className="hover:underline" target="_blank"
									>CREDEBL
									</a> | All rights reserved.
								</p>

							</div>
						</footer>

					</div>


				))}
		</div>
	);
};

export default SignInUserPassword;