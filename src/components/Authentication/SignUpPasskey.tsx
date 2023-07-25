import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Checkbox, Label, TextInput } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
	FormikHelpers,
	FormikProps,
	FormikValues,
} from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import { UserSignUpData, checkUserExist, passwordEncryption, registerUser } from '../../api/Auth.js';
import { apiStatusCodes, passwordRegex } from '../../config/CommonConstant.js';
import { asset, url } from '../../lib/data.js';

import type { AxiosResponse } from 'axios';
import { useState } from 'react';

interface Values {
	firstName: string;
	lastName: string;
	password: string,
	confirmPassword: string
}

interface emailValue {
	email: string;
}

const SignUpUser = () => {

	const [loading, setLoading] = useState<boolean>(false)
	const [erroMsg, setErrMsg] = useState<string | null>(null)
	const [email, setEmail] = useState<string>('')
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [continuePasswordFlag, setContinuePasswordFlag] = useState<boolean>(false)

	const submit = async (values: Values) => {
		console.log("inside submit::::", values)
		const payload: UserSignUpData = {
			firstName: values.firstName,
			lastName: values.lastName,
			email: email,
			password: passwordEncryption(values.password)
		}
		setLoading(true)
		const userRsp = await registerUser(payload)
		const { data } = userRsp as AxiosResponse
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			window.location.href = '/authentication/sign-in?signup=true'
		} else {
			setErrMsg(userRsp as string)
		}
	}

	const saveEmail = async (values: emailValue) => {
		setLoading(true)
		const userRsp = await checkUserExist(values.email)
		const { data } = userRsp as AxiosResponse
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setEmail(values?.email)
			setNextFlag(true)
		} else {
			setErrMsg(userRsp as string)
		}
		setTimeout(() => {
			setErrMsg('')
		  }, 3000);
	}
	const createPasskey = () =>{
		console.log("____________iuiuhui----------", 793798)
	}
	return (
		<div className="min-h-screen align-middle flex pb-[12vh]">
			<div className="w-full flex flex-col items-center justify-center px-6 pt-8 mx-auto pt:mt-0 dark:bg-gray-900">
				<div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
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
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Create an account
					</h2>

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
									type=""
									className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 float-right'
								>
									Next
								</Button>
							</Form>
						)}
					</Formik>)}
					<Formik
						initialValues={{
							firstName: '',
							lastName: '',
							password: '',
							confirmPassword: ''
						}}
						validationSchema={yup.object().shape({
							firstName: yup
								.string()
								.min(2, 'First name must be at least 2 characters')
								.max(255, 'First name must be at most 255 characters')
								.required('First name is required')
								.trim(),
							lastName: yup
								.string()
								.min(2, 'Last name must be at least 2 characters')
								.max(255, 'Last name must be at most 255 characters')
								.required('Last name is required')
								.trim(),
							email: yup
								.string()
								.required('Email is required')
								.email('Email is invalid')
								.trim(),
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
								{nextflag && <div>
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
									{!continuePasswordFlag && <>
										<div className='pt-4'>
											<Button
											    onClick={createPasskey()}
												color='bg-primary-800'
												className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
											>
												Create Passkey
											</Button>
											<div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500 pt-2" onClick={() => {
												setContinuePasswordFlag(true)
											}}>
												{`Password ?`}
											</div>
										</div>
									</>}
									{continuePasswordFlag && <div>
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

										<div className='pt-2 pb-2'>
											<Button
												type="submit"
												isProcessing={loading}
												color='bg-primary-800'
												className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
											>
												Sign Up
											</Button>
										</div>
										<div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-primary-700 hover:underline dark:text-primary-500" onClick={() => {
											setContinuePasswordFlag(false)
										}}>
											{`Passkey ?`}
										</div>
									</div>}
								</div>}
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
		</div>
	);
};

export default SignUpUser;
