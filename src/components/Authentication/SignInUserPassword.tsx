import '../../common/global.css'

import * as yup from 'yup';

import { Button, Label } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
} from 'formik';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getUserProfile, loginUser, passwordEncryption, setToLocalStorage } from '../../api/Auth';

import { Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import CustomSpinner from '../CustomSpinner';
import SignInUserPasskey from './SignInUserPasskey';
import { getSupabaseClient } from '../../supabase';
import NavBar from './NavBar';
import FooterBar from './FooterBar';
import React, { useState } from 'react';
import { PlatformRoles } from '../../common/enums';
import { pathRoutes } from '../../config/pathRoutes';

interface emailValue {
	email: string;
}

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
			const role = data?.data?.userOrgRoles.find((item: { orgRole: { name: PlatformRoles; }; }) => item.orgRole.name === PlatformRoles.platformAdmin)
			const permissionArray: number | string[] = []
			data?.data?.userOrgRoles?.forEach((element: { orgRole: { name: string } }) => permissionArray.push(element?.orgRole?.name));
			await setToLocalStorage(storageKeys.USER_PROFILE, data?.data)
			await setToLocalStorage(storageKeys.USER_EMAIL, data?.data?.email)
			return {
				role: role?.orgRole || ""
			}
		} else {
			setFailure(userDetails as string)
		}

		setLoading(false)
	}
	const signInUser = async (values: passwordValue) => {
		const payload: SignInUser3Props = {
			email: email?.trim()?.toLocaleLowerCase(),
			isPasskey: false,
			password: passwordEncryption(values.password)
		}
		setLoading(true)
		const loginRsp = await loginUser(payload)
		const { data } = loginRsp as AxiosResponse
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			await setToLocalStorage(storageKeys.TOKEN, data?.data?.access_token)
			const userRole = await getUserDetails(data?.data?.access_token)

			const userPayload = {
				...data,
				data: {
					...data.data,
					role: userRole?.role?.name || ""
				}
			}

			await fetch('/api/auth/signin', {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userPayload),
			});

			window.location.href = userRole?.role?.name === PlatformRoles.platformAdmin ? pathRoutes.users.platformSetting : pathRoutes.users.dashboard
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
						<NavBar />
						<div className="flex flex-1 flex-col md:flex-row">
							<div className="hidden md:block md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
								<div className='flex justify-center'>

									<img
										className='max-h-100/10rem'
										src="/images/signInPassword.svg"
										alt="img" />

								</div>
							</div>

							<div className="md:w-2/5 w-full p-10 flex">

								<div className="w-full">

									{
										(success || failure || fidoUserError) &&
										<Alert
											className='mb-4'
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

									<div className='flex mt-2 xl:mt-8'>
										<button type="button" className='flex mt-2' onClick={handleBackButtonClick} >
											<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 37 20" fill="none">
												<path d="M0.201172 9.23695C0.00108337 9.60157 -0.0512199 10.0028 0.050869 10.3898C0.152962 10.7769 0.404865 11.1324 0.774712 11.4114L11.3468 19.391C11.5906 19.5815 11.8823 19.7335 12.2047 19.838C12.5272 19.9426 12.874 19.9976 13.2249 19.9999C13.5759 20.0022 13.9239 19.9518 14.2487 19.8514C14.5735 19.7511 14.8686 19.603 15.1168 19.4157C15.365 19.2284 15.5612 19.0057 15.6941 18.7605C15.827 18.5153 15.8939 18.2526 15.8908 17.9878C15.8878 17.7229 15.8149 17.4611 15.6763 17.2177C15.5378 16.9743 15.3365 16.7542 15.084 16.5702L9.02094 11.9939L34.357 11.9939C35.0579 11.9939 35.7302 11.7837 36.2259 11.4096C36.7215 11.0355 37 10.5281 37 9.999C37 9.46992 36.7215 8.96251 36.2259 8.5884C35.7302 8.21428 35.0579 8.00411 34.357 8.00411L9.02094 8.00411L15.0814 3.4298C15.3338 3.24578 15.5352 3.02565 15.6737 2.78227C15.8122 2.53888 15.8851 2.27711 15.8882 2.01223C15.8912 1.74735 15.8244 1.48466 15.6915 1.2395C15.5586 0.994335 15.3623 0.771599 15.1142 0.584293C14.866 0.396986 14.5709 0.248857 14.2461 0.148552C13.9213 0.0482464 13.5732 -0.00222778 13.2223 7.43866e-05C12.8714 0.00237656 12.5245 0.0574093 12.2021 0.161961C11.8796 0.26651 11.588 0.418484 11.3442 0.609016L0.772064 8.58861C0.527206 8.77433 0.333214 8.99464 0.201172 9.23695Z" fill="#1F4EAD" />
											</svg>
										</button>

										<div className="w-full flex flex-col items-center justify-center ">
											<h2 className="text-primary-700 dark:text-gray-200 font-inter text-3xl font-bold leading-10">
												Login
											</h2>
											<p className="text-gray-500 font-inter text-base font-medium leading-5 mt-2">
												Enter password to Login
											</p>
										</div>
									</div>
									<div className='my-8 mx-auto px-4 py-2 flex justify-center w-full sm:w-fit items-center bg-gray-50 gap-2 border border-gray-200 rounded-md text-gray-600 dark:text-white dark:bg-gray-800'>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="16"
											viewBox="0 0 30 24"
											fill="none"
										>
											<path
												d="M27 0H3C1.35 0 0.015 1.35 0.015 3L0 21C0 22.65 1.35 24 3 24H27C28.65 24 30 22.65 30 21V3C30 1.35 28.65 0 27 0ZM27 6L15 13.5L3 6V3L15 10.5L27 3V6Z"
												fill="#1F4EAD"
											/>
										</svg>
										<span className='truncate text-gray-600 dark:text-gray-100'>
											{signInUserProps?.email}
										</span>
									</div>
									<div className="block md:hidden bg-blue-500 bg-opacity-10 mt-4 mb-8">
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
											<Form onSubmit={formikHandlers.handleSubmit}>
												<div className="text-primary-700 font-inter text-base font-medium leading-5 ">

													<div className="block mb-2 text-sm font-medium  dark:text-white">
														<Label className="text-primary-700 dark:text-gray-200" htmlFor="email2" value="Your Password " />
														<span className='text-red-500 text-xs'>*</span>
													</div>

													<div className="relative">
														<Field id='signinpassword'
															name='password'
															className="truncate w-full dark:text-white bg-gray-200 dark:bg-gray-800 px-4 py-2 !pr-10 text-gray-900 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
															placeholder="Please enter your password"
															type={passwordVisible ? 'text' : 'password'} />

														<button
															type="button"
															onClick={() => setPasswordVisible((prevVisible) => !prevVisible)}
															className="bg-transparent ml-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
														>
															{passwordVisible ? (
																<svg className="h-6 w-6 text-black dark:text-white"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth={2}
																	strokeLinecap="round"
																	strokeLinejoin="round">
																	<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
																	<circle cx="12" cy="12" r="3" /></svg>
															) : (
																<svg className="h-6 w-6 text-black dark:text-white"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth={2}
																	strokeLinecap="round"
																	strokeLinejoin="round">
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

												<div className="mt-4 text-sm flex justify-end font-sm text-gray-500 dark:text-gray-400 text-primary-700  dark:text-primary-500  ml-auto">

													{isForgotPassLoading
														? <CustomSpinner />
														: <button type="button" onClick={forgotPassword} className='dark:text-gray-200 hover:underline cursor-pointer'>
															{`Forgot Password?`}
														</button>
													}
												</div>


												<div className='mt-8 flex justify-between items-center flex-wrap gap-4 flex-col-reverse sm:flex-row'>
													<a
														id="navigatetosignup"
														href="/authentication/sign-up"
														className="text-sm shrink-0 ml-2 text-primary-700 hover:underline dark:text-gray-200"
													>
														{` Create an account`}
													</a>
													<Button
														id='signinsubmit'
														isProcessing={loading}
														type="submit"

														className='w-fit px-0 sm:px-4 xl:px-12 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="22" height="21" viewBox="0 0 38 37" fill="none">
															<path d="M25.6203 21.2026C25.9292 21.2026 26.2293 21.053 26.389 20.7875C26.6242 20.3982 26.4697 19.9092 26.0451 19.6936C24.8394 19.0839 23.5513 18.6222 22.2245 18.2876C25.6888 16.7062 28.079 13.4342 28.079 9.65217C28.079 4.329 23.3565 0 17.5494 0C11.7423 0 7.01973 4.329 7.01973 9.65217C7.01973 13.4326 9.40823 16.7015 12.8672 18.2844C9.97157 19.0132 7.31283 20.4063 5.13493 22.4027C1.82335 25.4383 0 29.4793 0 33.7826V36.1956C0 36.6396 0.393134 37 0.877497 37C1.36186 37 1.75499 36.6396 1.75499 36.1956V33.7826C1.75499 29.9088 3.39762 26.2732 6.3775 23.5401C9.35739 20.8069 13.3253 19.3043 17.5494 19.3043C20.2257 19.3043 22.8705 19.9269 25.1975 21.1029C25.3308 21.1704 25.4765 21.2026 25.6203 21.2026ZM8.77472 9.65217C8.77472 5.217 12.711 1.60867 17.5494 1.60867C22.3877 1.60867 26.3241 5.217 26.3241 9.65217C26.3241 14.0873 22.3877 17.6957 17.5494 17.6957C12.711 17.6956 8.77472 14.0873 8.77472 9.65217Z" fill="white" />
															<path d="M21.2585 36.3855C19.9011 25.8284 27.5516 21.0023 36.3948 21.5679" stroke="white" strokeLinecap="round" />
															<path d="M33.6328 18.5L36.9964 21.5833L33.6328 24.6667" stroke="white" strokeLinecap="round" />
														</svg>
														<span className="ml-2">Login</span>

													</Button>
												</div>
											</Form>
										)}
									</Formik>
								</div>
							</div>
						</div>
						<FooterBar />
					</div>


				))}
		</div>
	);
};

export default SignInUserPassword;