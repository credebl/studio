import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Label } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import { passwordRegex } from '../../config/CommonConstant.js';
import { useState } from 'react';

import { getSupabaseClient } from '../../supabase';
import { pathRoutes } from '../../config/pathRoutes.js';
import PasswordSuggestionBox from './PasswordSuggestionBox.js';
import FooterBar from './FooterBar.js';
import NavBar from './NavBar.js';
import { PassInvisible, PassVisible, SignUpArrow } from './Svg.js';
import React from 'react';

interface passwordValues {
	password: string;
	confirmPassword: string;
}

const ResetPassword = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [erroMsg, setErrMsg] = useState<string | null>(null);
	const [message] = useState<string>('');
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [showSuggestion, setShowSuggestion] = useState(false);

	const submit = async (passwordDetails: passwordValues) => {
		setLoading(true);

		const { error } = await getSupabaseClient().auth.updateUser({
			password: passwordDetails?.password,
		});

		setLoading(false);
		if (!error) {
			window.location.href = `${pathRoutes.auth.sinIn}?isPasswordSet=true`;
		} else {
			setErrMsg(error.message);
		}
	};

	return (
		<>
			<div className="flex flex-col min-h-screen">
				<NavBar />
				<div className="flex flex-1 flex-col md:flex-row">
					<div className="md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
						<div className="flex justify-center">
							<img
								className="hidden sm:block"
								src="/images/signin.svg"
								alt="img"
							/>
						</div>
					</div>
					<div className="flex md:w-2/5 w-full p-10">
						<div className="w-full">
							{(message || erroMsg) && (
								<Alert
									color={message ? 'success' : 'failure'}
									onDismiss={() => setErrMsg(null)}
								>
									<span>
										<p>{message || erroMsg}</p>
									</span>
								</Alert>
							)}

							<div className="flex lg:mt-8 w-full flex-col">
								<div className="flex justify-center text-center text-primary-700 text-blue-600 font-inter text-3xl font-bold leading-10 ">
									Reset Password
								</div>
								<div className="text-gray-500 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
									Please set new password
								</div>
							</div>

							<div className="lg:hidden sm:block md:hidden sm:block bg-blue-500 bg-opacity-10 mt-4">
								<img src="/images/signin.svg" alt="img" />
							</div>

							<Formik
								initialValues={{
									firstName: '',
									lastName: '',
									password: '',
									confirmPassword: '',
								}}
								validationSchema={yup.object().shape({
									password: yup
										.string()
										.required('Password is required')
										.matches(passwordRegex, ' '),
									confirmPassword: yup
										.string()
										.required('Confirm Password is required')
										.oneOf([yup.ref('password')], 'Passwords must match'),
								})}
								validateOnBlur
								validateOnChange
								enableReinitialize
								onSubmit={(values: passwordValues) => {
									submit(values);
								}}
							>
								{(formikHandlers): JSX.Element => (
									<Form
										className="mt-12 space-y-6"
										onSubmit={formikHandlers.handleSubmit}
									>
										<div>
											<div className="text-primary-700 font-inter text-base font-medium leading-5">
												<div className="block mb-2 text-sm font-medium  dark:text-white">
													<Label
														className="text-primary-700"
														htmlFor="password"
														value="New Password"
													/>
													<span className="text-red-500 text-xs">*</span>
												</div>
												<div className="relative">
													<Field
														id="resetpassword"
														name="password"
														placeholder="Please enter password"
														className="truncate w-full bg-gray-200 px-4 py-2 text-gray-700 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
														type={passwordVisible ? 'text' : 'password'}
														onFocus={(): void => {
															setShowSuggestion(true);
														}}
														onBlurCapture={(e: any): void => {
															setShowSuggestion(false);
															formikHandlers.handleBlur(e);
														}}
													/>
													<button
														type="button"
														onClick={() =>
															setPasswordVisible((prevVisible) => !prevVisible)
														}
														className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
													>
														{passwordVisible ? (
															<PassInvisible />
														) : (
															<PassVisible />
														)}
													</button>
												</div>
												{showSuggestion &&
													formikHandlers?.errors?.password &&
													formikHandlers.values.password && (
														<PasswordSuggestionBox
															show={true}
															value={formikHandlers?.values?.password}
														/>
													)}

												{formikHandlers?.errors?.password &&
													formikHandlers?.touched?.password && (
														<span className="text-red-500 text-xs absolute mt-1">
															{formikHandlers?.errors?.password}
														</span>
													)}
											</div>

											<div className="text-primary-700 font-inter text-base font-medium leading-5 mt-8 mb-6">
												<div className="block mb-2 text-sm font-medium  dark:text-white">
													<Label
														className="text-primary-700"
														htmlFor="confirmPassword"
														value="Confirm New Password"
													/>
													<span className="text-red-500 text-xs">*</span>
												</div>
												<div className="relative">
													<Field
														id="resetconfirmpassword"
														name="confirmPassword"
														placeholder="Please re-enter password"
														className="truncate w-full bg-gray-200 px-4 py-2 text-gray-900 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
														type={confirmPasswordVisible ? 'text' : 'password'}
														onBlur={(e: any): void => {
															formikHandlers.handleBlur(e);
														}}
													/>

													<button
														type="button"
														onClick={() =>
															setConfirmPasswordVisible(
																(prevVisible) => !prevVisible,
															)
														}
														className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-white"
													>
														{confirmPasswordVisible ? (
															<PassInvisible />
														) : (
															<PassVisible />
														)}
													</button>
												</div>
												{formikHandlers?.errors?.confirmPassword &&
													formikHandlers?.touched?.confirmPassword && (
														<span className="text-red-500 absolute mt-1 text-xs">
															{formikHandlers?.errors?.confirmPassword}
														</span>
													)}
											</div>

											<div className="flex mt-12">
												<Button
													id="signupbutton"
													type="submit"
													isProcessing={loading}
													className="w-full font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
												>
													<SignUpArrow />
													<span className="ml-2">Submit</span>
												</Button>
											</div>
										</div>
									</Form>
								)}
							</Formik>
						</div>
					</div>
				</div>
			</div>
			<FooterBar />
		</>
	);
};

export default ResetPassword;
