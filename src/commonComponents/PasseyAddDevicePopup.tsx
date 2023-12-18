import * as yup from 'yup';
import { Button, Label, Modal, Alert } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
} from 'formik';
import { useState } from 'react';
import type { AxiosResponse } from 'axios';
import { addPasskeyUserDetails, getFromLocalStorage, passwordEncryption } from '../api/Auth';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { getSupabaseClient } from '../supabase';
import passkeyAddDevice from '../assets/passkeyAddDevice.svg';
import React from 'react';

interface PasswordValue {
	Password: string;
}

const PasskeyAddDevice = (props: {
	setOpenModel(arg0: boolean): unknown; openModal: boolean; closeModal: (flag: boolean) => void; registerWithPasskey: (flag: boolean) => Promise<void>
}
) => {
	const [fidoUserError, setFidoUserError] = useState<string | null>(null)
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [success, setSuccess] = useState<string | null>(null)
	const [passwordVisible, setPasswordVisible] = useState(false);

	const savePassword = async (values: PasswordValue) => {
		try {
			const storedEmail = await getFromLocalStorage(storageKeys.LOGIN_USER_EMAIL);
			const { error } = await getSupabaseClient().auth.signInWithPassword({
				email: storedEmail,
				password: values.Password,
			});
			if (error) {
				setFidoUserError(error?.message)

			} else {
					const payload = {
						password: passwordEncryption(values.Password)
					}
					const passkeyUserDetailsResp = await addPasskeyUserDetails(payload, storedEmail)
					const { data } = passkeyUserDetailsResp as AxiosResponse
					if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
						setSuccess('User details updated successfully')
						setNextFlag(true)
					} else {
						setFidoUserError(passkeyUserDetailsResp as string)
					}
				
			}
		} catch (error) {
			console.error('An unexpected error occurred:', error.message);
			setFidoUserError('An unexpected error occurred')
		}
	};

	return (
		<Modal show={props.openModal} onClose={() => {
			props.setOpenModel(false)
		}
		}>
			<Modal.Header>Create Passkey</Modal.Header>
			<Modal.Body>
				<div className="">
					{
						(success || fidoUserError) &&
						<div className='pb-2'>
							<Alert
								color={success ? "success" : "failure"}
								onDismiss={() => {
									setSuccess(null)
									setFidoUserError(null)
								}
								}
							>
								<span>
									<p>
										{success || fidoUserError}
									</p>
								</span>
							</Alert>
						</div>
					}
					{!nextflag && (<div className='flex'>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Enter Password
						</h2>
					</div>)}

					{!nextflag && (<Formik
						initialValues={{
							Password: ''
						}}
						validationSchema={yup.object().shape({
							Password: yup
								.string()
								.required('Password is required')
						})}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={(values: PasswordValue) => savePassword(values)}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="Password2" value="Password" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<div className='relative'>
										<Field
											id="signinPassword"
											name="Password"
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 !pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											type={passwordVisible ? 'text' : 'password'}
										/>
										<button
											type="button"
											id="checkuserpassword"
											onClick={() => setPasswordVisible((prevVisible) => !prevVisible)}
											className="bg-transparent ml-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
										>
											{passwordVisible ? (
												<svg className="h-6 w-6 text-black dark:text-gray-300"
												    id="visible"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round">
													<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
													<circle cx="12" cy="12" r="3" /></svg>
											) : (
												<svg className="h-6 w-6 text-black dark:text-gray-300"
													viewBox="0 0 24 24"
													fill="none"
													id="invisible"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round">
													<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
													<line x1="1" y1="1" x2="23" y2="23" /></svg>)}
										</button>
									</div>
									{
										(formikHandlers?.errors?.Password && formikHandlers?.touched?.Password) &&
										<span className="text-red-500 text-xs">{formikHandlers?.errors?.Password}</span>
									}
								</div>
								<Button
									id='signinnext'
									// isProcessing={loading}
									type="submit"
									className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 float-right'
								>
									Next
								</Button>
							</Form>
						)}
					</Formik>)}

					{nextflag && (
						<div className=''>
							<div className='justify-center flex w-full'>
								<img
									src={passkeyAddDevice}
									className='justify-items-center'
									alt="SVG Image"
									style={{
										width: '350px',
										height: '350px'
									}}
								/>
							</div>
							<div className='justify-center flex'>
								<Button
									id="loginwithpasskey"
									isProcessing={''}
									onClick={() => props.registerWithPasskey(true)}
									className="text-base hover:!bg-primary-800 font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									Create Passkey
								</Button>
							</div>
						</div>)}
				</div>
			</Modal.Body>
		</Modal >
	);
};

export default PasskeyAddDevice;
