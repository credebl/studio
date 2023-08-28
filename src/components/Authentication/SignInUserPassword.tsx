import './global.css'

import * as yup from 'yup';

import { Button, Label } from 'flowbite-react';
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
import SignInUserPasskey from './SignInUserPasskey';
import { getSupabaseClient } from '../../supabase';

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
			setTimeout(() => {
				setFailure(null)
			})
		}
	}

	const handleBackButtonClick = () => {
		setShowSignInUser2(!showSignInUser2);

	};

	const forgotPassword = async () => {

		setLoading(true);

		var base_url = window.location.origin;

		const { data, error } = await getSupabaseClient().auth.resetPasswordForEmail(email
		, {
			redirectTo: `${base_url}/reset-password`,
		});
		setLoading(false);

		if(!error){
			setSuccess('Reset password link has been sent to you on mail');
		} else {
			setFailure('Unable to send reset link for the password')
		}

	}


	return (
		<div className='h-full'>

			{showSignInUser2 ? (
				<SignInUserPasskey email={email as string} />
			) : (
				currentComponent === 'email' && (
					<div className="bg-white flex-shrink-0">
						<div className="flex flex-col md:flex-row">
							<div className="flex justify-center px-50 py-50 md:w-3/5 bg-blue-500 bg-opacity-10" >
								<img
									className='hidden sm:block'
									src="/images/signInPassword.svg"
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


									<div className='mt-28 mb-20'>

										<div className="flex justify-center mb-4 text-center text-primary-700 text-blue-600 font-inter text-4xl font-bold leading-10 ">
											Login
										</div>
										<div className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
											Please enter password for login
										</div>

									</div>

									<div className="lg:hidden sm:block bg-blue-500 bg-opacity-10" >

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
											<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
												<div className="text-primary-700 font-inter text-base font-medium leading-5 mt-20">


													<div className="block mb-2 text-sm font-medium  dark:text-white">
														<Label className="text-primary-700" htmlFor="email2" value="Your Password" />
														<span className='text-red-500 text-xs'>*</span>
													</div>

													<div className="relative">
														<Field id='signinpassword'
															name='password'
															className="w-full bg-gray-200 px-4 py-2 text-gray-900 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
															placeholder="Please enter your password"
															type={passwordVisible ? 'text' : 'password'} />

														<button
															type="button"
															onClick={() => setPasswordVisible((prevVisible) => !prevVisible)}
															className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
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
														<span className="text-red-500 text-xs">{formikHandlers?.errors?.password}</span>
													}

												</div>

													<div className="text-sm flex justify-end font-sm text-gray-500 dark:text-gray-400 text-primary-700  dark:text-primary-500  ml-auto">
														<span onClick={forgotPassword} className='hover:underline cursor-pointer'>

															{`Forgot Password?`}
														</span>
													</div>


												<div className="flex justify-between">

													<button
														className="w-2/5 py-2 px-4 rounded-md text-center font-medium leading-5 border-blue-600 flex items-center justify-center hover:bg-secondary-700 bg-transparent ring-2 text-black rounded-lg text-sm"
														onClick={handleBackButtonClick}
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 20" fill="none">
															<path d="M0.163115 9.23695C0.000879288 9.60157 -0.0415287 10.0028 0.0412483 10.3898C0.124025 10.7769 0.328272 11.1324 0.628147 11.4114L9.20011 19.391C9.3978 19.5815 9.63427 19.7335 9.89572 19.838C10.1572 19.9426 10.4384 19.9976 10.7229 19.9999C11.0075 20.0022 11.2897 19.9518 11.553 19.8514C11.8164 19.7511 12.0557 19.603 12.2569 19.4157C12.4581 19.2284 12.6172 19.0057 12.725 18.7605C12.8327 18.5153 12.8869 18.2526 12.8845 17.9878C12.882 17.7229 12.8229 17.4611 12.7106 17.2177C12.5982 16.9743 12.435 16.7542 12.2303 16.5702L7.31428 11.9939L27.857 11.9939C28.4254 11.9939 28.9704 11.7837 29.3723 11.4096C29.7742 11.0355 30 10.5281 30 9.999C30 9.46992 29.7742 8.96251 29.3723 8.5884C28.9704 8.21428 28.4254 8.00411 27.857 8.00411L7.31428 8.00411L12.2282 3.4298C12.4328 3.24578 12.5961 3.02565 12.7084 2.78227C12.8207 2.53888 12.8798 2.27711 12.8823 2.01223C12.8848 1.74735 12.8306 1.48466 12.7228 1.2395C12.6151 0.994335 12.4559 0.771599 12.2547 0.584293C12.0535 0.396986 11.8142 0.248857 11.5509 0.148552C11.2875 0.0482464 11.0053 -0.00222778 10.7208 7.43866e-05C10.4362 0.00237656 10.155 0.0574093 9.89358 0.161961C9.63212 0.26651 9.39566 0.418484 9.19797 0.609016L0.625999 8.58861C0.427465 8.77433 0.270176 8.99464 0.163115 9.23695Z" fill="#1F4EAD" />
														</svg>

														<span className="ml-2 text-primary-700">Back</span>

													</button>

													<Button
														id='signinsubmit'
														isProcessing={loading}
														type="submit"
														onClick={() => {
															if (formikHandlers.errors.password) {
																signInUser(formikHandlers.values);
															}
														}}

														className='w-2/5 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="22" height="21" viewBox="0 0 38 37" fill="none">
															<path d="M25.6203 21.2026C25.9292 21.2026 26.2293 21.053 26.389 20.7875C26.6242 20.3982 26.4697 19.9092 26.0451 19.6936C24.8394 19.0839 23.5513 18.6222 22.2245 18.2876C25.6888 16.7062 28.079 13.4342 28.079 9.65217C28.079 4.329 23.3565 0 17.5494 0C11.7423 0 7.01973 4.329 7.01973 9.65217C7.01973 13.4326 9.40823 16.7015 12.8672 18.2844C9.97157 19.0132 7.31283 20.4063 5.13493 22.4027C1.82335 25.4383 0 29.4793 0 33.7826V36.1956C0 36.6396 0.393134 37 0.877497 37C1.36186 37 1.75499 36.6396 1.75499 36.1956V33.7826C1.75499 29.9088 3.39762 26.2732 6.3775 23.5401C9.35739 20.8069 13.3253 19.3043 17.5494 19.3043C20.2257 19.3043 22.8705 19.9269 25.1975 21.1029C25.3308 21.1704 25.4765 21.2026 25.6203 21.2026ZM8.77472 9.65217C8.77472 5.217 12.711 1.60867 17.5494 1.60867C22.3877 1.60867 26.3241 5.217 26.3241 9.65217C26.3241 14.0873 22.3877 17.6957 17.5494 17.6957C12.711 17.6956 8.77472 14.0873 8.77472 9.65217Z" fill="white" />
															<path d="M21.2585 36.3855C19.9011 25.8284 27.5516 21.0023 36.3948 21.5679" stroke="white" stroke-linecap="round" />
															<path d="M33.6328 18.5L36.9964 21.5833L33.6328 24.6667" stroke="white" stroke-linecap="round" />
														</svg>
														<span className="ml-2">Login</span>

													</Button>
												</div>


												<div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-6 flex items-center justify-center">
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
					</div>))
			}

		</div>
	);
};

export default SignInUserPassword;