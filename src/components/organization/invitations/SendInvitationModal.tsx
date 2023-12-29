import * as yup from 'yup';

import { Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';

import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import {
	createEcoSystemInvitations,
	createInvitations,
} from '../../../api/invitations';
import { getOrganizationRoles } from '../../../api/organization';
import { getFromLocalStorage } from '../../../api/Auth';

interface Values {
	email: string;
}

interface Invitations {
	email: string;
	role: string;
	roleId: string;
}

interface RoleI {
	id: string;
	name: string;
}

const SendInvitationModal = (props: {
	getAllSentInvitations?: () => void;
	ecosystemId?: string;
	flag?: boolean;
	openModal: boolean;
	setMessage: (message: string) => void;
	setOpenModal: (flag: boolean) => void;
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [selfEmail, setSelfEmail] = useState({
		email: "",
		error: ""
	});

	const [invitations, setInvitations] = useState<Invitations[]>([]);

	const [memberRole, setMemberRole] = useState<RoleI | null>(null);

	const [initialData, setInitialData] = useState({
		email: '',
	});
	const [initialInvitationData, setInitialInvitationData] = useState({
		email: '',
	});
	const [erroMsg, setErrMsg] = useState<string | null>(null);

	const getRoles = async () => {
		const resRoles = await getOrganizationRoles();

		const { data } = resRoles as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const roles: Array<RoleI> = data?.data;
			const memberRole = roles.find((role) => role.name === 'member');
			setMemberRole(memberRole as RoleI);
		} else {
			setErrMsg(resRoles as string);
		}
	};

	useEffect(() => {
		setInitialInvitationData({
			email: '',
		});
		setInitialData({
			email: '',
		});

		setInvitations([]);
		getRoles();
	}, [props.openModal]);

	const includeInvitation = async (values: Values) => {
		setInvitations([
			...(invitations as Invitations[]),
			{
				email: values.email,
				role: memberRole?.name as string,
				roleId: String(memberRole?.id),
			},
		]);
	};

	const removeInvitation = (email: string) => {
		const invitationList = invitations.filter((item) => email !== item.email);

		setInvitations(invitationList);
	};

	const sendInvitations = async () => {
		setLoading(true);

		const invitationPayload = invitations.map((invitation) => {
			return {
				email: invitation.email,
				orgRoleId: [invitation.roleId],
			};
		});

		const resCreateOrg = await createInvitations(invitationPayload);
		const { data } = resCreateOrg as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			props.setMessage(data?.message);
			props.setOpenModal(false);
		} else {
			setErrMsg(resCreateOrg as string);
		}
		setLoading(false);
	};

	const sendEcoSystemInvitations = async () => {

		setLoading(true);
		const invitationPayload = invitations.map((invitation) => {
			return {
				email: invitation.email,
			};
		});

		const resCreateOrg = await createEcoSystemInvitations(
			invitationPayload,
			props?.ecosystemId,
		);

		const { data } = resCreateOrg as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {

			props?.setMessage(data?.message);
			props?.setOpenModal(false);
			props?.getAllSentInvitations()

		} else {
			setErrMsg(resCreateOrg as string);
		}
		setLoading(false);
	};

	useEffect(() => {
		const getEmail = async () => {
			const email = await getFromLocalStorage(storageKeys.USER_EMAIL)
			setSelfEmail({
				...selfEmail,
				email
			})
		}
		getEmail()
	}, [])

	return (
		<Modal
			size="2xl"
			show={props.openModal}
			onClose={() => {
				setInvitations([]);
				setInitialInvitationData({
					email: " ",
				});
				props.setOpenModal(false);
			}}
		>
			<Modal.Header>Send Invitation(s)</Modal.Header>
			<Modal.Body>
				<AlertComponent
					message={erroMsg}
					type={'failure'}
					onAlertClose={() => {
						setErrMsg(null);
					}}
				/>
				<Formik
					initialValues={initialInvitationData}
					validationSchema={yup.object().shape({
						email: yup
							.string()
							.required('Email is required')
							.email('Email is invalid')
							.test('is-self-email', "You can't send invitation to self", (value) => value.trim() !== selfEmail.email.trim())
							.trim(),
					})}
					validateOnBlur
					validateOnChange
					enableReinitialize
					onSubmit={async (
						values: Values,
						{ resetForm }: FormikHelpers<Values>,
					) => {
						await includeInvitation(values);
						resetForm({ values: initialInvitationData });
					}}
				>
					{(formikHandlers): JSX.Element => (
						<Form
							className="mt-2 space-y-6"
							onSubmit={formikHandlers.handleSubmit}
						>
							<div className="flex items-center justify-between">
								<div className="w-full">
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="email2" value="Email" />
										<span className="text-red-500 text-xs">*</span>
									</div>
									<Field
										id="email"
										name="email"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									/>
									{formikHandlers?.errors?.email &&
										formikHandlers?.touched?.email ? (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.email}
										</span>
									) : <span className="text-red-500 text-xs invisible">Error</span>}
								</div>

								<div className="">
									<Button
										type="submit"
										className="mt-2 ml-4 text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
									>
										<svg
											className="pr-2"
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											fill="none"
											viewBox="0 0 24 24"
										>
											<path
												fill="#fff"
												d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
											/>
										</svg>
										ADD
									</Button>
								</div>
							</div>
						</Form>
					)}
				</Formik>

				<div>
					{invitations.length > 0 && (
						<div className="p-2 my-2 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-2 dark:bg-gray-800">
							<ul className="divide-y divide-gray-200 dark:divide-gray-700">
								{invitations.map((invitation) => (
									<li key={invitation.email} className="p-2">
										<div className="flex justify-between 2xl:flex align-center 2xl:space-x-4">
											<div className="flex flex-wrap space-x-4 xl:mb-4 2xl:mb-0 dark:text-white">
												<div>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
														width="40px"
														height="40px"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
														/>
													</svg>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
														{invitation.email}
													</p>

													<div className="flow-root h-auto">
														<ul className="divide-y divide-gray-200 dark:divide-gray-700">
															<li className="pt-3 sm:pt-3 overflow-auto">
																<div className="items-center space-x-4">
																	<div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
																		Role: Member
																	</div>
																</div>
															</li>
														</ul>
													</div>
												</div>
											</div>
											<span
												className="cursor-pointer"
												onClick={() => removeInvitation(invitation.email)}
											>
												<svg
													className="text-red-400 dark:text-red-500 w-6 h-8 mb-3.5 mx-auto"
													aria-hidden="true"
													fill="currentColor"
													viewBox="0 0 20 20"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														fill-rule="evenodd"
														d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
														clip-rule="evenodd"
													></path>
												</svg>
											</span>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}

					<div className="mt-4 flex justify-end">
						<Button
							onClick={props.flag ? sendEcoSystemInvitations : sendInvitations}
							disabled={invitations.length === 0}
							isProcessing={loading}
							className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
						>
							<svg
								className="pr-2"
								xmlns="http://www.w3.org/2000/svg"
								width="25"
								height="25"
								fill="none"
								viewBox="0 0 30 30"
							>
								<path
									stroke="#fff"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12.201 17.792 28.546 1.454m-15.88 17.073 3.706 7.413c.896 1.79 1.344 2.687 1.908 2.927.49.208 1.05.17 1.506-.102.527-.314.85-1.261 1.498-3.157l7.003-20.507c.564-1.652.845-2.477.652-3.024a1.668 1.668 0 0 0-1.016-1.016c-.547-.193-1.372.089-3.024.652L4.391 8.716c-1.895.647-2.843.97-3.156 1.498a1.667 1.667 0 0 0-.102 1.506c.24.564 1.136 1.012 2.927 1.908l7.413 3.706c.295.148.443.221.57.32.114.087.216.19.303.302.099.128.172.276.32.571Z"
								/>
							</svg>
							Send
						</Button>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default SendInvitationModal;
