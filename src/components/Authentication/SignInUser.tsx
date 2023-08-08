import * as yup from 'yup';
import './global.css'
import { Button, Label } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
} from 'formik';
import { UserSignInData, getUserProfile, loginUser, passwordEncryption, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { generateAuthenticationOption, verifyAuthentication } from '../../api/Fido';
import { useEffect, useState } from 'react';

import { Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '../../supabase';

interface emailValue {
	email: string | null;
}

interface passwordValue {
	password: string;
}
const signUpSuccessPassword = '?signup=true?fidoFlag=false'
const signUpSuccessPasskey = '?signup=true?fidoFlag=true'

const SignInUser = () => {
	const [email, setEmail] = useState<emailValue | null>(null)
	const [fidoUserError, setFidoUserError] = useState("")
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [success, setSuccess] = useState<string | null>(null)
	const [failure, setFailur] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [currentComponent, setCurrentComponent] = useState<string>('email');
	const [isEmailValid, setIsEmailValid] = useState(false);
	const [isPasskeySuccess, setIsPasskeySuccess] = useState(false);


	useEffect(() => {
		if (signUpSuccessPassword === window?.location?.search) {

			setSuccess('Congratulations!! 🎉 You have successfully registered on CREDEBL 🚀')
		}
		else if (signUpSuccessPasskey === window?.location?.search) {
			setIsPasskeySuccess(true);
		}
		setTimeout(() => {
			setSuccess('')
		}, 5000);
	}, [])

	const signInUser = async (values: passwordValue) => {
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

		const { data, error } = await supabase.auth.signInWithPassword({
			email: email?.email as string,
			password: values.password,
		})

		console.log(`SignIn: ERROR::`, error);

		const response = await fetch('/api/auth/signin', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (response.redirected) {
			window.location.assign(response.url);
		}


	}

	const saveEmail = (values: emailValue) => {
		setEmail(values)
		setNextFlag(true)
		setCurrentComponent('password');
	}
	const redirectLandingPage = () => {
		window.location.href = '/'
	}

	return (
		<div className=''>
			{currentComponent === 'email' && isPasskeySuccess ? ( <RegistrationSuccess /> ) 
			: currentComponent === 'password' ? (
                <SignInUser2 email={email?.email as string} />
            ) : (

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
							<div className="absolute bottom-6 left-6">
								&copy; 2019 - {new Date().getFullYear()} —
								<a className="hover:underline" target="_blank"
								>CREDEBL</a> | All rights reserved.
							</div>

						</div>
						<div className="flex items-center justify-center p-6 sm:p-12 md:w-2/5 shadow-xl shadow-blue-700">
							<div className="w-full" style={{ height: '700px' }}>
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



								<div className='mt-28 mb-28'>

									<div className="flex justify-center mb-4 text-center text-primary-700 text-blue-600 font-inter text-4xl font-bold leading-10 ">
										Login
									</div>
									<div className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
										Please enter your email id for login
									</div>

								</div>

								<Formik
									initialValues={{
										email: ''
									}}
									validationSchema={yup.object().shape({
										email: yup
											.string()
											.required('Email is required')
											.email('Email is invalid')
											.matches(/(\.[a-zA-Z]{2,})$/, 'Email domain is invalid')
											.trim()
									})}
									validateOnBlur
									validateOnChange
									enableReinitialize
									onSubmit={(values: emailValue) => saveEmail(values)}
								>

									{(formikHandlers): JSX.Element => (
										<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
											<div className="text-primary-700 font-inter text-base font-medium leading-5 mt-20 mb-20">


												<div className="block mb-2 text-sm font-medium  dark:text-white">
													<Label className="text-primary-700" htmlFor="email2" value="Your Email" />
													<span className='text-red-500 text-xs'>*</span>
												</div>

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

												)}

											</div>
											<div className="flex justify-between mt-20">
												<button
													className="block w-2/5 py-2 px-4 rounded-md border text-center font-medium leading-5 border-blue-600 bg-white flex items-center justify-center"
													onClick={redirectLandingPage}
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 20" fill="none">
														<path d="M0.163115 9.23695C0.000879288 9.60157 -0.0415287 10.0028 0.0412483 10.3898C0.124025 10.7769 0.328272 11.1324 0.628147 11.4114L9.20011 19.391C9.3978 19.5815 9.63427 19.7335 9.89572 19.838C10.1572 19.9426 10.4384 19.9976 10.7229 19.9999C11.0075 20.0022 11.2897 19.9518 11.553 19.8514C11.8164 19.7511 12.0557 19.603 12.2569 19.4157C12.4581 19.2284 12.6172 19.0057 12.725 18.7605C12.8327 18.5153 12.8869 18.2526 12.8845 17.9878C12.882 17.7229 12.8229 17.4611 12.7106 17.2177C12.5982 16.9743 12.435 16.7542 12.2303 16.5702L7.31428 11.9939L27.857 11.9939C28.4254 11.9939 28.9704 11.7837 29.3723 11.4096C29.7742 11.0355 30 10.5281 30 9.999C30 9.46992 29.7742 8.96251 29.3723 8.5884C28.9704 8.21428 28.4254 8.00411 27.857 8.00411L7.31428 8.00411L12.2282 3.4298C12.4328 3.24578 12.5961 3.02565 12.7084 2.78227C12.8207 2.53888 12.8798 2.27711 12.8823 2.01223C12.8848 1.74735 12.8306 1.48466 12.7228 1.2395C12.6151 0.994335 12.4559 0.771599 12.2547 0.584293C12.0535 0.396986 11.8142 0.248857 11.5509 0.148552C11.2875 0.0482464 11.0053 -0.00222778 10.7208 7.43866e-05C10.4362 0.00237656 10.155 0.0574093 9.89358 0.161961C9.63212 0.26651 9.39566 0.418484 9.19797 0.609016L0.625999 8.58861C0.427465 8.77433 0.270176 8.99464 0.163115 9.23695Z" fill="#1F4EAD" />
													</svg>

													<span className="ml-2 text-primary-700">Back</span>

												</button>


												<Button
													id='signinnext'
													isProcessing={loading}
													type="submit"

													className='w-2/5 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
													onClick={() => setCurrentComponent('email')}
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 20" fill="none">
														<path d="M29.8369 10.763C29.9991 10.3984 30.0415 9.99721 29.9588 9.61015C29.876 9.22309 29.6717 8.86759 29.3719 8.58861L20.7999 0.609018C20.6022 0.418485 20.3657 0.26651 20.1043 0.161959C19.8428 0.0574089 19.5616 0.00237707 19.2771 7.53215e-05C18.9925 -0.00222642 18.7103 0.0482475 18.447 0.148553C18.1836 0.248858 17.9443 0.396985 17.7431 0.584292C17.5419 0.771598 17.3828 0.994332 17.275 1.2395C17.1673 1.48466 17.1131 1.74735 17.1155 2.01223C17.118 2.27711 17.1771 2.53888 17.2894 2.78227C17.4018 3.02566 17.565 3.24578 17.7697 3.4298L22.6857 8.0061H2.14299C1.57464 8.0061 1.02956 8.21628 0.627668 8.59039C0.225779 8.96451 0 9.47192 0 10.001C0 10.5301 0.225779 11.0375 0.627668 11.4116C1.02956 11.7857 1.57464 11.9959 2.14299 11.9959H22.6857L17.7718 16.5702C17.5672 16.7542 17.4039 16.9743 17.2916 17.2177C17.1793 17.4611 17.1202 17.7229 17.1177 17.9878C17.1152 18.2526 17.1694 18.5153 17.2772 18.7605C17.3849 19.0057 17.5441 19.2284 17.7453 19.4157C17.9465 19.603 18.1858 19.7511 18.4491 19.8514C18.7125 19.9518 18.9947 20.0022 19.2792 19.9999C19.5638 19.9976 19.845 19.9426 20.1064 19.838C20.3679 19.7335 20.6043 19.5815 20.802 19.391L29.374 11.4114C29.5725 11.2257 29.7298 11.0054 29.8369 10.763Z" fill="white" />
													</svg>
													<span className="ml-2">Next</span>

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
				</div> )

			}

		</div>
	);
};

export default SignInUser;
