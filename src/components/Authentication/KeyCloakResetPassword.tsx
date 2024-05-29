import * as yup from 'yup';
import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import { apiStatusCodes, passwordRegex } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import { useState } from 'react';
import { passwordEncryption, resetPasswordKeyCloak } from '../../api/Auth';
import { PassInvisible, PassVisible } from './Svg.js';
import { pathRoutes } from '../../config/pathRoutes';
import type { IPassword, IProps, IValues } from './interfaces';
import React from 'react';
import { envConfig } from '../../config/envConfig';
import CustomSpinner from '../CustomSpinner/index.js';

const KeyClockResetPassword = (props: IProps) => {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [passwordVisibility, setPasswordVisibility] = useState<IPassword>({
		currentPassword: false,
		newPassword: false,
		confirmPassword: false,
	});

	const submitUpdatePassword = async (values: IValues) => {
		setLoading(true);
		const entityData = {
			email: props.email,
			oldPassword: passwordEncryption(values.currentPassword),
			newPassword: passwordEncryption(values.newPassword),
		};
		try {
			const response = await resetPasswordKeyCloak(entityData);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setSuccess(data.message);
				setLoading(false);
				window.location.href= pathRoutes.auth.sinIn
			} else {
				setError(response as string);
				setLoading(false);
			}
		} catch (error) {
			console.error('An error occurred:', error);
			setLoading(false);
		}
	};

	const handleToggleVisibility = (passwordType: keyof IPassword) => {
		setPasswordVisibility((prevVisibility) => ({
			...prevVisibility,
			[passwordType]: !prevVisibility[passwordType],
		}));
	};

	return (
		<Modal
			size={'3xl'}
			show={props.openModel}
			onClose={() => {
				props.setOpenModal(false);
			}}
		>
			<Modal.Header>
				<p>Reset Password</p>
				<p className="text-sm font-normal">
					Choose a new password for your account
				</p>
				<p className="text-yellow-600 text-sm font-normal">
				{envConfig.PLATFORM_DATA.name} has an update for your seamless experience. We request you to
					please reset your password for it.
				</p>
			</Modal.Header>
			<Modal.Body>
						<AlertComponent
							message={ success ?? error}
							type={success ? 'success' : 'failure'}
							onAlertClose={() => {
								setError(null);
								setSuccess(null);
							}}
						/>
				<Formik
					initialValues={{
						currentPassword: '',
						newPassword: '',
						confirmPassword: '',
					}}
					validationSchema={yup.object().shape({
						currentPassword: yup
							.string()
							.required('Current Password is required')
							.min(8, 'Password must be at least 8 characters')
							.matches(passwordRegex, 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
						newPassword: yup
							.string()
							.required('New Password is required')
							.min(8, 'Password must be at least 8 characters')
							.matches(passwordRegex, 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
						confirmPassword: yup
							.string()
							.required('Confirm Password is required')
							.oneOf([yup.ref('newPassword')], 'Passwords must match')
							.min(8, 'Password must be at least 8 characters'),
					})}
					validateOnBlur
					validateOnChange
					enableReinitialize
					onSubmit={(values: IValues) => submitUpdatePassword(values)}
				>
					{(formikHandlers): JSX.Element => (
						<Form className="space-y-6" onSubmit={formikHandlers.handleSubmit}>
							<div className="text-primary-700 font-inter text-base font-medium leading-5">
								<div className="block mb-2 text-sm font-medium  dark:text-white">
									<Label
										className="text-primary-700 dark:text-gray-200"
										htmlFor="currentPassword"
										value="Current Password "
									/>
									<span className="text-red-500 text-xs">*</span>
								</div>
								<div className="relative">
									<Field
										id="currentPassword"
										name="currentPassword"
										placeholder="Please enter password"
										className="truncate w-full bg-gray-200 pl-4 !pr-10 py-2 text-gray-700 dark:text-white dark:bg-gray-800 text-sm rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
										type={
											passwordVisibility.currentPassword ? 'text' : 'password'
										}
									/>
									<button
										type="button"
										onClick={() => handleToggleVisibility('currentPassword')}
										className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 dark:text-white hover:text-gray-800 dark:hover:text-white"
									>
										{passwordVisibility.currentPassword ? (
											<PassInvisible />
										) : (
											<PassVisible />
										)}
									</button>
								</div>
								{formikHandlers?.errors?.currentPassword &&
									typeof formikHandlers?.errors?.currentPassword === 'string' &&
									formikHandlers?.touched?.currentPassword && (
										<div className="text-red-500 text-xs mt-1">
											{formikHandlers?.errors?.currentPassword}
										</div>
									)}
							</div>
							<div className="text-primary-700 font-inter text-base font-medium leading-5">
								<div className="block mb-2 text-sm font-medium  dark:text-white">
									<Label
										className="text-primary-700 dark:text-gray-200"
										htmlFor="newPassword"
										value="New Password "
									/>
									<span className="text-red-500 text-xs">*</span>
								</div>
								<div className="relative">
									<Field
										id="newPassword"
										name="newPassword"
										placeholder="Please enter password"
										className="truncate w-full bg-gray-200 pl-4 !pr-10 py-2 text-gray-700 dark:text-white dark:bg-gray-800 text-sm rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
										type={passwordVisibility.newPassword ? 'text' : 'password'}
									/>
									<button
										type="button"
										onClick={() => handleToggleVisibility('newPassword')}
										className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 dark:text-white hover:text-gray-800 dark:hover:text-white"
									>
										{passwordVisibility.newPassword ? (
											<PassInvisible />
										) : (
											<PassVisible />
										)}
									</button>
								</div>
								{formikHandlers?.errors?.newPassword &&
									typeof formikHandlers?.errors?.newPassword === 'string' &&
									formikHandlers?.touched?.newPassword && (
										<span className="text-red-500 text-xs mt-1">
											{formikHandlers?.errors?.newPassword}
										</span>
									)}
							</div>
							<div className="text-primary-700 font-inter text-base font-medium leading-5">
								<div className="block mb-2 text-sm font-medium  dark:text-white">
									<Label
										className="text-primary-700 dark:text-gray-200"
										htmlFor="confirmPassword"
										value="Confirm Password"
									/>
									<span className="text-red-500 text-xs">*</span>
								</div>
								<div className="relative">
									<Field
										id="confirmPassword"
										name="confirmPassword"
										placeholder="Please enter password"
										className="truncate w-full bg-gray-200 pl-4 !pr-10 py-2 text-gray-700 dark:text-white dark:bg-gray-800 text-sm rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
										type={
											passwordVisibility.confirmPassword ? 'text' : 'password'
										}
									/>
									<button
										type="button"
										onClick={() => handleToggleVisibility('confirmPassword')}
										className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 dark:text-white hover:text-gray-800 dark:hover:text-white"
									>
										{passwordVisibility.confirmPassword ? (
											<PassInvisible />
										) : (
											<PassVisible />
										)}
									</button>
								</div>
								{formikHandlers?.errors?.confirmPassword &&
									typeof formikHandlers?.errors?.confirmPassword === 'string' &&
									formikHandlers?.touched?.confirmPassword && (
										<span className="text-red-500 text-xs absolute mt-1">
											{formikHandlers?.errors?.confirmPassword}
										</span>
									)}
							</div>
							<div className="w-full">
								<Button
									type="submit"
									isProcessing={loading}
									disabled={loading}
									className="w-full mt-12 text-base py-1 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									{
											loading ? <CustomSpinner /> : ""
										}
									Reset Password
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			</Modal.Body>
		</Modal>
	);
};

export default KeyClockResetPassword;
