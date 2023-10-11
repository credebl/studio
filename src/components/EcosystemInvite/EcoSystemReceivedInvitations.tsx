import { Button, Card, Pagination } from 'flowbite-react';
import { useEffect, useState } from 'react';
import {
	acceptRejectEcosystemInvitations,
	getUserEcosystemInvitations,
} from '../../api/invitations';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import type { Invitation } from '../organization/interfaces/invitations';
import type { Organisation } from '../organization/interfaces';
import SendInvitationModal from '../organization/invitations/SendInvitationModal';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { pathRoutes } from '../../config/pathRoutes';
import { EmptyListMessage } from '../EmptyListComponent';
import CustomSpinner from '../CustomSpinner';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrganizations } from '../../api/organization';
import EcoInvitationList from './EcoInvitationList';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};


export interface EcosystemInvitation {
	ecosystem: []
	id: string
	createDateTime: string
	createdBy: number
	lastChangedDateTime: string
	lastChangedBy: number
	deletedAt: any
	userId: string
	orgId: string
	status: string
	email: string
}


const ReceivedInvitations = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [organizationsList, setOrganizationsList] =useState<Array<Organisation> | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [selectedId, setSelectedId] = useState<number>();
	const [searchText, setSearchText] = useState('');
	const [invitationsData, setInvitationsData] = useState<Array<EcosystemInvitation> | null>(null);

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};

	const props = { openModal, setOpenModal };

	const getAllOrganizationsForEcosystem = async () => {
		setLoading(true);
		const response = await getOrganizations(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
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
		} else {
			setError(response as string);
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

			const invitationList = data?.data?.invitations.filter((invitation: { status: string; })=>{
				return invitation.status === 'pending'
			})
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
		invite: Invitation,
		status: string,
	) => {
		setLoading(true);
		const response = await acceptRejectEcosystemInvitations(
			invite.id,
			Number(selectedId),
			status,
		);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setMessage(data?.message);
			setLoading(false);
			window.location.href = pathRoutes.ecosystem.root
		} else {
			setError(response as string);
			setLoading(false);
		}
	};

	const handleDropdownChange = (e: { target: { value: any } }) => {
		const value = e.target.value;
		setSelectedId(value);
	};

	const getOrgId = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId) {
			setSelectedId(Number(orgId));
		}
	};

	useEffect(() => {
		getOrgId();
	}, []);
	
const rejectEnv=
<svg
className="mr-1 h-6 w-6 text-primary-700"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
>
<path
	stroke-linecap="round"
	stroke-linejoin="round"
	stroke-width="2"
	d="M6 18L18 6M6 6l12 12"
/>
</svg>

const acceptEnv=<svg
className="mr-1 h-6 w-6 text-white"
width="20"
height="20"
viewBox="0 0 24 24"
stroke-width="2"
stroke="currentColor"
fill="none"
stroke-linecap="round"
stroke-linejoin="round"
>
<path stroke="none" d="M0 0h24v24H0z" />
<path d="M5 12l5 5l10 -10" />
</svg>

	return (
		<div className="px-4 pt-6">
			<div className="pl-6 mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Received Invitations
				</h1>
			</div>
			<div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<SendInvitationModal
						openModal={props.openModal}
						setMessage={(data) => setMessage(data)}
						setOpenModal={props.setOpenModal}
					/>

					<AlertComponent
						message={message ? message : error}
						type={message ? 'success' : 'failure'}
						onAlertClose={() => {
							setMessage(null);
							setError(null);
						}}
					/>

					{loading ? (
						<div className="flex items-center justify-center mb-4">
							<CustomSpinner />
						</div>
					) : invitationsData && invitationsData?.length > 0 ? (
						<div id={selectedId?.toString()} className="p-2 mb-4 bg-white 2xl:col-span-2 dark:border-gray-700 sm:p-3 dark:bg-gray-800">
							<div id={selectedId?.toString()} className="flow-root">
								<ul id={selectedId?.toString()}>
									{invitationsData.map((invitation) => (
										<Card key={invitation.id} className="p-4 mb-4">
											<div id={invitation.email} className="flex flex-wrap justify-between 2xl:flex align-center">
												<div id={invitation.email} className=" xl:mb-4 2xl:mb-0">
													<EcoInvitationList 
													invitationId={invitation.id} 
													invitationEmail={invitation.email} 
													ecosytem={invitation.ecosystem}
													/>

													<div  id={invitation.email} className="flex">
														<Button
															onClick={() =>
																respondToEcosystemInvitations(
																	invitation,
																	'rejected',
																)
															}
															id={invitation.id}
															color="bg-white"
															className='mx-5 mt-5 text-base font-medium text-center text-gray-00 bg-secondary-700 hover:!bg-secondary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600  dark:focus:ring-primary-800 dark:bg-gray-800"'
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
															id={invitation.id}
															className='mx-5 mt-5 text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:!bg-primary-800 dark:focus:ring-primary-800"'
														>
															{acceptEnv}
															Accept
														</Button>
													</div>
												</div>

												<div>
													<select
														className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
														id="dropdown"
														onChange={handleDropdownChange}
														value={selectedId}
													>
														{organizationsList &&
															organizationsList.length > 0 &&
															organizationsList.map((orgs) => {
																return (
																	<option value={orgs.id}>{orgs.name}</option>
																);
															})}
													</select>
												</div>
											</div>
										</Card>
									))}
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

export default ReceivedInvitations;
