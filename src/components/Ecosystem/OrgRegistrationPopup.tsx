import { Button, Label, Modal } from 'flowbite-react';
import checkEcosystem from '../../config/ecosystem';
import { Field, Form, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import { useState } from 'react';
import type { Organisation } from '../organization/interfaces';
import type { Invitation } from '../organization/interfaces/invitations';
import { acceptRejectInvitations } from '../../api/invitations';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { pathRoutes } from '../../config/pathRoutes';
import React from 'react';

const OrgRegistrationPopup = (props: {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
}) => {
	const { isEcosystemLead } = checkEcosystem();
	const [selectedId, setSelectedId] = useState<number>();
	const [loading, setLoading] = useState<boolean>(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const acceptEcosytemInvitation = async (
		invite: Invitation,
		status: string,
	) => {
		const response = await acceptRejectInvitations(
			invite.id,
			Number(selectedId),
			status,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setMessage(data?.message);
			setLoading(false);
			window.location.href = pathRoutes.ecosystem.profile;
		} else {
			setError(response as string);
			setLoading(false);
		}
	};

	return (
		<Modal show={props.openModal} onClose={() => props.closeModal(false)}>
			<Modal.Header>Org Registration</Modal.Header>
			<div className="relative p-2 text-center bg-white rounded-lg shadow dark:bg-gray-800 pr-5 pl-5">
				<Formik
					initialValues={{
						name: '',
						description: '',
						DIDField: '',
						agentEndpoint: '',
					}}
					validationSchema={yup.object().shape({
						name: yup.string().required('Name is required').trim(),
						description: yup
							.string()
							.required('Description is required')
							.trim(),
						DIDField: yup.string().required('DID is required').trim(),
						agentEndpoint: yup
							.string()
							.required('Agent Endpoint is required')
							.trim(),
					})}
					validateOnBlur
					validateOnChange
					enableReinitialize
					onSubmit={() => props.closeModal(false)}
				>
					{(
						formikHandlers: FormikProps<{
							name: string;
							description: string;
							DIDField: string;
							agentEndpoint: string;
						}>,
					): JSX.Element => (
						<Form
							className="mt-5 mb-5 space-y-6"
							onSubmit={formikHandlers.handleSubmit}
						>
							<div>
								<div className="flex justify-start block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									<Label htmlFor="name" value="Name" />
									<span className="text-red-500 text-xs">*</span>
								</div>
								<Field
									id="name"
									name="name"
									value={formikHandlers.values.name}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="Your organization name"
								/>
								{formikHandlers?.errors?.name &&
									formikHandlers?.touched?.name && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.name}
										</span>
									)}
							</div>
							<div>
								<div className="flex justify-start block mb-2 text-sm font-medium text-gray-900 dark:text-white ">
									<Label htmlFor="description" value="Description" />
									<span className="text-red-500 text-xs">*</span>
								</div>
								<Field
									id="description"
									name="description"
									value={formikHandlers.values.description}
									as="textarea"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="Description of your organization"
								/>
								{formikHandlers?.errors?.description &&
									formikHandlers?.touched?.description && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.description}
										</span>
									)}
							</div>

							<div>
								<div className="flex justify-start block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									<Label htmlFor="DIDField" value="DID Field" />
									<span className="text-red-500 text-xs">*</span>
								</div>
								<Field
									id="DIDField"
									value={formikHandlers.values.DIDField}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="DID Field of your organization"
								/>
								{formikHandlers?.errors?.DIDField &&
									formikHandlers?.touched?.DIDField && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.DIDField}
										</span>
									)}
							</div>

							<div>
								<div className="flex justify-start block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									<Label htmlFor="AgentEndpoint" value="Agent Endpoint" />
									<span className="text-red-500 text-xs">*</span>
								</div>
								<Field
									id="agentEndpoint"
									value={formikHandlers.values.agentEndpoint}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="Agent Endpoint of your organization"
								/>
								{formikHandlers?.errors?.agentEndpoint &&
									formikHandlers?.touched?.agentEndpoint && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.agentEndpoint}
										</span>
									)}
							</div>

							<div className="flex justify-end flex gap-2 py-2 mr-3 ">
								<Button
									type="reset"
									class="hover:bg-secondary-700 bg-transparent ring-2 text-black font-medium rounded-lg text-sm  "
								>
									<div className="pr-2">
										<svg
											className="h-8 w-8 text-black dark:text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<span className="dark:text-white">reset</span>
								</Button>
								<Button
									type="submit"
									class="hover:bg-secondary-700 bg-transparent ring-2 text-black font-medium rounded-lg text-sm  "
									onSubmit={acceptEcosytemInvitation}
								>
									<div className="pr-2">
										<svg
											className="h-8 w-8 text-black dark:text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<span className="dark:text-white">Submit</span>
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

export default OrgRegistrationPopup;
