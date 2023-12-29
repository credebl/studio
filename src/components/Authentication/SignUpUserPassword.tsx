import 'react-toastify/dist/ReactToastify.css';

import * as yup from 'yup';

import { Alert, Button, Label } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import { Field, Form, Formik } from 'formik';
import {
	addPasswordDetails,
	getFromLocalStorage,
	passwordEncryption,
} from '../../api/Auth.js';
import {
	apiStatusCodes,
	passwordRegex,
	storageKeys,
} from '../../config/CommonConstant.js';
import { useState } from 'react';

import SignUpUserPasskey from './SignUpUserPasskey';
import NavBar from './NavBar.js';
import FooterBar from './FooterBar.js';
import PasswordSuggestionBox from './PasswordSuggestionBox.js';
import { PassInvisible, PassVisible, SignUpArrow } from './Svg.js';

interface passwordValues {
	email: string;
	password: string;
	confirmPassword: string;
}

const SignUpUserPassword = ({
	email,
	firstName,
	lastName,
}: {
	email: string,
	firstName: string;
	lastName: string;
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [erroMsg, setErrMsg] = useState<string | null>(null);
	const [verificationSuccess] = useState<string>('');
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [showSignUpUser, setShowSignUpUser] = useState(false);
	const [showSuggestion, setShowSuggestion] = useState(false);

	const submit = async (passwordDetails: passwordValues, fidoFlag: boolean) => {
		const userEmail = await getFromLocalStorage(storageKeys.USER_EMAIL);
		const payload = {
			email: userEmail,
			password: passwordEncryption(passwordDetails?.password),
			isPasskey: false,
			firstName,
			lastName,
		};

		setLoading(true);

		const userRsp = await addPasswordDetails(payload);
		const { data } = userRsp as AxiosResponse;
		setLoading(false);
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			window.location.href = `/authentication/sign-in?signup=true&email=${userEmail}&fidoFlag=${fidoFlag}&method=password`

		} else {
			setErrMsg(userRsp as string);
		}
		return userRsp;
	};

	const handleBackButtonClick = () => {
		setShowSignUpUser(!showSignUpUser);
	};

	const initialValues = {
		email: email,
		firstName: '',
		lastName: '',
		password: '',
		confirmPassword: '',
	};

	const schemaValidation = yup.object().shape({
		password: yup
			.string()
			.required('Password is required')
			.matches(passwordRegex, ' '),
		confirmPassword: yup
			.string()
			.required('Confirm Password is required')
			.oneOf([yup.ref('password')], 'Passwords must match'),
	})

	return (
		<div>
			{showSignUpUser ? (
				<SignUpUserPasskey email={email} firstName={firstName} lastName={lastName} />
			) : (
				<div className="flex flex-col min-h-screen">
					<NavBar />
					<div className="flex flex-1 flex-col md:flex-row">
						<div className="hidden md:block md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
							<div className="flex justify-center">
								<img
									className="max-h-100/10rem"
									src="/images/signin.svg"
									alt="img"
								/>
							</div>
						</div>

						<div className="md:w-2/5 w-full p-10 flex">
							<div className="w-full">
								{(verificationSuccess || erroMsg) && (
									<Alert
										color={verificationSuccess ? 'success' : 'failure'}
										onDismiss={() => setErrMsg(null)}
									>
										<span>
											<p>{verificationSuccess || erroMsg}</p>
										</span>
									</Alert>
								)}

								<div className='flex mt-2 xl:mt-8'>
									<button className="flex mt-2" onClick={handleBackButtonClick}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="26"
											height="24"
											viewBox="0 0 37 20"
											fill="none"
										>
											<path
												d="M0.201172 9.23695C0.00108337 9.60157 -0.0512199 10.0028 0.050869 10.3898C0.152962 10.7769 0.404865 11.1324 0.774712 11.4114L11.3468 19.391C11.5906 19.5815 11.8823 19.7335 12.2047 19.838C12.5272 19.9426 12.874 19.9976 13.2249 19.9999C13.5759 20.0022 13.9239 19.9518 14.2487 19.8514C14.5735 19.7511 14.8686 19.603 15.1168 19.4157C15.365 19.2284 15.5612 19.0057 15.6941 18.7605C15.827 18.5153 15.8939 18.2526 15.8908 17.9878C15.8878 17.7229 15.8149 17.4611 15.6763 17.2177C15.5378 16.9743 15.3365 16.7542 15.084 16.5702L9.02094 11.9939L34.357 11.9939C35.0579 11.9939 35.7302 11.7837 36.2259 11.4096C36.7215 11.0355 37 10.5281 37 9.999C37 9.46992 36.7215 8.96251 36.2259 8.5884C35.7302 8.21428 35.0579 8.00411 34.357 8.00411L9.02094 8.00411L15.0814 3.4298C15.3338 3.24578 15.5352 3.02565 15.6737 2.78227C15.8122 2.53888 15.8851 2.27711 15.8882 2.01223C15.8912 1.74735 15.8244 1.48466 15.6915 1.2395C15.5586 0.994335 15.3623 0.771599 15.1142 0.584293C14.866 0.396986 14.5709 0.248857 14.2461 0.148552C13.9213 0.0482464 13.5732 -0.00222778 13.2223 7.43866e-05C12.8714 0.00237656 12.5245 0.0574093 12.2021 0.161961C11.8796 0.26651 11.588 0.418484 11.3442 0.609016L0.772064 8.58861C0.527206 8.77433 0.333214 8.99464 0.201172 9.23695Z"
												fill="#1F4EAD"
											/>
										</svg>
									</button>

									<div className="w-full flex flex-col items-center justify-center ">
										<h2 className="text-primary-700 dark:text-gray-200 font-inter text-3xl font-bold leading-10">
											Create password
										</h2>

										<p className="text-gray-500 font-inter text-base font-medium leading-5 mt-2">
											Please create password
										</p>
									</div>
								</div>

								<div className="md:hidden block bg-blue-500 bg-opacity-10 mt-4">
									<img src="/images/signin.svg" alt="img" />
								</div>

								<Formik
									initialValues={initialValues}
									validationSchema={schemaValidation}
									validateOnBlur
									validateOnChange
									enableReinitialize
									onSubmit={(values: passwordValues) => {
										submit(values, false);
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
															className="text-primary-700 dark:text-gray-200"
															htmlFor="password"
															value="Password "
														/>
														<span className="text-red-500 text-xs">*</span>
													</div>
													<div className="relative">
														<Field
															id="signuppassword"
															name="password"
															placeholder="Please enter password"
															className="truncate w-full bg-gray-200 pl-4 !pr-10 py-2 text-gray-700 dark:text-white dark:bg-gray-800 text-sm rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
																setPasswordVisible(
																	(prevVisible) => !prevVisible,
																)
															}
															className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 dark:text-white hover:text-gray-800 dark:hover:text-white"
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
												<div className="text-primary-700 font-inter text-base font-medium leading-5 mt-8">
													<div className="block mb-2 text-sm font-medium  dark:text-white">
														<Label
															className="text-primary-700 dark:text-gray-200"
															htmlFor="confirmPassword"
															value="Confirm Password "
														/>
														<span className="text-red-500 text-xs">*</span>
													</div>
													<div className="relative">
														<Field
															id="signupconfirmpassword"
															name="confirmPassword"
															placeholder="Please re-enter password"
															className="truncate w-full bg-gray-200 pl-4 !pr-10 py-2 text-gray-700 dark:text-white dark:bg-gray-800 text-sm rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
															type={
																confirmPasswordVisible ? 'text' : 'password'
															}
															onBlurCapture={(e: any): void => {
																setShowSuggestion(false);
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
															<span className="text-red-500 text-xs absolute mt-1">
																{formikHandlers?.errors?.confirmPassword}
															</span>
														)}
												</div>
												<div className='flex justify-between items-center flex-wrap gap-4 sm:flex-row flex-col-reverse mt-8'>
													<a
														id="navigatetosignup"
														href="/authentication/sign-in"
														className="text-sm shrink-0 ml-2 text-primary-700 hover:underline dark:text-gray-200"
													>
														{`Login here`}
													</a>
													<Button
														id="signupbutton"
														type="submit"
														isProcessing={loading}
														className="w-fit px-12 sm:px-4 xl:px-12 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
													>
														<SignUpArrow />
														<span className="ml-2">Sign Up</span>
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
			)}
		</div>
	);
};

export default SignUpUserPassword;
