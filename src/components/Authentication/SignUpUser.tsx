import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Label } from 'flowbite-react';
import {
	Field,
	Form,
	Formik
} from 'formik';
import { UserSignUpData, passwordEncryption, registerUser } from '../../api/Auth.js';
import { apiStatusCodes, passwordRegex } from '../../config/CommonConstant.js';

import type { AxiosResponse } from 'axios';
import { pathRoutes } from '../../config/pathRoutes.js';
import { supabase } from '../../supabase.js';
import { useState } from 'react';

interface Values {
	firstName: string;
	lastName: string;
	email: string;
	password: string,
	confirmPassword: string
}

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
	const [fidoError, setFidoError] = useState("")

	const submit = async (values: Values) => {

		const { data, error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
		})

		console.log(`SINUP:SUPA::`, data);
		console.log(`ERROR:SUPA::`, error);
		

		//   const payload: UserSignUpData ={
		// 	firstName: values.firstName,
		// 	lastName: values.lastName,
		// 	email: values.email,
		// 	password: passwordEncryption(values.password)
		//   }
		//    setLoading(true)
		//    const userRsp = await registerUser(payload)
		//    const { data } = userRsp as AxiosResponse
		//    setLoading(false)
		//    if(data?.statusCode === apiStatusCodes.API_STATUS_CREATED){
		// 	window.location.href = `${pathRoutes.auth.sinIn}?signup=true`
		//    }else{
		//      setErrMsg(userRsp as string)
		//    }
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
								<div className='pb-1'>
								<Button
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
							email: '',
							password: '',
							confirmPassword: ''
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
												id="firstName"
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
												id="lastName"
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
												type="submit"
												isProcessing={""}
												color='bg-primary-800'
												className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
											>
												Submit
											</Button>
											{/* {!continuePasswordFlag && <> */}
											{/* <div className='float-right'> */}
											<div className="text-bold font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500 cursor-pointer ml-auto pt-3" onClick={() => {
												setContinuePasswordFlag(true)
												setEnableName(false)
												setUserDetails({
													firstName:'',
													lastName:''
												})
											}}>
												{`Skip`}
											</div>
											{/* </div> */}
											{/* </>} */}
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
								.matches(passwordRegex, 'customPasswordMsg'),
							confirmPassword: yup
								.string()
								.required('Confirm Password is required')
								.oneOf([yup.ref('password')], 'Passwords must match'),
						})}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={(
							values: Values,
						) => { submit(values) }}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="firstName" value="First name" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="firstName"
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
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="lastName"
										name="lastName"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									/>
									{
										(formikHandlers?.errors?.lastName && formikHandlers?.touched?.lastName) &&
										<span className="text-red-500 text-xs">{formikHandlers?.errors?.lastName}</span>
									}
								</div>
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
								<div>
									<div className="mb-2 block">
										<Label htmlFor="password" value="Password" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500" onClick={() => {
										setContinuePasswordFlag(false)
									}}>
										{`Passkey ?`}
									</div> */}

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
								<div>
									<div className="mb-2 block">
										<Label htmlFor="confirmPassword" value="Confirm password" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="confirmPassword"
										name="confirmPassword"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="password"
									/>
									{
										(formikHandlers?.errors?.confirmPassword && formikHandlers?.touched?.confirmPassword) &&
										<span className="text-red-500 text-xs">{formikHandlers?.errors?.confirmPassword}</span>
									}
								</div>
								{
									erroMsg &&
									<Alert
										color="failure"
										onDismiss={() => setErrMsg(null)}
									>
										<span>
											<p>
												{erroMsg}
											</p>
										</span>
									</Alert>
								}
								<Button
									type="submit"
									isProcessing={loading}
									color='bg-primary-800'
									className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
								>
									Sign Up
								</Button>
							</Form>
						)}
					</Formik>
					<div className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
