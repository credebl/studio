import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';

const EditModal = (props: {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSucess: (name: string) => void;
}) => {
	interface nameValue {
		name: string;
	}

	const saveName = (values: nameValue) => {
		props.onSucess(values.name);
		props.closeModal(false);
	};

	return (
		<Modal
			size="lg"
			show={props.openModal}
			onClose={() => props.closeModal(false)}
		>
			<Modal.Header>Edit Device</Modal.Header>
			<div className="relative p-2 text-center bg-white rounded-lg shadow dark:bg-gray-800 pr-5 pl-5">
				<Formik
					initialValues={{
						name: '',
					}}
					validationSchema={yup.object().shape({
						name: yup.string().required('Name is required').trim(),
					})}
					validateOnBlur
					validateOnChange
					enableReinitialize
					onSubmit={(values: nameValue) => saveName(values)}
				>
					{(formikHandlers): JSX.Element => (
						<Form
							className="mt-5 mb-5 space-y-6"
							onSubmit={formikHandlers.handleSubmit}
						>
							<div>
								<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									<Label htmlFor="email2" value="Name" className="float-left" />
									<span className="text-red-500 text-xs float-left ">*</span>
								</div>
								<Field
									id="editPasskeyDevice"
									name="name"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="name"
								/>
								{formikHandlers?.errors?.name &&
									formikHandlers?.touched?.name && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.name}
										</span>
									)}
							</div>

							<div className="flex justify-center items-center space-x-4 mb-4">
								<Button
									onClick={() => {
										formikHandlers.resetForm();
										props.closeModal(false);
									}}
									className="text-base font-medium text-center text-gray-900 bg-primary-700 hover:!bg-secondary-700 bg-white border border-gray-300 rounded-lg focus:ring-4 dark:focus:!ring-gray-400 focus:!ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:!bg-gray-600"
								>
									No, cancel
								</Button>
								<Button
									type="submit"
									className="text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									<div className="pr-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="25"
											height="25"
											fill="none"
											viewBox="0 0 25 25"
										>
											<path
												fill="#fff"
												d="M22.758 5.366a.833.833 0 0 0-1.366.95 10.826 10.826 0 0 1-5.647 16.518 10.838 10.838 0 0 1-12.909-5.438 10.825 10.825 0 0 1-1.17-4.89 10.893 10.893 0 0 1 7.742-10.38.835.835 0 1 0-.475-1.6 12.5 12.5 0 0 0-8.74 9.792 12.49 12.49 0 0 0 4.834 12.2A12.502 12.502 0 0 0 25 12.505a12.417 12.417 0 0 0-2.242-7.139Z"
											/>
											<path
												fill="#fff"
												d="M15.59 2.13a10.786 10.786 0 0 1 3.575 1.875.834.834 0 0 0 1.033-1.308A12.419 12.419 0 0 0 16.032.531a.835.835 0 0 0-.476 1.6h.034Zm-3.684-.69a.958.958 0 0 0 .275.174.784.784 0 0 0 .634 0 .966.966 0 0 0 .275-.175.83.83 0 0 0 .242-.591.875.875 0 0 0-.242-.592.833.833 0 0 0-.758-.241.542.542 0 0 0-.15.05.617.617 0 0 0-.15.075l-.126.1a.833.833 0 0 0-.175.275.833.833 0 0 0 0 .65c.043.1.102.193.175.274Zm-6.75 9.92a.95.95 0 0 0 0 1.35l4.767 4.798a.95.95 0 0 0 1.35 0l8.567-8.605a.969.969 0 1 0-1.35-1.391l-7.9 7.897-4.083-4.049a.959.959 0 0 0-1.35 0Z"
											/>
										</svg>
									</div>
									Submit
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

export default EditModal;
