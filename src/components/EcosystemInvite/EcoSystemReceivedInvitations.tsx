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
import { getOrgDetails } from '../../config/ecosystem';

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
	const [loading, setLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [organizationsList, setOrganizationsList] = useState<Array<Organisation> | null>(null);
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

			const invitationList = data?.data?.invitations.filter((invitation: { status: string; }) => {
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
		const orgDetails = await getOrgDetails()
		const response = await acceptRejectEcosystemInvitations(
			invite.id,
			Number(selectedId),
			status,
			orgDetails.orgName,
			orgDetails.orgDid
		);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setMessage(data?.message);
			setLoading(false);
			getAllInvitations()
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

	const rejectEnv =
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

	const acceptEnv = <svg
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
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<Button
						type="submit"
						color='bg-primary-800'
						onClick={() => {
							window.location.href = `${pathRoutes.ecosystem.root}`
						}}
						className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 
						ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 
						lg:py-2.5 mr-2 ml-auto dark:text-white dark:hover:text-black 
						dark:hover:bg-primary-50'
						style={{ height: '2.5rem', width: '5rem', minWidth: '2rem' }}
					>
						<svg className='mr-1' xmlns="http://www.w3.org/2000/svg" width="22" height="12" fill="none" viewBox="0 0 30 20">
							<path fill="#1F4EAD" d="M.163 9.237a1.867 1.867 0 0 0-.122 1.153c.083.387.287.742.587 1.021l8.572 7.98c.198.19.434.343.696.447a2.279 2.279 0 0 0 1.657.013c.263-.1.503-.248.704-.435.201-.188.36-.41.468-.655a1.877 1.877 0 0 0-.014-1.543 1.999 1.999 0 0 0-.48-.648l-4.917-4.576h20.543c.568 0 1.113-.21 1.515-.584.402-.374.628-.882.628-1.411 0-.53-.226-1.036-.628-1.41a2.226 2.226 0 0 0-1.515-.585H7.314l4.914-4.574c.205-.184.368-.404.48-.648a1.878 1.878 0 0 0 .015-1.542 1.99 1.99 0 0 0-.468-.656A2.161 2.161 0 0 0 11.55.15a2.283 2.283 0 0 0-1.657.013 2.154 2.154 0 0 0-.696.447L.626 8.589a1.991 1.991 0 0 0-.463.648Z" />
						</svg>
						<span className="min-[320px]:hidden sm:block"> Back</span>
					</Button>
				</div>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Received Ecosystem Invitations
				</h1>
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
														ecosytem={invitation.ecosystem}
													/>

													<div id={invitation.email} className="flex">
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
																	<option key={orgs.id} value={orgs.id}>{orgs.name}</option>
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

				{currentPage.pageNumber > 1 &&	<div className="flex items-center justify-end mb-4">
						<Pagination
							currentPage={currentPage.pageNumber}
							onPageChange={onPageChange}
							totalPages={currentPage.total}
						/>
					</div>}
				</div>
			</div>
		</div>
	);
};

export default ReceivedInvitations;
