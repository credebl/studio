import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Checkbox, Label, TextInput } from 'flowbite-react';
import type { AxiosError, AxiosResponse } from 'axios';
import {
	Field,
	Form,
	Formik
} from 'formik';
import type { IdeviceBody, RegistrationOptionInterface } from '../Profile/interfaces/index.js';
import { addDeviceDetails, generateRegistrationOption, verifyRegistration } from '../../api/Fido.js';
import { addPasswordDetails, checkUserExist, passwordEncryption, sendVerificationMail } from '../../api/Auth.js';
import { apiStatusCodes, passwordRegex } from '../../config/CommonConstant.js';
import { asset, url } from '../../lib/data.js';
import { useEffect, useState } from 'react';

import secureRandomPassword from 'secure-random-password';
import { startRegistration } from '@simplewebauthn/browser';
import { supabase } from '../../supabase.js';

const SignUpUser = () => {

	const [loading, setLoading] = useState<boolean>(false)
	const [verifyLoader, setVerifyLoader] = useState<boolean>(false)
	const [erroMsg, setErrMsg] = useState<string | null>(null)
	const [verificationSuccess, setVerificationSuccess] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [enableName, setEnableName] = useState<boolean>(false)
	const [continuePasswordFlag, setContinuePasswordFlag] = useState<boolean>(false)
	const [enablePasswordField, setEnablePasswordField] = useState<boolean>(false)
	const [userDetails, setUserDetails] = useState<nameValues>({
		firstName: '',
		lastName: ''
	})
	const [addSuccess, setAddSuccess] = useState<string | null>(null)
	const [addfailure, setAddFailur] = useState<string | null>(null)
	const [emailAutoFill, setEmailAutoFill] = useState<string>('')
	const [fidoError, setFidoError] = useState("")
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);


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
		const payload = {
			password: passwordEncryption(passwordDetails?.password),
			isPasskey: false,
			firstName: userDetails.firstName,
			lastName: userDetails.lastName
		}
		setLoading(true)

		const userRsp = await addPasswordDetails(payload, email)
		const { data } = userRsp as AxiosResponse
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			window.location.href = `/authentication/sign-in?signup=true?fidoFlag=${fidoFlag}`
		} else {
			setErrMsg(userRsp as string)
		}
		return userRsp;
	}

	const VerifyMail = async (email: string) => {
		try {
			const payload = {
				email: email
			}
			setVerifyLoader(true)
			const userRsp = await sendVerificationMail(payload);
			const { data } = userRsp as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

				setVerificationSuccess(data?.message)
				setVerifyLoader(false)
			} else {
				setErrMsg(userRsp as string);
				setVerifyLoader(false)
			}
			setTimeout(() => {
				setVerificationSuccess('')
				setErrMsg('')
			}, 5000);
			return data;
		} catch (error) {
			setErrMsg('An error occurred. Please try again later.');
			setVerifyLoader(false)
		}
	};



	//Save email
	const ValidateEmail = async (values: emailValue) => {
		setLoading(true)
		const userRsp = await checkUserExist(values?.email)
		const { data } = userRsp as AxiosResponse
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			if (data.data === 'New User') {
				setEmail(values?.email)
				await VerifyMail(values?.email)
			}
			else if (data.data.isEmailVerified === true && data?.data?.isKeycloak !== true) {
				setEmail(values?.email)
				setNextFlag(true)
				setEnableName(true)
			}
		} else {
			setErrMsg(userRsp as string)
		}
		setTimeout(() => {
			setErrMsg('')
		}, 5000);
	}



	const createPasskey = async () => {

		registerWithPasskey(true)

	}


	const registerWithPasskey = async (flag: boolean): Promise<void> => {
		try {
			const RegistrationOption: RegistrationOptionInterface = {
				userName: email,
				deviceFlag: flag
			}
			// Generate Registration Option
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

				await verifyRegistrationMethod(verifyRegistrationObj, email);
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

	const setNameValue = (values: nameValues) => {
		setUserDetails({
			firstName: values.firstName,
			lastName: values.lastName
		})
		setContinuePasswordFlag(true)
		setEnableName(false)
	}

	return (
		<div className="min-h-screen align-middle flex pb-[12vh]">
			<div className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900">
				<div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
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
					<div className='flex'>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Create an account
						</h2>
						{/*  */}
						{nextflag && <button
							onClick={() => {
								setNextFlag(false)
								setEnableName(false)
								setEnablePasswordField(false)
								setContinuePasswordFlag(false)
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
						</button>}
					</div>
					{!nextflag && (<Formik
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
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="email2" value="Email" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="Signupemail"
										name="email"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="email"
									/>
									{
										(formikHandlers?.errors?.email && formikHandlers?.touched?.email) &&
										<span className="text-red-500 text-xs">{formikHandlers?.errors?.email}</span>
									}
								</div>
								<div className='pb-1'>
									<Button
										id='signupemailnextbutton'
										isProcessing={verifyLoader}
										type=""
										className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 float-right'
									>
										Next
									</Button>
								</div>
							</Form>
						)}
					</Formik>)}
					{enableName && <Formik
						initialValues={{
							firstName: '',
							lastName: '',
						}}
						validationSchema={yup.object().shape({
							firstName: yup
								.string()
								.min(2, 'First name must be at least 2 characters')
								.max(255, 'First name must be at most 255 characters')
								.trim(),
							lastName: yup
								.string()
								.min(2, 'Last name must be at least 2 characters')
								.max(255, 'Last name must be at most 255 characters')
								.trim()
						})}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={(
							values: nameValues,
						) => {
							setNameValue(values)
						}}
					>
						{(formikHandlers): JSX.Element => {
							if (JSON.stringify(userDetails) !== JSON.stringify(formikHandlers.values))
								setUserDetails({
									firstName: formikHandlers.values.firstName,
									lastName: formikHandlers.values.lastName
								})
							return (
								<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
									{enableName && <div>
										<div>
											<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
												<Label htmlFor="firstName" value="First name" />
											</div>
											<Field
												id="signupfirstname"
												name="firstName"
												className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											/>
											{
												(formikHandlers?.errors?.firstName && formikHandlers?.touched?.firstName) &&
												<span className="text-red-500 text-xs">{formikHandlers?.errors?.firstName}</span>
											}
										</div>
										<div>
											<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
												<Label htmlFor="lastName" value="Last name" />
											</div>
											<Field
												id="signuplastname"
												name="lastName"
												className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											/>
											{
												(formikHandlers?.errors?.lastName && formikHandlers?.touched?.lastName) &&
												<span className="text-red-500 text-xs">{formikHandlers?.errors?.lastName}</span>
											}
										</div>
										<div className='flex pt-4'>
											<Button
												id='signupuserdetailsnextbutton'
												type="submit"
												isProcessing={""}
												color='bg-primary-800'
												className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
											>
												Next
											</Button>
											<div className="text-bold font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500 cursor-pointer ml-auto pt-3" onClick={() => {
												setContinuePasswordFlag(true)
												setEnableName(false)
												setUserDetails({
													firstName: '',
													lastName: ''
												})
											}}>
												{`Skip`}
											</div>
										</div>
									</div>}
								</Form>
							)
						}}
					</Formik>}
					{continuePasswordFlag && <Formik
						initialValues={{
							password: '',
							confirmPassword: ''
						}}
						validationSchema={yup.object().shape({
							password: yup
								.string()
								.required('Password is required')
								.matches(passwordRegex, 'Passwords must contain at least 8 characters, including uppercase, lowercase, numbers and special character'),
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
							submit(values, false)
						}}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								{enablePasswordField && <div>
									<div>
										<div className="mb-2 block">
											<Label htmlFor="password" value="Password" />
											<span className='text-red-500 text-xs'>*</span>
										</div>
										<div className="relative">

											<Field
												id="signuppassword"
												name="password"
												className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
												type={passwordVisible ? 'text' : 'password'}
											/>
											<button
												type="button"
												onClick={() => setPasswordVisible((prevVisible) => !prevVisible)}
												className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
											>
												{passwordVisible ? (
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
											(formikHandlers?.errors?.password && formikHandlers?.touched?.password) &&
											<span className="text-red-500 text-xs">{formikHandlers?.errors?.password}</span>
										}
									</div>
									<div>
										<div className="mb-2 block">
											<Label htmlFor="confirmPassword" value="Confirm password" />
											<span className='text-red-500 text-xs'>*</span>
										</div>
										<div className="relative">

											<Field
												id="signupconfirmpassword"
												name="confirmPassword"
												className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
												type={confirmPasswordVisible ? 'text' : 'password'}
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
								</div>}
								{nextflag && <>
									<div className='pt-4'>
										<div className='flex'>
											<Button
												id='signupcreatepasskey'
												onClick={() => {
													createPasskey()
												}}
												color='bg-primary-800'
												className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
											>
												Create passkey
											</Button>
											{enablePasswordField &&
												<Button
													id='signupbutton'
													type="submit"
													isProcessing={loading}
													color='bg-primary-800'
													className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ml-auto'
												>
													Sign Up
												</Button>
											}
										</div>
										<div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500 pt-2 cursor-pointer" onClick={() => {
											setEnablePasswordField(true)
										}}>
											{`Set password ?`}
										</div>
									</div>
								</>}
							</Form>
						)}
					</Formik>}

					<div className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-6">
						Already have an account?
						<a
							href="/authentication/sign-in"
							className="text-primary-700 hover:underline dark:text-primary-500"
						>
							{` Sign in here.`}
						</a>
					</div>
				</div>
			</div>
		</div >
	);
};

export default SignUpUser;
