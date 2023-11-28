import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import React, { useState } from 'react';
import type { Organisation } from './interfaces';

interface EditOrgdetailsModalProps {
	openModal: boolean;
	onClose: () => void;
}

interface OrgNameValue {
	orgName: string;
}
const DeleteOrgModal = (props: EditOrgdetailsModalProps) => {
	const [orgData, setOrgData] = useState<Organisation | null>(null);
	const [confirmationModal, setConfirmationModal] = useState(false);
	const [secondModal, setSecondModal] = useState(false);

	const handleDeleteClick = () => {
		setConfirmationModal(true);
	};

	const handleConfirmationClose = () => {
		setConfirmationModal(false);
	};
	const handleDeleteConfirmation = () => {
		setConfirmationModal(false);
		setSecondModal(true);
		props.onClose();
	};

	const handleCloseSecondModal = () => {
		setSecondModal(false);
	};

	const handleDeleteSecondConfirmation = () => {
		setSecondModal(false);
		props.onClose();
	};
	return (
		<div>
			<Modal
				show={props.openModal}
				onClose={() => {
					props.onClose();
				}}
			>
				<Modal.Header>Delete Organization</Modal.Header>
				<Modal.Body>
					<div className="text-center text-3xl font-montserrat text-gray-700">
						Privi Tech
					</div>

					<div className="flex justify-center mt-10">
						<Button
							className="w-full mx-10 text-lg font-montserrat text-red-600 hover:text-white border-orange-600 bg-transparent hover:!bg-red-600 rounded-lg inline-flex items-center text-center"
							onClick={handleDeleteClick}
						>
							<span>I would like to delete this organization</span>
						</Button>
					</div>
				</Modal.Body>
			</Modal>

			{confirmationModal && (
				<Modal show={confirmationModal} onClose={handleConfirmationClose}>
					<Modal.Header>
						<div className="flex items-center justify-center text-gray-700">
							Delete Organization &nbsp;{' '}
							<p className="font-semibold">Privi Tech</p>
						</div>
					</Modal.Header>
					<Modal.Body>
						<div className="text-center text-3xl font-montserrat text-gray-700">
							Privi Tech
						</div>
						<div className="flex justify-center mt-4">
							<div className="flex items-center p-2 rounded-md border-2 border-yellow-400 bg-orange-50">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="35"
									height="31"
									viewBox="0 0 35 31"
									fill="none"
								>
									<path
										d="M6.33553 13.5046C11.0373 5.1682 13.3882 1 17.1111 1C20.8339 1 23.1848 5.1682 27.8867 13.5046L28.4725 14.5435C32.3798 21.4709 34.3334 24.9347 32.5676 27.4673C30.802 30 26.4336 30 17.6971 30H16.5251C7.78851 30 3.42016 30 1.65453 27.4673C-0.111119 24.9347 1.84247 21.4709 5.74964 14.5435L6.33553 13.5046Z"
										stroke="#F4C20C"
										stroke-width="2"
									/>
									<path
										d="M17.1094 9.05469V17.1102"
										stroke="#F4C20C"
										stroke-width="2"
										stroke-linecap="round"
									/>
									<path
										d="M17.1111 23.5582C18.0009 23.5582 18.7222 22.8368 18.7222 21.947C18.7222 21.0573 18.0009 20.3359 17.1111 20.3359C16.2213 20.3359 15.5 21.0573 15.5 21.947C15.5 22.8368 16.2213 23.5582 17.1111 23.5582Z"
										fill="#E2B100"
									/>
								</svg>
								<p className="ml-2 text-yellow-500">
									If you don't read this, something bad will happen!
								</p>
							</div>
						</div>
						<div className="flex flex-col mt-4">
							<p className="flex justify-center text-gray-700">
								This will permanently&nbsp;
								<span className="text-red-600">Delete</span>
							</p>
							<p className="flex justify-center text-gray-700">
								<span className="font-semibold">Privi Tech &nbsp;</span>{' '}
								organization, its wallet and all related data.
							</p>
						</div>
						<div className="flex justify-center mt-4">
							<Button
								className="text-lg font-montserrat text-red-600 hover:text-white border-orange-600 bg-transparent hover:!bg-red-600 rounded-lg inline-flex items-center text-center"
								onClick={handleDeleteConfirmation}
							>
								<span>I have read about and comprehend these effects</span>
							</Button>
						</div>
					</Modal.Body>
				</Modal>
			)}

			{secondModal && (
				<Modal show={secondModal} onClose={handleCloseSecondModal}>
					<Modal.Header>
						<div className="flex items-center justify-center text-gray-700">
							Delete Organization &nbsp;{' '}
							<p className="font-semibold">Privi Tech</p>
						</div>
					</Modal.Header>
					<Modal.Body>
						<div className="text-center text-3xl font-montserrat text-gray-700">
							Privi Tech
						</div>
						<p className="flex justify-center text-xl font-montserrat text-gray-700 mt-4 px-8">
							To confirm, type "Privi Tech" in the box below
						</p>

						<Formik
							initialValues={{
								orgName: '',
							}}
							validationSchema={yup.object().shape({
								orgName: yup
									.string()
									.required('Organization name is required')
									.min(2, 'Organization name must be at least 2 characters')
									.max(50, 'Organization name must be at most 50 characters')
									.trim(),
							})}
							validateOnBlur
							validateOnChange
							enableReinitialize
							onSubmit={handleDeleteSecondConfirmation}
						>
							{(formikHandlers): JSX.Element => (
								<Form
									className="mt-4 space-y-6"
									onSubmit={formikHandlers.handleSubmit}
								>
									<div className="flex justify-center">
										<Field
											id="signinpassword"
											name="password"
											className="truncate px-4 py-2 text-gray-900 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
											placeholder="Privi Tech"
										/>
									</div>
									{formikHandlers?.errors?.orgName &&
										formikHandlers?.touched?.orgName && (
											<span className="text-red-500 text-xs absolute mt-1">
												{formikHandlers?.errors?.orgName}
											</span>
										)}

									<div className="flex justify-center mt-4">
										<Button
											className="text-lg px-8 font-montserrat text-red-600 hover:text-white border-orange-600 bg-transparent hover:!bg-red-600 rounded-lg inline-flex items-center text-center"
                                            style={{width: '70%'}}                                         
											onClick={handleDeleteConfirmation}
										>
											<span>
												Delete this Organization
											</span>
										</Button>
									</div>
								</Form>
							)}
						</Formik>
					</Modal.Body>
				</Modal>
			)}
		</div>
	);
};

export default DeleteOrgModal;
