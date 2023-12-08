import { Button, Pagination } from 'flowbite-react';
import { useEffect, useState } from 'react';
import {
	getEcosystemInvitations,
	deleteEcosystemInvitations,
} from '../../api/invitations';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import type { Invitation } from '../organization/interfaces/invitations';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { EmptyListMessage } from '../EmptyListComponent';
import CustomSpinner from '../CustomSpinner';
import RoleViewButton from '../RoleViewButton';
import SendInvitationModal from '../organization/invitations/SendInvitationModal';
import { getFromLocalStorage } from '../../api/Auth';
import { Features } from '../../utils/enums/features';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

const SentInvitations = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [searchText, setSearchText] = useState<string>('');
	const [invitationsList, setInvitationsList] =
		useState<Array<Invitation> | null>(null);
	const [ecosystemId, setEcosystemId] = useState<string>('');
	const [openModal, setOpenModal] = useState<boolean>(false);

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};

	const getAllSentInvitations = async () => {
		const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
		setEcosystemId(ecosystemId);
		setLoading(true);
		const response = await getEcosystemInvitations(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			const invitationList = data?.data?.invitations;

			setInvitationsList(invitationList);
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const deletInvitations = async (invitationId: string) => {
		const response = await deleteEcosystemInvitations(invitationId);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setLoading(true);
			await getAllSentInvitations();
			setMessage('Invitation deleted successfully');
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const createInvitationsModel = () => {
		setOpenModal(true);
	};

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getAllSentInvitations();
			}, 1000);
		} else {
			getAllSentInvitations();
		}
		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-xl font-semibold items-center text-gray-900 sm:text-2xl dark:text-white">
							Sent Ecosystem Invitations
						</h1>
						<div className="inline-flex items-center ml-auto">
							<SendInvitationModal
							  getAllSentInvitations={getAllSentInvitations}
								flag={true}
								ecosystemId={ecosystemId}
								openModal={openModal}
								setMessage={(data) => setMessage(data)}
								setOpenModal={setOpenModal}
							/>
							<RoleViewButton
								buttonTitle="Invite"
								feature={Features.SEND_INVITATION}
								svgComponent={
									<svg
										className="pr-2"
										xmlns="http://www.w3.org/2000/svg"
										width="36"
										height="18"
										fill="none"
										viewBox="0 0 42 24"
									>
										<path
											fill="#fff"
											d="M37.846 0H9.231a3.703 3.703 0 0 0-3.693 3.692v1.385c0 .508.416.923.924.923a.926.926 0 0 0 .923-.923V3.692c0-.184.046-.369.092-.554L17.815 12 7.477 20.861a2.317 2.317 0 0 1-.092-.553v-1.385A.926.926 0 0 0 6.462 18a.926.926 0 0 0-.924.923v1.385A3.703 3.703 0 0 0 9.231 24h28.615a3.703 3.703 0 0 0 3.693-3.692V3.692A3.703 3.703 0 0 0 37.846 0ZM8.862 1.892c.092-.046.23-.046.369-.046h28.615c.139 0 .277 0 .37.046L24.137 13.938a.97.97 0 0 1-1.2 0L8.863 1.893Zm28.984 20.262H9.231c-.139 0-.277 0-.37-.046L19.247 13.2l2.492 2.17a2.67 2.67 0 0 0 1.8.691 2.67 2.67 0 0 0 1.8-.692l2.493-2.169 10.384 8.908c-.092.046-.23.046-.369.046Zm1.846-1.846c0 .184-.046.369-.092.553L29.262 12 39.6 3.138c.046.185.092.37.092.554v16.616ZM2.77 9.692c0-.507.416-.923.923-.923h5.539c.507 0 .923.416.923.923a.926.926 0 0 1-.923.923h-5.54a.926.926 0 0 1-.923-.923Zm6.462 5.539H.923A.926.926 0 0 1 0 14.308c0-.508.415-.923.923-.923h8.308c.507 0 .923.415.923.923a.926.926 0 0 1-.923.923Z"
										/>
									</svg>
								}
								onClickEvent={createInvitationsModel}
							/>
						</div>
					</div>

					<AlertComponent
						message={message ? message : error}
						type={message ? 'success' : 'failure'}
						onAlertClose={() => {
							setMessage(null);
							setError(null);
						}}
					/>

					{invitationsList && invitationsList?.length > 0 ? (
						<div className="p-2 mb-4 bg-white  rounded-lg shadow-sm 2xl:col-span-2  sm:p-3 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
							<div className="flow-root">
								<ul className="divide-y divide-gray-200 dark:divide-gray-700">
									{invitationsList.map((invitation) => (
										<li
											key={invitation.id}
											className="p-4 min-[320px]:h-52 sm:h-48 md:h-[150px] items-center"
										>
											<div className="flex flex-wrap justify-between align-middle 2xl:flex items-center 2xl:space-x-4">
												<div className=" xl:mb-4 2xl:mb-0">
													<div className="flex space-x-4">
														<svg
															width="60"
															height="60"
															viewBox="0 0 398 398"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<g clip-path="url(#clip0_3892_5729)">
																<path
																	d="M350.828 117.051V166.651L382.328 143.251L350.828 117.051Z"
																	fill="#6B7280"
																/>
																<path
																	d="M217.922 6.9502C206.822 -2.2498 190.722 -2.3498 179.622 6.8502L166.922 17.6502H230.822L217.922 6.9502Z"
																	fill="#6B7280"
																/>
																<path
																	d="M228.629 282.451C220.029 288.851 209.629 292.351 198.929 292.251C188.229 292.251 177.729 288.851 169.129 282.451L9.82869 163.551V367.451C9.72869 383.951 23.0287 397.451 39.5287 397.551H358.029C374.529 397.451 387.829 383.951 387.729 367.451V163.551L228.629 282.451Z"
																	fill="#6B7280"
																/>
																<path
																	d="M15.3281 143.249L45.8281 165.949V117.949L15.3281 143.249Z"
																	fill="#6B7280"
																/>
																<path
																	d="M65.8281 37.6484V180.848L180.828 266.448C191.528 274.248 206.228 274.248 216.928 266.448L330.828 181.548V37.6484H65.8281ZM136.828 117.648H190.828C196.328 117.648 200.828 122.148 200.828 127.648C200.828 133.148 196.328 137.648 190.828 137.648H136.828C131.328 137.648 126.828 133.148 126.828 127.648C126.828 122.148 131.328 117.648 136.828 117.648ZM260.828 187.648H136.828C131.328 187.648 126.828 183.148 126.828 177.648C126.828 172.148 131.328 167.648 136.828 167.648H260.828C266.328 167.648 270.828 172.148 270.828 177.648C270.828 183.148 266.328 187.648 260.828 187.648Z"
																	fill="#6B7280"
																/>
															</g>
															<defs>
																<clipPath id="clip0_3892_5729">
																	<rect
																		width="397.55"
																		height="397.55"
																		fill="white"
																	/>
																</clipPath>
															</defs>
														</svg>
														<div className="flex-1 min-w-0">
															<p className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
																{invitation.email}
															</p>

															<div className="flow-root h-auto">
																<ul className="divide-y divide-gray-200 dark:divide-gray-700">
																	<li className="pt-3 sm:pt-3 overflow-auto">
																		<div className="items-center space-x-4">
																			<div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
																				Role:{' '}
																				<span
																					key={invitation.id}
																					className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
																				>
																					Ecosystem Member
																				</span>
																			</div>
																		</div>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</div>

												<div>
													<div className="dark:text-white flex items-center justify-end">
														Status:
														<span
															key={invitation.id}
															className={`${
																invitation.status === 'pending'
																	? 'bg-orange-100 text-orange-800 border border-orange-100 dark:bg-gray-700 dark:border-orange-300 dark:text-orange-300'
																	: invitation.status === 'accepted'
																	? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400 rounded border border-green-100 dark:border-green-500'
																	: 'bg-red-100 text-red-800 rounded dark:bg-gray-900 dark:text-red-300  border-red-100 dark:border-red-500 border'
															} m-1 text-sm font-medium px-2.5 py-0.5 rounded-md`}
														>
															{invitation?.status?.charAt(0).toUpperCase() +
																invitation?.status?.slice(1)}
														</span>
													</div>
													{invitation.status === 'pending' && (
														<div className="flex">
															<Button
																onClick={() => deletInvitations(invitation.id)}
																color="bg-white"
																className="ml-5 font-normal items-center mt-5 text-xl text-primary-700 border border-blue-700 text-center hover:!bg-primary-800 hover:text-white rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:hover:bg-primary-700 dark:text-white dark:bg-primary-700 dark:focus:ring-blue-800"
															>
																<svg
																	className="w-6 h-6"
																	aria-hidden="true"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 20 20"
																>
																	<path
																		stroke="currentColor"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																		stroke-width="1.5"
																		d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
																	/>
																</svg>
																<span className="text-lg ml-2">
																	Delete Invitation
																</span>
															</Button>
														</div>
													)}
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					) : (
						<div>
							{!(invitationsList && invitationsList?.length > 0) && loading ? (
								<div className="flex items-center justify-center mb-4">
									<CustomSpinner />
								</div>
							) : (
								<EmptyListMessage
									message={'No Sent Invitations'}
									description={`You don't have any sent invitation`}
								/>
							)}
						</div>
					)}

					{currentPage.total > 1 && (
						<div className="flex items-center justify-end mb-4">
							<Pagination
								currentPage={currentPage.pageNumber}
								onPageChange={onPageChange}
								totalPages={currentPage.total}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SentInvitations;
