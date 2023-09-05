import * as yup from 'yup';

import { Button, Label, Modal } from 'flowbite-react';
import {
	Field,
	Form,
	Formik,
} from 'formik';
// import { UserSignInData, getUserProfile, loginUser, passwordEncryption, setToLocalStorage } from '../../api/Auth';
import { useEffect, useState } from 'react';

import { Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { startAuthentication } from '@simplewebauthn/browser';
import React from 'react';
import { addPasskeyUserDetails, getFromLocalStorage, passwordEncryption } from '../api/Auth';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { getSupabaseClient } from '../supabase';

// interface PasswordValue {
// 	Password: string;
// }

interface passwordValue {
	Password: string;
}
const signUpSuccessPassword = '?signup=true?fidoFlag=false'
const signUpSuccessPasskey = '?signup=true?fidoFlag=true'

const PasskeyAddDevice = (props: {
	setOpenModel(arg0: boolean): unknown; openModal: boolean; closeModal: (flag: boolean) => void; registerWithPasskey: (flag: boolean) => Promise<void>
}
) => {
	const [fidoUserError, setFidoUserError] = useState<string | null>(null)
	const [nextflag, setNextFlag] = useState<boolean>(false)
	const [success, setSuccess] = useState<string | null>(null)
	const [failure, setFailur] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [addfailure, setAddFailur] = useState<string | null>(null)

	const savePassword = async (values: passwordValue) => {
		try {
			const storedEmail = await getFromLocalStorage(storageKeys.LOGIN_USER_EMAIL);
			const { data, error } = await getSupabaseClient().auth.signInWithPassword({
				email: storedEmail,
				password: values.Password,
			});
			if (error) {
				setFidoUserError(error?.message)

			} else {
				if (data) {
					const payload = {
						password: passwordEncryption(values.Password)
					}
					const passkeyUserDetailsResp = await addPasskeyUserDetails(payload, storedEmail)
					const { data } = passkeyUserDetailsResp as AxiosResponse
					if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
						setSuccess('User details Updated successfully')
						setNextFlag(true)
					} else {
						setAddFailur(passkeyUserDetailsResp as string)
					}
				}
			}
		} catch (error) {
			console.error('An unexpected error occurred:', error.message);
		}
	};

	return (
		<Modal show={props.openModal} onClose={() => {
			props.setOpenModel(false)
		}
		}>
			<Modal.Header>Add Passkey</Modal.Header>
			<Modal.Body>
				<div className="">
					{
						(success || failure || fidoUserError) &&
						<div className='pb-2'>
							<Alert
								color={success ? "success" : "failure"}
								onDismiss={() => {
									console.log("65789087656789765", 56778657897)
									setSuccess(null)
									setFidoUserError(null)
								}


								}
							>
								<span>
									<p>
										{success || failure || fidoUserError}
									</p>
								</span>
							</Alert>
						</div>
					}
					<div className='flex'>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Enter Password
						</h2>
					</div>

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
						onSubmit={(values: passwordValue) => savePassword(values)}
					>
						{(formikHandlers): JSX.Element => (
							<Form className="mt-8 space-y-6" onSubmit={formikHandlers.handleSubmit}>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="Password2" value="Password" />
										<span className='text-red-500 text-xs'>*</span>
									</div>
									<Field
										id="signinPassword"
										name="Password"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="Password"
									/>
									{
										(formikHandlers?.errors?.Password && formikHandlers?.touched?.Password) &&
										<span className="text-red-500 text-xs">{formikHandlers?.errors?.Password}</span>
									}
								</div>
								<Button
									id='signinnext'
									isProcessing={loading}
									type="submit"
									className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 float-right'
								>
									Next
								</Button>
							</Form>
						)}
					</Formik>)}

					{nextflag && (<Button
						id='loginwithpasskey'
						isProcessing={''}
						onClick={() => props.registerWithPasskey(true)}
						className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
					>
						Add Passkey
					</Button>)}
				</div>
			</Modal.Body>
		</Modal >
	);
};

export default PasskeyAddDevice;