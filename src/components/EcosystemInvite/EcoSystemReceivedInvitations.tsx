import { Button, Card, Pagination } from 'flowbite-react';
import { useEffect, useState } from 'react';
import {
	acceptRejectEcosystemInvitations,
	getUserEcosystemInvitations,
} from '../../api/invitations';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import type { Organisation } from '../organization/interfaces';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { pathRoutes } from '../../config/pathRoutes';
import { EmptyListMessage } from '../EmptyListComponent';
import CustomSpinner from '../CustomSpinner';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrganizationById, getOrganizations } from '../../api/organization';
import EcoInvitationList from './EcoInvitationList';
import { getOrgDetails } from '../../config/ecosystem';
import BackButton from '../../commonComponents/backbutton';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

interface IOrgData {
	orgDid: string;
	orgName: string;
}

export interface NetworkDetails {
	id: string;
	name: string;
	indyNamespace: string;
}

export interface IPropsEcoInvitationList {
	name: string;
	logoUrl: string;
	networkDetails?: NetworkDetails[]
}
export interface InvitationProps {
	invitationId: string;
	ecosystem: IPropsEcoInvitationList;
}
export interface EcosystemInvitation {
	ecosystem: { name: string; logoUrl: string };
	id: string;
	createDateTime: string;
	createdBy: string;
	lastChangedDateTime: string;
	lastChangedBy: string;
	deletedAt: any;
	userId: string;
	orgId: string;
	status: string;
	email: string;
	selected?: boolean;
	orgData?: IOrgData;
}

const ReceivedInvitations = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [organizationsList, setOrganizationsList] =
		useState<Array<Organisation> | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [selectedId, setSelectedId] = useState<string>('');
	const [searchText, setSearchText] = useState('');
	const [invitationsData, setInvitationsData] =
		useState<Array<EcosystemInvitation> | null>(null);
	const [getOrgError, setGetOrgError] = useState<string | null>(null);

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};

	const getAllOrganizationsForEcosystem = async () => {
		setLoading(true);
		const response = await getOrganizations(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
			setError(response as string);
		} else {
			const totalPages = data?.data?.totalPages;

			const orgList = data?.data?.organizations.map((userOrg: Organisation) => {
				const roles: string[] = userOrg.userOrgRoles.map(
					(role) => role.orgRole.name,
				);
				userOrg.roles = roles;
				return userOrg;
			});

			setOrganizationsList(orgList);
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		}
		setLoading(false);
	};

	const getAllInvitations = async () => {
		setLoading(true);
		const response = await getUserEcosystemInvitations(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;

			const invitationList = data?.data?.invitations?.filter(
				(invitation: { status: string }) => {
					return invitation.status === 'pending';
				},
			);
			setInvitationsData(invitationList);
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}

		setLoading(false);
	};

	useEffect(() => {
		let getData: NodeJS.Timeout;
		getAllOrganizationsForEcosystem();
		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getAllInvitations();
			}, 1000);
		} else {
			getAllInvitations();
		}

		return () => clearTimeout(getData);
	}, [searchText, openModal, currentPage.pageNumber]);

	const respondToEcosystemInvitations = async (
		invite: EcosystemInvitation,
		status: string,
	) => {
		try {
			const response = await acceptRejectEcosystemInvitations(
				invite.id,
				selectedId,
				status,
			);
			setLoading(false);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setMessage(data?.message);
				getAllInvitations();
			} else {
				setError(response as string);
			}

			setLoading(false);
		} catch (err) {
			console.log('ERROR - Accept/Reject Ecosystem::', err);
		}
	};

	const getSelectedOrgDetails = async (
		orgId: string,
	): Promise<IOrgData | null> => {
		try {
			const response = await getOrganizationById(orgId);
			const { data } = response as AxiosResponse;
			const orgData = data?.data;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				if (orgData.org_agents[0]?.orgDid) {
					setGetOrgError(null);
					return {
						orgDid: orgData.org_agents[0]?.orgDid || '',
						orgName: orgData.name,
					};
				} else {
					setGetOrgError(
						'Please create your wallet for this organization to accept the invitation.',
					);
					return null;
				}
			}
			return null;
		} catch (err) {
			console.log('ERROR::', err);
			return null;
		}
	};

	const handleDropdownChange = async (
		e: { target: { value: any } },
		id: string,
	) => {
		const value = e.target.value;
		const orgData: IOrgData | null | undefined = await getSelectedOrgDetails(
			value,
		);
		const updateInvitationData =
			invitationsData && invitationsData.length > 0
				? invitationsData.map((item) => {
					if (id === item.id) {
						return {
							...item,
							orgId: value,
							selected: true,
							orgData: orgData ?? undefined,
						};
					}
					return {
						...item,
						selected: false,
					};
				})
				: null;
		setInvitationsData(updateInvitationData);
		setSelectedId(value);
	};

	const getOrgId = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId) {
			setSelectedId(orgId);
		}
	};

	useEffect(() => {
		getOrgId();
	}, []);

	const rejectEnv = (
		<svg
			className="mr-1 h-6 w-6 text-primary-700"
			width="20"
			height="20"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	);

	const acceptEnv = (
		<svg
			className="mr-1 h-6 w-6 text-white"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" />
			<path d="M5 12l5 5l10 -10" />
		</svg>
	);

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<div className="flex justify-between items-center">
					<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						Received Ecosystem Invitations
					</h1>
					<BackButton path={pathRoutes.ecosystem.root} />
				</div>
			</div>
			<div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<AlertComponent
						message={message || error}
						type={message ? 'success' : 'failure'}
						onAlertClose={() => {
							setMessage(null);
							setError(null);
						}}
					/>

					{loading ? (
						<div className="flex items-center justify-center px-12">
							<CustomSpinner />
						</div>
					) : invitationsData && invitationsData?.length > 0 ? (
						<div
							id={selectedId?.toString()}
							className="p-2 mb-4 bg-white 2xl:col-span-2 dark:border-gray-700 sm:p-3 dark:bg-gray-800"
						>
							<div id={selectedId?.toString()} className="flow-root">
								<ul id={selectedId?.toString()}>
									{invitationsData.map((invitation) => {
										const ecosystem: IPropsEcoInvitationList = invitation?.ecosystem;
										return (
											<Card key={invitation.id} className="p-2 mb-4">
												<div
													id={invitation.email}
													className="flex flex-wrap justify-between 2xl:flex align-center"
												>
													<div
														id={invitation.email}
														className=" xl:mb-4 2xl:mb-0"
													>
														<EcoInvitationList
															invitationId={invitation.id}
															ecosystem={ecosystem}
														/>
	
														<div id={invitation.email} className="flex">
															<Button
																onClick={() =>
																	respondToEcosystemInvitations(
																		invitation,
																		'rejected',
																	)
																}
																disabled={!invitation?.orgData}
																id={invitation.id}
																color="bg-white"
																className='mr-5 mt-5 text-base font-medium text-center text-gray-00 bg-secondary-700 hover:!bg-secondary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600  dark:focus:ring-primary-800 dark:bg-gray-800"'
																style={{
																	height: '2.5rem',
																	width: '100%',
																	minWidth: '2rem',
																}}
															>
																{rejectEnv}
																Reject
															</Button>
															<Button
																onClick={() =>
																	respondToEcosystemInvitations(
																		invitation,
																		'accepted',
																	)
																}
																disabled={!invitation?.orgData}
																id={invitation.id}
																className='mt-5 text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:!bg-primary-800 dark:focus:ring-primary-800"'
																style={{
																	height: '2.5rem',
																	width: '100%',
																	minWidth: '2rem',
																}}
															>
																{acceptEnv}
																Accept
															</Button>
														</div>
													</div>
													<div className="flex items-center h-fit">
														<select
															className="ml-3 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-700 focus:border-primary-700 block w-full px-2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-700 dark:focus:border-primary-700"
															id="dropdown"
															onChange={(e) =>
																handleDropdownChange(e, invitation.id)
															}
															value={invitation.orgId || ''}
														>
															<option value="">Select Organization</option>
															{organizationsList &&
																organizationsList.length > 0 &&
																organizationsList.map((orgs) => {
																	return (
																		<option
																			key={orgs.id}
																			value={orgs.id.toString()}
																		>
																			{orgs.name}
																		</option>
																	);
																})}
														</select>
													</div>
												</div>
												{invitation.selected && (
													<AlertComponent
														message={getOrgError}
														type={'failure'}
														onAlertClose={() => {
															setGetOrgError(null);
														}}
													/>
												)}
											</Card>
										)
									})}
								</ul>
							</div>
						</div>
					) : (
						invitationsData && (
							<EmptyListMessage
								message={'No Invitations'}
								description={`You don't have any invitation`}
							/>
						)
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

export default ReceivedInvitations;
