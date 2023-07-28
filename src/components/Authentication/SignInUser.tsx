import * as yup from 'yup';

import type { AxiosError, AxiosResponse } from 'axios';
import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
	FormikHelpers,
	FormikProps,
	FormikValues,
} from 'formik';
import { UserSignInData, getUserProfile, loginUser, passwordEncryption, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { generateAuthenticationOption, verifyAuthentication } from '../../api/Fido';
import { useEffect, useState } from 'react';

import { Alert } from 'flowbite-react';
import astro from '@astrojs/react'
import { axiosPost } from '../../services/apiRequests';
import { pathRoutes } from '../../config/pathRoutes';
import { startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '../../supabase';

interface emailValue {
	email: string;
}

interface passwordValue {
	password: string;
}
const signUpSuccess = '?signup=true'

const SignInUser = () => {
	const [email, setEmail] = useState<emailValue | null>(null)
	const [fidoUserError, setFidoUserError] = useState("")
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [passwordflag, setPasswordFlag] = useState<boolean>(false)
	const [success, setSuccess] = useState<string | null>(null)
	const [failure, setFailur] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [fidoLoader, setFidoLoader] = useState<boolean>(false)

	useEffect(() => {
		if (signUpSuccess === window?.location?.search) {
			setSuccess('Your request has been successfully accepted.Please verify your email.')
		}
	}, [])

	const signInUser = async (values: passwordValue) => {

		const payload: UserSignInData = {
			email: email?.email,
			isPasskey: false,
			password: values.password
		}

		const formData = new FormData();
		formData.append('email', email?.email);
		formData.append('password', values.password);

		const details = {
			url: "/api/auth/signin",
			payload,
			config: { headers: { "Content-type": "application/json" } }
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email: email?.email,
			password: values.password
		})

		console.log(`SIGNIn:SUPA::`, data);

		console.log(`ERROR:SUPA::`, error);

		const response = await fetch("/api/auth/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data), // Your data to be sent in the request body
		})

		// const response = await axiosPost(details)

		if (response.redirected) {
			window.location.assign(response.url);
		}


		// const payload: UserSignInData = {
		// 	email: email?.email,
		// 	isPasskey: false,
		// 	password: passwordEncryption(values.password)
		// }
		// setLoading(true)
		// const loginRsp = await loginUser(payload)
		// const { data } = loginRsp as AxiosResponse

		// if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
		// 	await setToLocalStorage(storageKeys.TOKEN, data?.data?.access_token)
		// 	getUserDetails(data?.data?.access_token)
		// } else {
		// 	setLoading(false)
		// 	setFailur(loginRsp as string)
		// 	setTimeout(() => {
		// 		setFailur(null)
		// 	}, 3000)
		// }
	}

	const saveEmail = (values: emailValue) => {
		setEmail(values)
		setNextFlag(true)
	}
	const getUserDetails = async (access_token: string) => {
		const userDetails = await getUserProfile(access_token);
		const { data } = userDetails as AxiosResponse
		if (data?.data?.userOrgRoles?.length > 0) {
			const permissionArray: number | string[] = []
			data?.data?.userOrgRoles?.forEach((element: { orgRole: { name: string } }) => permissionArray.push(element?.orgRole?.name));
			await setToLocalStorage(storageKeys.PERMISSIONS, permissionArray)
			await setToLocalStorage(storageKeys.USER_PROFILE, data?.data)
			await setToLocalStorage(storageKeys.USER_EMAIL, data?.data?.email)

			window.location.href = pathRoutes.users.dashboard
		} else {
			setFailur(userDetails as string)
		}
		setLoading(false)
	}

	// ---------------------------FIOD Login-----------------------------------------//

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

	const verifyAuthenticationMethod = async (verifyAuthenticationObj: unknown, userData: { userName: string }): Promise<string | AxiosResponse> => {
		try {
			return await verifyAuthentication(verifyAuthenticationObj, userData);
		} catch (error) {
			setFidoLoader(false)
			console.error("Error while verifying authentication:", error);
			throw error;
		}
	};

	const authenticateWithPasskey = async (email: string): Promise<void> => {
		try {
			setFidoLoader(true)
			const generateAuthenticationResponse: any = await generateAuthenticationOption({ userName: email });
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
	};

	return (
		<div className="min-h-screen align-middle flex pb-[12vh]">
			<div className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900">
				<div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
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
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Sign In
						</h2>
						{nextflag && (<button
							onClick={() => {
								setNextFlag(false)
							}}
							type="button"
							className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ml-auto"
							style={{ transform: 'scaleX(-1)' }}
						>
							<svg
								className="w-4 h-4"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 14 10"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M1 5h12m0 0L9 1m4 4L9 9"
								/>
							</svg>
							<span className="sr-only">Icon description</span>
						</button>)}
					</div>

					{!nextflag && (<Formik
						initialValues={{
							email: ''
						}}
						validationSchema={yup.object().shape({
							email: yup
								.string()
								.required('Email is required')
								.email('Email is invalid')
								.trim()
						})}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={(values: emailValue) => saveEmail(values)}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="email2" value="Email" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="email"
										name="email"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="email"
									/>
									{
										(formikHandlers?.errors?.email && formikHandlers?.touched?.email) &&
										<span className="text-red-500 text-xs">{formikHandlers?.errors?.email}</span>
									}
								</div>
								<Button
									isProcessing={loading}
									type="submit"
									className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 float-right'
								>
									Next
								</Button>
								<div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-10">
									Not registered?
									&nbsp;<a
										href="/authentication/sign-up"
										className="text-primary-700 hover:underline dark:text-primary-500"
									>
										{` Create an account`}
									</a>
								</div>
							</Form>
						)}
					</Formik>)}

					{nextflag && (<Formik
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
						onSubmit={(values: passwordValue) => signInUser(values)}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								{passwordflag && (<div className="mt-2 space-y-6">
									<div>
										<div className="mb-2 block">
											<Label htmlFor="password" value="Password" />
											<span className='text-red-500 text-xs'>*</span>
										</div>

										<Field
											id="password"
											name="password"
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											type="password"
										/>
										{
											(formikHandlers?.errors?.password && formikHandlers?.touched?.password) &&
											<span className="text-red-500 text-xs">{formikHandlers?.errors?.password}</span>
										}
									</div>
									<Button
										isProcessing={loading}
										type="submit"
										className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 float-right'
									>
										Submit
									</Button>
								</div>)}
								<div className='justify-self-auto'>
									{/* <button type="button" className="text-white bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-4 focus:outline-none focus:ring-[#FF9119]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:hover:bg-[#FF9119]/80 dark:focus:ring-[#FF9119]/40 mr-2 mb-2">
										<svg className="w-4 h-4 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="bitcoin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.1-111 248-248 248S8 392.1 8 256 119 8 256 8s248 111 248 248zm-141.7-35.33c4.937-32.1-20.19-50.74-54.55-62.57l11.15-44.7-27.21-6.781-10.85 43.52c-7.154-1.783-14.5-3.464-21.8-5.13l10.93-43.81-27.2-6.781-11.15 44.69c-5.922-1.349-11.73-2.682-17.38-4.084l.031-.14-37.53-9.37-7.239 29.06s20.19 4.627 19.76 4.913c11.02 2.751 13.01 10.04 12.68 15.82l-12.7 50.92c.76 .194 1.744 .473 2.829 .907-.907-.225-1.876-.473-2.876-.713l-17.8 71.34c-1.349 3.348-4.767 8.37-12.47 6.464 .271 .395-19.78-4.937-19.78-4.937l-13.51 31.15 35.41 8.827c6.588 1.651 13.05 3.379 19.4 5.006l-11.26 45.21 27.18 6.781 11.15-44.73a1038 1038 0 0 0 21.69 5.627l-11.11 44.52 27.21 6.781 11.26-45.13c46.4 8.781 81.3 5.239 95.99-36.73 11.84-33.79-.589-53.28-25-65.99 17.78-4.098 31.17-15.79 34.75-39.95zm-62.18 87.18c-8.41 33.79-65.31 15.52-83.75 10.94l14.94-59.9c18.45 4.603 77.6 13.72 68.81 48.96zm8.417-87.67c-7.673 30.74-55.03 15.12-70.39 11.29l13.55-54.33c15.36 3.828 64.84 10.97 56.85 43.03z"></path></svg>
										Login using passkey
									</button> */}
									<Button
										isProcessing={''}
										onClick={() => {
											authenticateWithPasskey(email?.email)
										}}
										className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
									>
										Login using passkey
									</Button>
									<div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500 pt-4" onClick={() => {
										setPasswordFlag(true)
									}}>
										{`Password ?`}
									</div>
								</div>
								<div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-4">
									Not registered?
									&nbsp;<a
										href="/authentication/sign-up"
										className="text-primary-700 hover:underline dark:text-primary-500"
									>
										{` Create an account`}
									</a>
								</div>

							</Form>
						)}

					</Formik>)}
				</div>
			</div>
		</div>
	);
};

export default SignInUser;
