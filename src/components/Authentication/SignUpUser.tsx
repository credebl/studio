import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Label } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import {
	Field,
	Form,
	Formik
} from 'formik';
import { checkUserExist, sendVerificationMail, setToLocalStorage } from '../../api/Auth.ts';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant.js';
import { useEffect, useState } from 'react';
import SignUpUserName from './SignUpUserName'
import FooterBar from './FooterBar.js';
import NavBar from './NavBar.js';
import { validEmail } from '../../utils/TextTransform.js';
import { envConfig } from '../../config/envConfig.ts';

interface emailValue {
	email: string;
}

const SignUpUser = () => {

	const [loading, setLoading] = useState<boolean>(false)
	const [verifyLoader, setVerifyLoader] = useState<boolean>(false)
	const [erroMsg, setErrMsg] = useState<string | null>(null)
	const [verificationSuccess, setVerificationSuccess] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [enableName, setEnableName] = useState<boolean>(false)
	const [emailAutoFill, setEmailAutoFill] = useState<string>('')
	const [isEmailValid, setIsEmailValid] = useState(false);

	useEffect(() => {
		const searchParam = new URLSearchParams(window?.location?.search);
		const userEmail = searchParam.get('email');
		if (userEmail) {
			setEmailAutoFill(validEmail(userEmail))
		}
	}, [])

	const VerifyMail = async (email: string) => {
		try {
			const payload = {
				email: email,
				clientId: envConfig.PLATFORM_DATA.clientId,
				clientSecret: envConfig.PLATFORM_DATA.clientSecrete			
			}
			setVerifyLoader(true)
			const userRsp = await sendVerificationMail(payload);
			const { data } = userRsp as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {

				setVerificationSuccess(data?.message)
				setVerifyLoader(false)
			} else {
				setErrMsg(userRsp as string);
				setVerifyLoader(false)
			}
			return data;
		} catch (error) {
			setErrMsg('An error occurred. Please try again later.');
			setVerifyLoader(false)
		}
	};

	const ValidateEmail = async (values: emailValue) => {
		setLoading(true)
		const userRsp = await checkUserExist(values?.email)
		const { data } = userRsp as AxiosResponse
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			if (data?.data?.isRegistrationCompleted === false && data.data.isEmailVerified === false) {
				setEmail(values?.email)
				await VerifyMail(values?.email)
			}
			else if (data.data.isEmailVerified === true && data?.data?.isRegistrationCompleted !== true) {
				setEmail(values?.email)
				await setToLocalStorage(storageKeys.USER_EMAIL, values?.email)
				setNextFlag(true)
				setEnableName(true)
			}
		} else {
			setErrMsg(userRsp as string)
		}
	}

	const redirectLandingPage = () => {
		window.location.href = '/'
	}
	return (
		<div>
			{!nextflag &&

				<div className="flex flex-col min-h-screen">

					<NavBar />


					<div className="flex flex-1 flex-col md:flex-row">
						<div className="md:block hidden md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
							<div className='flex justify-center'>
								<img
									className='max-h-100/10rem'
									src="/images/signin.svg"
									alt="img" />
							</div>
						</div>

						<div className="md:w-2/5 w-full p-10 flex">

							<div className="w-full">
								{
									(verificationSuccess || erroMsg) &&
									<Alert
										color={verificationSuccess ? "success" : "failure"}
										onDismiss={() => {
											setErrMsg(null);
											setVerificationSuccess('');
										}}
									>
										<span>
											<p>
												{verificationSuccess || erroMsg}
											</p>
										</span>
									</Alert>
								}

								<div className='flex mt-2 xl:mt-8 space-x-4'>

									<button className='flex mt-2' onClick={redirectLandingPage} >
										<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 37 20" fill="none">
											<path d="M0.201172 9.23695C0.00108337 9.60157 -0.0512199 10.0028 0.050869 10.3898C0.152962 10.7769 0.404865 11.1324 0.774712 11.4114L11.3468 19.391C11.5906 19.5815 11.8823 19.7335 12.2047 19.838C12.5272 19.9426 12.874 19.9976 13.2249 19.9999C13.5759 20.0022 13.9239 19.9518 14.2487 19.8514C14.5735 19.7511 14.8686 19.603 15.1168 19.4157C15.365 19.2284 15.5612 19.0057 15.6941 18.7605C15.827 18.5153 15.8939 18.2526 15.8908 17.9878C15.8878 17.7229 15.8149 17.4611 15.6763 17.2177C15.5378 16.9743 15.3365 16.7542 15.084 16.5702L9.02094 11.9939L34.357 11.9939C35.0579 11.9939 35.7302 11.7837 36.2259 11.4096C36.7215 11.0355 37 10.5281 37 9.999C37 9.46992 36.7215 8.96251 36.2259 8.5884C35.7302 8.21428 35.0579 8.00411 34.357 8.00411L9.02094 8.00411L15.0814 3.4298C15.3338 3.24578 15.5352 3.02565 15.6737 2.78227C15.8122 2.53888 15.8851 2.27711 15.8882 2.01223C15.8912 1.74735 15.8244 1.48466 15.6915 1.2395C15.5586 0.994335 15.3623 0.771599 15.1142 0.584293C14.866 0.396986 14.5709 0.248857 14.2461 0.148552C13.9213 0.0482464 13.5732 -0.00222778 13.2223 7.43866e-05C12.8714 0.00237656 12.5245 0.0574093 12.2021 0.161961C11.8796 0.26651 11.588 0.418484 11.3442 0.609016L0.772064 8.58861C0.527206 8.77433 0.333214 8.99464 0.201172 9.23695Z" fill="#1F4EAD" />
										</svg>
									</button>

									<div className="w-full flex flex-col items-center justify-center ">

										<h2 className="text-center text-primary-700 dark:text-gray-200 font-inter text-3xl font-bold leading-10">
											Create account
										</h2>

										<p className="text-gray-500 font-inter text-base font-medium leading-5 mt-2">
											Enter your Email
										</p>

									</div>

								</div>

								<div className="block md:hidden bg-blue-500 bg-opacity-10 mt-4" >

									<img
										src="/images/signin.svg"
										alt="img" />
								</div>

								<Formik
									initialValues={{
										email: emailAutoFill ? emailAutoFill : ''
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
									onSubmit={(values: emailValue) => ValidateEmail(values)}
								>
									{(formikHandlers): JSX.Element => (

										<Form className='mt-16 space-y-6' onSubmit={formikHandlers.handleSubmit}>
											<input type="hidden" name="_csrf" value={new Date().getTime()} />
											<div className="text-primary-700 font-inter text-base font-medium leading-5 mb-20">

												<div className="block mb-2 text-sm font-medium  dark:text-white">
													<Label className="text-primary-700 dark:text-gray-200" htmlFor="email2" value="Your Email " />
													<span className='text-red-500 text-xs'>*</span>
												</div>

												<div className="w-full flex items-center bg-gray-200 dark:bg-gray-800 px-4 py-3 text-gray-700 dark:text-white text-sm border rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-600">

													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="16"
														viewBox="0 0 30 24"
														fill="none"
														className="mr-2"
													>
														<path
															d="M27 0H3C1.35 0 0.015 1.35 0.015 3L0 21C0 22.65 1.35 24 3 24H27C28.65 24 30 22.65 30 21V3C30 1.35 28.65 0 27 0ZM27 6L15 13.5L3 6V3L15 10.5L27 3V6Z"
															fill="#1F4EAD"
														/>
													</svg>

													<Field id='Signupemail'
														name='email'
														className="truncate outline-none flex-grow bg-transparent focus:outline-none border-none focus:border-none focus:ring-0"
														placeholder="name@company.com" />

												</div>

												{!isEmailValid && formikHandlers.touched.email && (
													<span className="text-red-500 text-xs absolute mt-1">
														{formikHandlers.errors.email}
													</span>

												)}
											</div>
											<div >
												<div className='flex justify-between items-center flex-wrap'>
													<a
														id='navigatetosignup'
														href="/authentication/sign-in"
														className="text-sm text-primary-700 dark:text-gray-200 hover:underline"
													>
														{`Login here`}
													</a>
													<Button
														id='signupemailnextbutton'
														isProcessing={verifyLoader}
														type="submit"
														className='w-fit px-0 sm:px-4 xl:px-12 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
													>

														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 20" fill="none">
															<path d="M29.8369 10.763C29.9991 10.3984 30.0415 9.99721 29.9588 9.61015C29.876 9.22309 29.6717 8.86759 29.3719 8.58861L20.7999 0.609018C20.6022 0.418485 20.3657 0.26651 20.1043 0.161959C19.8428 0.0574089 19.5616 0.00237707 19.2771 7.53215e-05C18.9925 -0.00222642 18.7103 0.0482475 18.447 0.148553C18.1836 0.248858 17.9443 0.396985 17.7431 0.584292C17.5419 0.771598 17.3828 0.994332 17.275 1.2395C17.1673 1.48466 17.1131 1.74735 17.1155 2.01223C17.118 2.27711 17.1771 2.53888 17.2894 2.78227C17.4018 3.02566 17.565 3.24578 17.7697 3.4298L22.6857 8.0061H2.14299C1.57464 8.0061 1.02956 8.21628 0.627668 8.59039C0.225779 8.96451 0 9.47192 0 10.001C0 10.5301 0.225779 11.0375 0.627668 11.4116C1.02956 11.7857 1.57464 11.9959 2.14299 11.9959H22.6857L17.7718 16.5702C17.5672 16.7542 17.4039 16.9743 17.2916 17.2177C17.1793 17.4611 17.1202 17.7229 17.1177 17.9878C17.1152 18.2526 17.1694 18.5153 17.2772 18.7605C17.3849 19.0057 17.5441 19.2284 17.7453 19.4157C17.9465 19.603 18.1858 19.7511 18.4491 19.8514C18.7125 19.9518 18.9947 20.0022 19.2792 19.9999C19.5638 19.9976 19.845 19.9426 20.1064 19.838C20.3679 19.7335 20.6043 19.5815 20.802 19.391L29.374 11.4114C29.5725 11.2257 29.7298 11.0054 29.8369 10.763Z" fill="white" />
														</svg>
														<span className="ml-2">Next</span>

													</Button>
												</div>
											</div>
										</Form>
									)}
								</Formik>
							</div>
						</div>

					</div>

					<FooterBar />
				</div>
			}
			{
				nextflag && (
					<SignUpUserName />
				)
			}
		</div>
	);
};

export default SignUpUser;
