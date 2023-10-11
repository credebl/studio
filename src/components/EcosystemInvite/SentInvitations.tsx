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
import { apiStatusCodes } from '../../config/CommonConstant';
import { EmptyListMessage } from '../EmptyListComponent';
import CustomSpinner from '../CustomSpinner';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

const SentInvitations = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [searchText, setSearchText] = useState<string>('');
	const [invitationsList, setInvitationsList] =
		useState<Array<Invitation> | null>(null);

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};

	const getAllSentInvitations = async () => {
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

	const deletInvitations = async (invitationId: number) => {
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
		<div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<h1 className="text-xl mb-4 font-semibold text-gray-900 sm:text-2xl dark:text-white">
						Sent Ecosystem Invitations
					</h1>

					<AlertComponent
						message={message ? message : error}
						type={message ? 'success' : 'failure'}
						onAlertClose={() => {
							setMessage(null);
							setError(null);
						}}
					/>

					{invitationsList && invitationsList?.length > 0 ? (
						<div className="p-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-3 dark:bg-gray-800">
							<div className="flow-root">
								<ul className="divide-y divide-gray-200 dark:divide-gray-700">
									{invitationsList.map((invitation) => (
										<li key={invitation.id} className="p-4 min-[320px]:h-52 sm:h-48 md:h-[150px] items-center">
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
																	? ' bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
																	: invitation.status === 'accepted'
																	? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
																	: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
															} m-1 text-sm font-medium px-2.5 py-0.5 rounded`}
														>
															{invitation.status}
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
							{!(invitationsList && invitationsList?.length > 0) && !loading ? (
								<EmptyListMessage
									message={'No Sent Invitations'}
									description={`You don't have any sent invitation`}
								/>
							) : (
								<div className="flex items-center justify-center mb-4">
									<CustomSpinner />
								</div>
							)}
						</div>
					)}

					<div className="flex items-center justify-end mb-4">
						<Pagination
							currentPage={currentPage.pageNumber}
							onPageChange={onPageChange}
							totalPages={currentPage.total}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SentInvitations;
