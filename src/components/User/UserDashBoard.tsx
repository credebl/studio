import { useEffect, useState } from 'react';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import CustomAvatar from '../Avatar';
import type { Organisation } from '../organization/interfaces';
import type { UserActivity } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getOrganizationById, getOrganizations } from '../../api/organization';
import { getUserActivity } from '../../api/users';
import {
	getUserEcosystemInvitations,
	getUserInvitations,
} from '../../api/invitations';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import { Roles } from '../../utils/enums/roles';
import { Button, Tooltip } from 'flowbite-react';
import { getAllCredDef, getAllSchemasByOrgId } from '../../api/Schema';
import type { GetAllSchemaListParameter } from '../Resources/Schema/interfaces';
import { getEcosystems } from '../../api/ecosystem';
import React from 'react';

import CustomSpinner from '../CustomSpinner';
import { ICheckEcosystem, checkEcosystem } from '../../config/ecosystem';
const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

interface ISchema {
	version: string;
	name: string;
	schemaLedgerId: string;
	id: string;
}

interface ICredDef {
	schemaLedgerId: string;
	tag: string;
	credentialDefinition: string;
	schemaVersion: string;
	schemaName: string;
	credentialDefinitionId: string;
	id: string;
}

const UserDashBoard = () => {
	const [message, setMessage] = useState<string | null>(null);
	const [ecoMessage, setEcoMessage] = useState<string | null>(null);
	const [viewButton, setViewButton] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [organizationsList, setOrganizationList] =
		useState<Array<Organisation> | null>(null);
	const [activityList, setActivityList] = useState<Array<UserActivity> | null>(
		null,
	);
	const [orgCount, setOrgCount] = useState(0);
	const [schemaCount, setSchemaCount] = useState(0);
	const [schemaList, setSchemaList] = useState<Array<ISchema> | null>(null);
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: 9,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'DESC',
		allSearch: '',
	});
	const [ecoCount, setEcoCount] = useState(0);
	const [ecosystemList, setEcosystemList] = useState([]);
	const [credDefList, setCredDefList] = useState([]);
	const [credDefCount, setCredDefCount] = useState(0);
	const [walletData, setWalletData] = useState([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [ecoLoading, setEcoLoading] = useState(true);
	const [credDefLoading, setCredDefLoading] = useState(true);
	const [orgLoading, setOrgLoading] = useState(true);
	const [schemaLoading, setSchemaLoading] = useState(true);
	const [walletLoading, setWalletLoading] = useState(true);
	const [isEcosystemLead, setIsEcosystemLead] = useState(false);

	const getAllInvitations = async () => {
		setLoading(true);
		const response = await getUserInvitations(
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			const invitationList = data?.data?.invitations;
			if (invitationList.length > 0) {
				setMessage(`You have received invitations to join organization`);
				setViewButton(true);
			}
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const getAllEcosystemInvitations = async () => {
		setLoading(true);
		const response = await getUserEcosystemInvitations(
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			const invitationPendingList =
				data?.data?.invitations &&
				data?.data?.invitations?.filter((invitation: { status: string }) => {
					return invitation.status === 'pending';
				});

			if (invitationPendingList && invitationPendingList.length > 0) {
				setEcoMessage(`You have received invitation to join ecosystem `);
				setViewButton(true);
			}
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}

		setLoading(false);
	};
	//Fetch the user organization list
	const getAllOrganizations = async () => {
		setOrgLoading(true);
		const response = await getOrganizations(
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
		);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setOrgCount(data?.data?.totalCount);
			const orgList = data?.data?.organizations.filter(
				(userOrg: Organisation, index: number) => index < 3,
			);
			setOrganizationList(orgList);
		} else {
			setError(response as string);
		}

		setOrgLoading(false);
	};

	//Fetch the user recent activity
	const getUserRecentActivity = async () => {
		setLoading(true);
		const response = await getUserActivity(5);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const activityList = data?.data;
			setActivityList(activityList);
			setLoading(false);
		} else {
			setError(response as string);
			setLoading(false);
		}
		setLoading(false);
	};

	const checkOrgId = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId) {
			await getAllEcosystemInvitations();
		}
	};

	const getSchemaList = async (
		schemaListAPIParameter: GetAllSchemaListParameter,
		flag: boolean,
	) => {
		try {
			let organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (!organizationId && organizationsList) {
				organizationId = organizationsList[0].id;
			}
			setSchemaLoading(true);
			let schemaList;

			schemaList = await getAllSchemasByOrgId(
				schemaListAPIParameter,
				organizationId,
			);

			const { data } = schemaList as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setSchemaCount(data?.data?.totalItems);

				if (data?.data?.data) {
					const schemaData = data?.data?.data?.filter(
						(schema: any, index: number) => index < 3,
					);
					setSchemaList(schemaData);
					setSchemaLoading(false);
				} else {
					setSchemaLoading(false);
				}
			} else {
				setSchemaLoading(false);
			}
		} catch (error) {
			setSchemaLoading(false);
		} finally {
			setSchemaLoading(false);
		}
	};

	const fetchEcosystems = async () => {
		let organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (!organizationId && organizationsList) {
			organizationId = organizationsList[0].id;
		}
		if (organizationId) {
			setEcoLoading(true);
			const response = await getEcosystems(
				organizationId,
				currentPage.pageNumber,
				currentPage.pageSize,
				'',
			);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setEcoCount(data?.data?.totalCount);
				const ecosystemData = data?.data?.ecosystemDetails.filter(
					(ecosystem: Organisation, index: number) => index < 3,
				);
				if (ecosystemData) {
					setEcosystemList(ecosystemData);
					checkEcosystemData();
				} else {
					setError(response as string);
				}
			} else {
				setError(response as string);
			}
		}
		setEcoLoading(false);
	};

	const checkEcosystemData = async () => {
		const data: ICheckEcosystem = await checkEcosystem();
		setIsEcosystemLead(data.isEcosystemLead);
	};

	const getSchemaCredentials = async () => {
		try {
			let orgId = await getFromLocalStorage(storageKeys.ORG_ID);

			if (!orgId && organizationsList) {
				orgId = organizationsList[0].id;
			}

			if (orgId) {
				setCredDefLoading(true);
				const response = await getAllCredDef();
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setCredDefCount(data.data.totalItems);
					const credentialDefs = data?.data?.data?.filter(
						(ecosystem: Organisation, index: number) => index < 3,
					);

					setCredDefList(credentialDefs);
				}
				setCredDefLoading(false);
			}
		} catch (error) {
			setCredDefLoading(false);
		} finally {
			setCredDefLoading(false);
		}
	};

	const fetchOrganizationDetails = async () => {
		setWalletLoading(true);
		let orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (!orgId && organizationsList) {
			orgId = organizationsList[0].id;
		}
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			if (data?.data?.org_agents) {
				setWalletData(data?.data?.org_agents);
			} else {
				setWalletData([]);
			}
		}
		setWalletLoading(false);
	};

	const getAllResponses = async () => {
		const role = await getFromLocalStorage(storageKeys.ORG_ROLES);
		if (role === Roles.OWNER) {
			checkOrgId();
		}

		getAllOrganizations();
		getAllInvitations();
		getUserRecentActivity();
	};

	useEffect(() => {
		getAllResponses();
	}, []);

	useEffect(() => {
		if (!orgLoading) {
			setSchemaLoading(false);
			setCredDefLoading(false);
			setEcoLoading(false);
		}
	}, [orgLoading]);

	useEffect(() => {
		if (organizationsList && organizationsList?.length > 0) {
			fetchOrganizationDetails();
			getSchemaList(schemaListAPIParameter, false);
			fetchEcosystems();
			getSchemaCredentials();
		}
	}, [organizationsList]);

	const goToOrgDashboard = async (orgId: string, rogRoles: string[]) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		window.location.href = pathRoutes.organizations.dashboard;
	};

	const goToSchemaCredDef = async (schemaId: string) => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		const url = `${
			pathRoutes.organizations.viewSchema
		}?schemaId=${encodeURIComponent(schemaId)}`;
		window.location.href = url;
	};

	const goToCredDef = async (credentialDefinitionId: string) => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		const url = `${
			pathRoutes.organizations.viewSchema
		}?schemaId=${encodeURIComponent(credentialDefinitionId)}`;
		window.location.href = url;
	};

	const setOrgRoleDetails = async (org: Organisation) => {
		await setToLocalStorage(storageKeys.ORG_ID, org.id.toString());
		const roles: string[] = org?.userOrgRoles.map((role) => role.orgRole.name);

		await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
	};

	const goToEcoDashboard = async (ecosystemId: string) => {
		await setToLocalStorage(storageKeys.ECOSYSTEM_ID, ecosystemId);
		window.location.href = pathRoutes.ecosystem.dashboard;
	};

	const goToOrgSchema = async (
		org: Organisation,
		orgId: string,
		rogRoles: string[],
	) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		setOrgRoleDetails(org);
		window.location.href = pathRoutes.organizations.createSchema;
	};

	const goToOrgCredDef = async (
		org: Organisation,
		orgId: string,
		rogRoles: string[],
	) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		setOrgRoleDetails(org);
		window.location.href = pathRoutes.organizations.schemas;
	};

	const goToOrgIssuance = async (
		org: Organisation,
		orgId: string,
		rogRoles: string[],
	) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		setOrgRoleDetails(org);
		window.location.href = pathRoutes.organizations.issuedCredentials;
	};

	const goToOrgCredVerification = async (
		org: Organisation,
		orgId: string,
		rogRoles: string[],
	) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId);
		setOrgRoleDetails(org);
		window.location.href = pathRoutes.organizations.credentials;
	};

	const navigateToInvitation = () => {
		window.location.href = pathRoutes.ecosystem.sentinvitation;
	};

	const ToolTipDataForOrganization = () => {
		return (
			<div className="text-left text-xs">
				<p className="text-base">What is Organization?</p>
				An organization is a participating entity, such as
				<br />a business, institution, or group. Organizations
				<br />
				typically issue and verify some kind of digital
				<br />
				credentials, fostering trust within the digital
				<br />
				ecosystem.
				<br />
				Each organization is uniquely identified by a DID
				<br />
				(Decentralized Identifier), which is verifiable
				<br />
				publicly, thus enhancing the level of trust.
			</div>
		);
	};
	const ToolTipDataForEcosystem = () => {
		return (
			<div className="text-left text-xs">
				<p className="text-base">What is Ecosystem?</p>
				Ecosystem is a trusted network of organizations
				<br />
				that empowers people and businesses with safe
				<br />
				and secure ways of identifying themselves online
				<br />
				and communicating confidentially with others.
				<br />
				Examples are supply chain, marketplace, healthcare,
				<br />
				banking, etc. where participants exchange
				<br />
				information in an interoperable & trusted manner.
			</div>
		);
	};

	const ToolTipDataForSchema = () => {
		return (
			<div className="text-left text-xs">
				<p className="text-base">What is Schema?</p>
				Schema is a machine-readable semantic structure,
				<br />a predefined data template that provides a
				<br />
				standard format for the digital credential
				<br />
				contents. Schemas define attributes that are
				<br />
				used in one or more Credential Definitions.
				<br />
				Schemas are stored on the ledger.
			</div>
		);
	};

	const ToolTipDataForCredDef = () => {
		return (
			<div className="text-left text-xs">
				<p className="text-base">What is Credential Definition?</p>
				A Credential Definition is a machine-readable
				<br />
				definition of any Schema or in simple terms,
				<br />a tag created specific to an issuer and Schema.
				<br />
				Credentials are always issued by an issuer
				<br />
				using Cred-Def created by them.
				<br />
				Credential Definitions are stored on the ledger.
			</div>
		);
	};

	return (
		<div className="px-4 pt-6">
			<div className="cursor-pointer">
				<AlertComponent
					message={message || error}
					type={message ? 'warning' : 'failure'}
					viewButton={viewButton}
					path={pathRoutes.users.invitations}
					onAlertClose={() => {
						setMessage(null);
						setError(null);
					}}
				/>
			</div>
			<div className="cursor-pointer">
				<AlertComponent
					message={ecoMessage}
					type={'warning'}
					viewButton={viewButton}
					path={pathRoutes.ecosystem.invitation}
					onAlertClose={() => {
						setEcoMessage(null);
						setError(null);
					}}
				/>
			</div>
			{walletData && walletData.length > 0 ? (
				<></>
			) : (
				<div
					className="p-8 grid w-full grid-cols-1 sm:grid-cols-3 gap-4 mt-0 mb-4 rounded-md border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:bg-[url('/images/bg-darkwallet.png')] bg-[url('/images/bg-lightwallet.png')] bg-cover bg-center bg-no-repeat p-0"
					style={{ minHeight: '130px' }}
				>
					{walletLoading ? (
						<></>
					) : (
						<>
							<div className="sm:col-span-2 w-full flex justify-between">
								<div className="flex text-start items-center">
									<div>
										<p className="text-xl font-medium dark:text-white">
											Wallet lets you create schemas and credential-definitions
										</p>
										<span className="flex justify-start items-start text-sm font-normal text-gray-500 dark:text-gray-400">
											Please create wallet for your organisation which would
											help you to issue and verify credentials for your users.
										</span>
									</div>
								</div>
							</div>
							<div className="flex text-center justify-start sm:justify-end items-center mr-8">
								<Button
									className="min-w-[180px] sm:col-span-1 group flex h-min text-center justify-center items-center p-0.5 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 w-fit sm:px-4 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-md hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
									onClick={() => goToOrgDashboard('', [])}
								>
									Create wallet
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
									>
										<g clip-path="url(#clip0_9624_8899)">
											<path
												d="M9.99984 6L8.58984 7.41L13.1698 12L8.58984 16.59L9.99984 18L15.9998 12L9.99984 6Z"
												fill="white"
											/>
										</g>
										<defs>
											<clipPath id="clip0_9624_8899">
												<rect width="24" height="24" fill="white" />
											</clipPath>
										</defs>
									</svg>
								</Button>
							</div>
						</>
					)}
				</div>
			)}
			<div
				className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-3"
				style={{ minHeight: '300px' }}
			>
				<div
					className="xl:col-span-2 justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
					style={{ minHeight: '300px' }}
				>
					<div className="w-full relative h-full">
						<div className="flex justify-between pb-2 flex text-center">
							<div className="flex text-center justify-center items-center">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white items-center">
									Organizations{' '}
								</h2>
								<Tooltip
									content={<ToolTipDataForOrganization />}
									placement="bottom"
									className="items-center text-center dark:text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="none"
										viewBox="0 0 20 20"
										className="ml-3 dark:text-white text-primary-700"
									>
										<path
											fill="currentColor"
											d="M9.168 14.167h1.667v-5H9.168v5Zm.833-6.667c.236 0 .434-.08.594-.24a.803.803 0 0 0 .24-.593.806.806 0 0 0-.24-.594.807.807 0 0 0-.594-.24.806.806 0 0 0-.593.24.806.806 0 0 0-.24.594c0 .236.08.434.24.594.16.16.357.24.593.24Zm0 10.834a8.115 8.115 0 0 1-3.25-.657 8.415 8.415 0 0 1-2.646-1.78 8.416 8.416 0 0 1-1.78-2.647A8.115 8.115 0 0 1 1.667 10c0-1.152.219-2.236.656-3.25a8.416 8.416 0 0 1 1.781-2.646 8.415 8.415 0 0 1 2.646-1.78A8.115 8.115 0 0 1 10 1.667c1.153 0 2.236.219 3.25.656a8.415 8.415 0 0 1 2.646 1.781 8.416 8.416 0 0 1 1.781 2.646 8.115 8.115 0 0 1 .657 3.25 8.115 8.115 0 0 1-.657 3.25 8.416 8.416 0 0 1-1.78 2.646 8.415 8.415 0 0 1-2.647 1.781 8.115 8.115 0 0 1-3.25.657Zm0-1.667c1.861 0 3.438-.646 4.73-1.938 1.291-1.291 1.937-2.868 1.937-4.729 0-1.86-.646-3.437-1.938-4.729-1.291-1.292-2.868-1.937-4.729-1.937-1.86 0-3.437.645-4.729 1.937-1.292 1.292-1.937 2.868-1.937 4.73 0 1.86.645 3.437 1.937 4.729 1.292 1.291 2.868 1.937 4.73 1.937Z"
										/>
									</svg>
								</Tooltip>
							</div>
							<div
								className="bg-primary-700 rounded-md text-lg"
								style={{ minWidth: '44px' }}
							>
								<span className="flex justify-center items-center text-white p-2 text-lg font-medium">
									{orgCount ?? 0}
								</span>
							</div>
						</div>
						<hr />
						{!orgLoading ? (
							<>
								{organizationsList && organizationsList?.length > 0 ? (
									<>
										{' '}
										{organizationsList?.map((org) => {
											const roles: string[] = org.userOrgRoles.map(
												(role) => role.orgRole.name,
											);
											org.roles = roles;
											return (
												<button
													className="flex justify-between w-full mt-2 items-center"
													key={org?.id}
												>
													<button
														className="sm:w-100/11rem w-full"
														onClick={() =>
															goToOrgDashboard(org?.id, org?.roles)
														}
													>
														<a
															href="#"
															className="flex items-center py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white rounded-md mr-2"
														>
															{org.logoUrl ? (
																<CustomAvatar
																	className="dark:text-white shrink-0"
																	size="40"
																	src={org?.logoUrl}
																	round
																/>
															) : (
																<CustomAvatar
																	className="dark:text-white shrink-0"
																	size="40"
																	name={org?.name}
																	round
																/>
															)}

															<span className="ml-3 text-lg font-bold text-gray-500 dark:text-white text-start truncate">
																{org?.name}
															</span>
														</a>
													</button>
													<div className="hidden sm:flex space-x-3 items-center">
														<Tooltip
															content={'Create Schema'}
															placement="bottom"
															className="items-center text-center dark:text-white"
														>
															{' '}
															<button
																onClick={() => {
																	goToOrgSchema(org, org.id, org.roles);
																}}
																className="p-1 rounded-md"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="24"
																	height="24"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<path
																		fill="#6B7280"
																		d="M7.596 2.5a.487.487 0 0 0-.476.498v5.544c0 .275.213.498.476.498h8.808a.487.487 0 0 0 .476-.498V2.998a.487.487 0 0 0-.476-.498H7.596Zm.475.997h7.858v4.546H8.071V3.497Zm1.553.354a.487.487 0 0 0-.481.498c0 .278.216.502.481.498h4.752a.487.487 0 0 0 .482-.498.487.487 0 0 0-.482-.498H9.624Zm0 1.345a.487.487 0 0 0-.481.499c0 .278.216.502.481.498h4.752a.487.487 0 0 0 .482-.498.487.487 0 0 0-.482-.499H9.624Zm0 1.346a.487.487 0 0 0-.481.498c0 .278.216.502.481.498h4.752a.487.487 0 0 0 .482-.498.487.487 0 0 0-.482-.498H9.624ZM12 9.427a.487.487 0 0 0-.475.498v2.746H4.559a.487.487 0 0 0-.475.498v3.244c0 .275.213.498.475.498a.487.487 0 0 0 .476-.498v-2.745h6.49v2.745c0 .275.213.498.475.498a.487.487 0 0 0 .475-.498v-2.745h6.49v2.745c0 .275.213.498.476.498a.487.487 0 0 0 .475-.498v-3.244a.487.487 0 0 0-.476-.498h-6.965V9.925A.487.487 0 0 0 12 9.427ZM1.975 17.41a.487.487 0 0 0-.475.498v3.094c0 .275.213.498.475.498h5.169a.487.487 0 0 0 .475-.498v-3.094a.487.487 0 0 0-.475-.498H1.975Zm7.44 0a.487.487 0 0 0-.475.498v3.094c0 .275.213.498.476.498h5.168a.487.487 0 0 0 .476-.498v-3.094a.487.487 0 0 0-.476-.498H9.416Zm7.441 0a.487.487 0 0 0-.475.498v3.094c0 .275.213.498.475.498h5.169a.487.487 0 0 0 .475-.498v-3.094a.487.487 0 0 0-.475-.498h-5.169Zm-14.406.996h4.22v2.097H2.45v-2.097Zm7.44 0h4.22v2.097H9.89v-2.097Zm7.441 0h4.219v2.097h-4.22v-2.097Z"
																	/>
																</svg>
															</button>
														</Tooltip>
														<Tooltip
															content={'Create Cred-def'}
															placement="bottom"
															className="items-center text-center dark:text-white"
														>
															<button
																onClick={() => {
																	goToOrgCredDef(org, org.id, org.roles);
																}}
																className="p-1 rounded-md"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="24"
																	height="24"
																	viewBox="0 0 24 24"
																	fill="none"
																>
																	<path
																		d="M15 9H18.75M15 12H18.75M15 15H18.75M4.5 19.5H19.5C20.0967 19.5 20.669 19.2629 21.091 18.841C21.5129 18.419 21.75 17.8467 21.75 17.25V6.75C21.75 6.15326 21.5129 5.58097 21.091 5.15901C20.669 4.73705 20.0967 4.5 19.5 4.5H4.5C3.90326 4.5 3.33097 4.73705 2.90901 5.15901C2.48705 5.58097 2.25 6.15326 2.25 6.75V17.25C2.25 17.8467 2.48705 18.419 2.90901 18.841C3.33097 19.2629 3.90326 19.5 4.5 19.5ZM10.5 9.375C10.5 9.62123 10.4515 9.86505 10.3573 10.0925C10.263 10.32 10.1249 10.5267 9.95083 10.7008C9.77672 10.8749 9.57002 11.013 9.34253 11.1073C9.11505 11.2015 8.87123 11.25 8.625 11.25C8.37877 11.25 8.13495 11.2015 7.90747 11.1073C7.67998 11.013 7.47328 10.8749 7.29917 10.7008C7.12506 10.5267 6.98695 10.32 6.89273 10.0925C6.7985 9.86505 6.75 9.62123 6.75 9.375C6.75 8.87772 6.94754 8.40081 7.29917 8.04918C7.65081 7.69754 8.12772 7.5 8.625 7.5C9.12228 7.5 9.59919 7.69754 9.95082 8.04918C10.3025 8.40081 10.5 8.87772 10.5 9.375ZM11.794 15.711C10.8183 16.2307 9.72947 16.5017 8.624 16.5C7.5192 16.5014 6.4311 16.2304 5.456 15.711C5.69429 15.0622 6.12594 14.5023 6.69267 14.1067C7.25939 13.7111 7.93387 13.499 8.625 13.499C9.31613 13.499 9.99061 13.7111 10.5573 14.1067C11.1241 14.5023 11.5557 15.0622 11.794 15.711Z"
																		stroke="#6B7280"
																		stroke-width="1.8"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</svg>
															</button>
														</Tooltip>
														<Tooltip
															content={'Issue Credentials'}
															placement="bottom"
															className="items-center text-center dark:text-white"
														>
															{' '}
															<button
																onClick={() => {
																	goToOrgIssuance(org, org.id, org.roles);
																}}
																className="p-1 rounded-md"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="26"
																	height="24"
																	fill="none"
																	viewBox="0 0 26 24"
																>
																	<path
																		fill="#6B7280"
																		stroke="#6B7280"
																		stroke-width=".5"
																		d="M23.4 3H10.6A1.6 1.6 0 0 0 9 4.6v8c.002.298.088.59.25.84l-.77.501c-.26.17-.563.26-.874.259H7.29a.797.797 0 0 0-.689-.4H1.8a.8.8 0 0 0-.8.8v4.8a.8.8 0 0 0 .8.8h4.8a.797.797 0 0 0 .689-.4h8.875a2.412 2.412 0 0 0 2.146-1.325l2.137-4.275H23.4a1.6 1.6 0 0 0 1.6-1.6v-8A1.6 1.6 0 0 0 23.4 3ZM1.8 19.4v-4.8h4.8v4.8H1.8Zm15.794-1.28a1.606 1.606 0 0 1-1.43.88H7.4v-4h.206a2.4 2.4 0 0 0 1.31-.389l6.617-4.303a.713.713 0 0 1 .864.095.696.696 0 0 1 .013.97l-3.387 3.76-.003.003-.717.796a.399.399 0 0 0 .029.565.4.4 0 0 0 .565-.029l.602-.668h2.717a1.193 1.193 0 0 0 .935-.448l.924-1.152h1.48l-1.961 3.92ZM14.94 14.2h2.11l-.52.65a.397.397 0 0 1-.314.15h-1.997l.72-.8Zm9.26-1.6a.8.8 0 0 1-.8.8h-7.74l.72-.8h3.42a.4.4 0 1 0 0-.8h-2.714A1.483 1.483 0 0 0 17 9.883V9.8a.4.4 0 0 0-.4-.4.392.392 0 0 0-.234.084 1.509 1.509 0 0 0-1.268.153l-.116.075a.394.394 0 0 0-.665-.195.4.4 0 0 0-.117.283v.42l-4.284 2.787A.79.79 0 0 1 9.8 12.6v-8a.8.8 0 0 1 .8-.8h12.8a.8.8 0 0 1 .8.8v8Z"
																	/>
																	<path
																		fill="#6B7280"
																		stroke="#6B7280"
																		stroke-width=".1"
																		d="M13.05 5.3v-.05h-.85a.45.45 0 0 0-.45.45v.45h1.3V5.3ZM11.8 6.85h-.05v.45a.45.45 0 0 0 .45.45h.85v-.9H11.8Zm1.95.85v.05h.85a.45.45 0 0 0 .45-.45V5.7a.45.45 0 0 0-.45-.45h-.85V7.7ZM12.2 4.55h2.4a1.15 1.15 0 0 1 1.15 1.15v1.6a1.15 1.15 0 0 1-1.15 1.15h-2.4a1.15 1.15 0 0 1-1.15-1.15V5.7a1.15 1.15 0 0 1 1.15-1.15Z"
																	/>
																	<path
																		fill="#6B7280"
																		stroke="#6B7280"
																		stroke-width=".2"
																		d="M11.4 9.297a.4.4 0 0 0-.4.4v.8a.4.4 0 1 0 .8 0v-.8a.4.4 0 0 0-.4-.4Zm1.602 0a.4.4 0 0 0-.4.4v.4a.4.4 0 1 0 .8 0v-.4a.4.4 0 0 0-.4-.4Zm5.198 0a.4.4 0 0 0-.4.4v.8a.4.4 0 1 0 .8 0v-.8a.4.4 0 0 0-.4-.4Zm1.598 0a.4.4 0 0 0-.4.4v.8a.4.4 0 0 0 .8 0v-.8a.4.4 0 0 0-.4-.4Z"
																	/>
																</svg>
															</button>
														</Tooltip>
														<Tooltip
															content={'Verify Credentials'}
															placement="bottom"
															className="items-center text-center dark:text-white"
														>
															{' '}
															<button
																onClick={() => {
																	goToOrgCredVerification(
																		org,
																		org.id,
																		org.roles,
																	);
																}}
																className="p-1 rounded-md"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	width="24"
																	height="24"
																	fill="none"
																	viewBox="0 0 24 24"
																>
																	<path
																		fill="#6B7280"
																		d="M3.444 21a2.428 2.428 0 0 1-1.726-.677C1.24 19.873 1 19.33 1 18.697V6.607c0-.634.24-1.176.718-1.627a2.428 2.428 0 0 1 1.726-.677h5.134a3.486 3.486 0 0 1 1.329-1.67A3.639 3.639 0 0 1 12 2a3.64 3.64 0 0 1 2.093.633 3.486 3.486 0 0 1 1.33 1.67h5.133c.672 0 1.247.226 1.726.677.479.45.718.993.718 1.626v12.091c0 .633-.24 1.175-.718 1.627a2.428 2.428 0 0 1-1.726.676H3.444Zm-.271-2.111h17.66V6.222H3.172V18.89ZM12 5.742a.92.92 0 0 0 .657-.244.814.814 0 0 0 .26-.62.814.814 0 0 0-.26-.618.92.92 0 0 0-.657-.245.92.92 0 0 0-.657.245.814.814 0 0 0-.26.619c0 .25.087.456.26.619a.92.92 0 0 0 .657.244Z"
																	/>
																	<g clip-path="url(#a)">
																		<path
																			fill="#6B7280"
																			d="m16.031 20.297-.89-1.5-1.688-.375.164-1.735-1.148-1.312 1.148-1.313-.164-1.734 1.688-.375.89-1.5 1.594.68 1.594-.68.89 1.5 1.688.375-.164 1.735 1.148 1.312-1.148 1.313.164 1.734-1.688.375-.89 1.5-1.594-.68-1.594.68Zm.399-1.195 1.195-.516 1.219.516.656-1.125 1.29-.305-.118-1.313.867-.984-.867-1.008.117-1.312-1.289-.282-.68-1.125-1.195.516-1.219-.516-.656 1.125-1.29.282.118 1.312-.867 1.008.867.984-.117 1.336 1.289.282.68 1.125Zm.703-2.063 2.648-2.648-.656-.68-1.992 1.992-1.008-.984-.656.656 1.664 1.664Z"
																		/>
																	</g>
																	<defs>
																		<clipPath id="a">
																			<path
																				fill="#fff"
																				d="M10 9.75h11.25V21H10z"
																			/>
																		</clipPath>
																	</defs>
																</svg>
															</button>
														</Tooltip>
													</div>
												</button>
											);
										})}
										{organizationsList && organizationsList?.length > 0 && (
											<a
												href="/organizations"
												className="absolute bottom-0 sm:bottom-[-13px] right-0 float-right inline-flex items-center text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
											>
												View All
											</a>
										)}{' '}
									</>
								) : (
									<div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-500">
										<p>You have no organisations created or joined</p>
									</div>
								)}
							</>
						) : (
							<div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-500">
								<CustomSpinner />
							</div>
						)}
					</div>
				</div>
				<div
					style={{ minHeight: '300px' }}
					className="xl:col-span-1 justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<div className="w-full relative h-full">
						<div className="flex justify-between pb-2 flex text-center">
							<div className="flex text-center justify-center items-center">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white items-center">
									Schemas
								</h2>
								<Tooltip
									content={<ToolTipDataForSchema />}
									placement="bottom"
									className="items-center text-center dark:text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="none"
										viewBox="0 0 20 20"
										className="ml-3 dark:text-white text-primary-700"
									>
										<path
											fill="currentColor"
											d="M9.168 14.167h1.667v-5H9.168v5Zm.833-6.667c.236 0 .434-.08.594-.24a.803.803 0 0 0 .24-.593.806.806 0 0 0-.24-.594.807.807 0 0 0-.594-.24.806.806 0 0 0-.593.24.806.806 0 0 0-.24.594c0 .236.08.434.24.594.16.16.357.24.593.24Zm0 10.834a8.115 8.115 0 0 1-3.25-.657 8.415 8.415 0 0 1-2.646-1.78 8.416 8.416 0 0 1-1.78-2.647A8.115 8.115 0 0 1 1.667 10c0-1.152.219-2.236.656-3.25a8.416 8.416 0 0 1 1.781-2.646 8.415 8.415 0 0 1 2.646-1.78A8.115 8.115 0 0 1 10 1.667c1.153 0 2.236.219 3.25.656a8.415 8.415 0 0 1 2.646 1.781 8.416 8.416 0 0 1 1.781 2.646 8.115 8.115 0 0 1 .657 3.25 8.115 8.115 0 0 1-.657 3.25 8.416 8.416 0 0 1-1.78 2.646 8.415 8.415 0 0 1-2.647 1.781 8.115 8.115 0 0 1-3.25.657Zm0-1.667c1.861 0 3.438-.646 4.73-1.938 1.291-1.291 1.937-2.868 1.937-4.729 0-1.86-.646-3.437-1.938-4.729-1.291-1.292-2.868-1.937-4.729-1.937-1.86 0-3.437.645-4.729 1.937-1.292 1.292-1.937 2.868-1.937 4.73 0 1.86.645 3.437 1.937 4.729 1.292 1.291 2.868 1.937 4.73 1.937Z"
										/>
									</svg>
								</Tooltip>
							</div>
							<div
								className="bg-primary-700 rounded-md text-lg"
								style={{ minWidth: '44px' }}
							>
								<span className="flex justify-center items-center text-white p-2 text-lg font-medium">
									{schemaCount ?? 0}
								</span>
							</div>
						</div>
						<hr />

						{!schemaLoading ? (
							<>
								{schemaList && schemaList?.length > 0 ? (
									<div>
										{' '}
										{schemaList?.map((schema) => {
											return (
												<button
													className="flex justify-between w-full mt-4 items-center"
													key={schema?.id}
												>
													<button
														className="w-full"
														onClick={() =>
															goToSchemaCredDef(schema?.schemaLedgerId)
														}
													>
														<a
															href="#"
															className="flex items-center space-x-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white rounded-md"
														>
															<span className="ml-3 text-lg font-bold text-gray-500 dark:text-white text-primary-700 text-start">
																{schema?.name}
															</span>
															<span className="items-center font-normal text-md justify-start dark:text-white text-gray-600 truncate">
																{schema?.version}
															</span>
														</a>
													</button>
												</button>
											);
										})}
										{schemaList && schemaList?.length > 0 && (
											<a
												href="/organizations/schemas"
												className="absolute bottom-0 sm:bottom-[-13px] right-0 float-right inline-flex items-center text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700 mt-1"
											>
												View All
											</a>
										)}
									</div>
								) : (
									<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
										<p>You have no schemas created</p>
									</div>
								)}
							</>
						) : (
							<div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-500">
								<CustomSpinner />
							</div>
						)}
					</div>
				</div>
			</div>
			<div
				className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-3"
				style={{ minHeight: '300px' }}
			>
				<div
					className="xl:col-span-2 justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
					style={{ minHeight: '300px' }}
				>
					<div className="w-full relative h-full">
						<div className="flex justify-between pb-2 flex text-center">
							<div className="flex text-center justify-center items-center">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white items-center">
									Ecosystems{' '}
								</h2>
								<Tooltip
									content={<ToolTipDataForEcosystem />}
									placement="bottom"
									className="items-center text-center dark:text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="none"
										viewBox="0 0 20 20"
										className="ml-3 dark:text-white text-primary-700"
									>
										<path
											fill="currentColor"
											d="M9.168 14.167h1.667v-5H9.168v5Zm.833-6.667c.236 0 .434-.08.594-.24a.803.803 0 0 0 .24-.593.806.806 0 0 0-.24-.594.807.807 0 0 0-.594-.24.806.806 0 0 0-.593.24.806.806 0 0 0-.24.594c0 .236.08.434.24.594.16.16.357.24.593.24Zm0 10.834a8.115 8.115 0 0 1-3.25-.657 8.415 8.415 0 0 1-2.646-1.78 8.416 8.416 0 0 1-1.78-2.647A8.115 8.115 0 0 1 1.667 10c0-1.152.219-2.236.656-3.25a8.416 8.416 0 0 1 1.781-2.646 8.415 8.415 0 0 1 2.646-1.78A8.115 8.115 0 0 1 10 1.667c1.153 0 2.236.219 3.25.656a8.415 8.415 0 0 1 2.646 1.781 8.416 8.416 0 0 1 1.781 2.646 8.115 8.115 0 0 1 .657 3.25 8.115 8.115 0 0 1-.657 3.25 8.416 8.416 0 0 1-1.78 2.646 8.415 8.415 0 0 1-2.647 1.781 8.115 8.115 0 0 1-3.25.657Zm0-1.667c1.861 0 3.438-.646 4.73-1.938 1.291-1.291 1.937-2.868 1.937-4.729 0-1.86-.646-3.437-1.938-4.729-1.291-1.292-2.868-1.937-4.729-1.937-1.86 0-3.437.645-4.729 1.937-1.292 1.292-1.937 2.868-1.937 4.73 0 1.86.645 3.437 1.937 4.729 1.292 1.291 2.868 1.937 4.73 1.937Z"
										/>
									</svg>
								</Tooltip>
							</div>
							<div
								className="bg-primary-700 rounded-md text-lg"
								style={{ minWidth: '44px' }}
							>
								<span className="flex justify-center items-center text-white p-2 text-lg font-medium">
									{ecoCount ?? 0}
								</span>
							</div>
						</div>
						<hr />

						{!ecoLoading ? (
							<>
								{ecosystemList && ecosystemList.length > 0 ? (
									<>
										{ecosystemList?.map((ecosystem: any) => {
											return (
												<button
													className="flex justify-between w-full mt-2 items-center"
													key={ecosystem?.id}
												>
													<button
														className="w-full flex items-center"
														onClick={() => goToEcoDashboard(ecosystem?.id)}
													>
														<a
															href="#"
															className="flex items-center py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white rounded-md mr-2"
														>
															{ecosystem.logoUrl ? (
																<CustomAvatar
																	className="dark:text-white shrink-0"
																	size="40"
																	src={ecosystem?.logoUrl}
																	round={false}
																/>
															) : (
																<CustomAvatar
																	className="dark:text-white shrink-0"
																	size="40"
																	name={ecosystem?.name}
																	round={false}
																/>
															)}

															<span className="ml-3 text-lg font-bold text-gray-500 dark:text-white text-start truncate">
																{ecosystem?.name}
															</span>
														</a>
													</button>
													<div className="hidden sm:flex space-x-3 items-center">
														<Tooltip
															content={'Invite'}
															placement="bottom"
															className="items-center text-center dark:text-white"
														>
															{' '}
															{isEcosystemLead && (
																<button
																	onClick={() => {
																		navigateToInvitation();
																	}}
																	className="rounded-md flex items-center"
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="28"
																		height="28"
																		viewBox="0 0 24 24"
																		fill="none"
																	>
																		<path
																			d="M21.25 0.5H5.75C4.65 0.5 3.75 1.4 3.75 2.5V3.25C3.75 3.525 3.975 3.75 4.25 3.75C4.525 3.75 4.75 3.525 4.75 3.25V2.5C4.75 2.4 4.775 2.3 4.8 2.2L10.4 7L4.8 11.8C4.775 11.7 4.75 11.6 4.75 11.5V10.75C4.75 10.475 4.525 10.25 4.25 10.25C3.975 10.25 3.75 10.475 3.75 10.75V11.5C3.75 12.6 4.65 13.5 5.75 13.5H21.25C22.35 13.5 23.25 12.6 23.25 11.5V2.5C23.25 1.4 22.35 0.5 21.25 0.5ZM5.55 1.525C5.6 1.5 5.675 1.5 5.75 1.5H21.25C21.325 1.5 21.4 1.5 21.45 1.525L13.825 8.05C13.625 8.2 13.375 8.2 13.175 8.05L5.55 1.525ZM21.25 12.5H5.75C5.675 12.5 5.6 12.5 5.55 12.475L11.175 7.65L12.525 8.825C12.8 9.075 13.15 9.2 13.5 9.2C13.85 9.2 14.2 9.075 14.475 8.825L15.825 7.65L21.45 12.475C21.4 12.5 21.325 12.5 21.25 12.5ZM22.25 11.5C22.25 11.6 22.225 11.7 22.2 11.8L16.6 7L22.2 2.2C22.225 2.3 22.25 2.4 22.25 2.5V11.5ZM2.25 5.75C2.25 5.475 2.475 5.25 2.75 5.25H5.75C6.025 5.25 6.25 5.475 6.25 5.75C6.25 6.025 6.025 6.25 5.75 6.25H2.75C2.475 6.25 2.25 6.025 2.25 5.75ZM5.75 8.75H1.25C0.975 8.75 0.75 8.525 0.75 8.25C0.75 7.975 0.975 7.75 1.25 7.75H5.75C6.025 7.75 6.25 7.975 6.25 8.25C6.25 8.525 6.025 8.75 5.75 8.75Z"
																			fill="#6B7280"
																			stroke="#6B7280"
																			stroke-width="0.3"
																		/>
																	</svg>
																</button>
															)}
														</Tooltip>
													</div>
												</button>
											);
										})}

										{ecosystemList && ecosystemList?.length > 0 && (
											<a
												href="/ecosystems"
												className="absolute bottom-0 sm:bottom-[-13px] right-0 float-right inline-flex items-center text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
											>
												View All
											</a>
										)}
									</>
								) : (
									<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
										<p>You have no ecosystems created or joined</p>
									</div>
								)}
							</>
						) : (
							<div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-500">
								<CustomSpinner />
							</div>
						)}
					</div>
				</div>
				<div
					className="xl:col-span-1 justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
					style={{ minHeight: '300px' }}
				>
					<div className="w-full relative h-full">
						<div className="flex justify-between pb-2 flex text-center">
							<div className="flex text-center justify-center items-center">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white items-center">
									Cred - def
								</h2>
								<Tooltip
									content={<ToolTipDataForCredDef />}
									placement="bottom"
									className="items-center text-center dark:text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="none"
										viewBox="0 0 20 20"
										className="ml-3 dark:text-white text-primary-700"
									>
										<path
											fill="currentColor"
											d="M9.168 14.167h1.667v-5H9.168v5Zm.833-6.667c.236 0 .434-.08.594-.24a.803.803 0 0 0 .24-.593.806.806 0 0 0-.24-.594.807.807 0 0 0-.594-.24.806.806 0 0 0-.593.24.806.806 0 0 0-.24.594c0 .236.08.434.24.594.16.16.357.24.593.24Zm0 10.834a8.115 8.115 0 0 1-3.25-.657 8.415 8.415 0 0 1-2.646-1.78 8.416 8.416 0 0 1-1.78-2.647A8.115 8.115 0 0 1 1.667 10c0-1.152.219-2.236.656-3.25a8.416 8.416 0 0 1 1.781-2.646 8.415 8.415 0 0 1 2.646-1.78A8.115 8.115 0 0 1 10 1.667c1.153 0 2.236.219 3.25.656a8.415 8.415 0 0 1 2.646 1.781 8.416 8.416 0 0 1 1.781 2.646 8.115 8.115 0 0 1 .657 3.25 8.115 8.115 0 0 1-.657 3.25 8.416 8.416 0 0 1-1.78 2.646 8.415 8.415 0 0 1-2.647 1.781 8.115 8.115 0 0 1-3.25.657Zm0-1.667c1.861 0 3.438-.646 4.73-1.938 1.291-1.291 1.937-2.868 1.937-4.729 0-1.86-.646-3.437-1.938-4.729-1.291-1.292-2.868-1.937-4.729-1.937-1.86 0-3.437.645-4.729 1.937-1.292 1.292-1.937 2.868-1.937 4.73 0 1.86.645 3.437 1.937 4.729 1.292 1.291 2.868 1.937 4.73 1.937Z"
										/>
									</svg>
								</Tooltip>
							</div>
							<div
								className="bg-primary-700 rounded-md text-lg"
								style={{ minWidth: '44px' }}
							>
								<span className="flex justify-center items-center text-white p-2 text-lg font-medium">
									{credDefCount ?? 0}
								</span>
							</div>
						</div>
						<hr />

						{!credDefLoading ? (
							<>
								{credDefList && credDefList.length > 0 ? (
									<>
										{' '}
										{credDefList?.map((cred: ICredDef) => {
											return (
												<button
													className="flex justify-between w-full mt-4 items-center"
													key={cred?.id}
												>
													<button
														className="w-full"
														onClick={() => goToCredDef(cred?.schemaLedgerId)}
													>
														<a
															href="#"
															className="flex items-center space-x-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white rounded-md"
														>
															<span className="ml-3 text-lg font-bold text-gray-500 text-start dark:text-white text-primary-700 shrink-0">
																{cred?.tag}
															</span>
															<span className="truncate text-md font-normal dark:text-white text-gray-600">
																{cred?.credentialDefinitionId}
															</span>
														</a>
													</button>
												</button>
											);
										})}
									</>
								) : (
									<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
										<p>You have no cred-defs created</p>
									</div>
								)}{' '}
							</>
						) : (
							<div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-500">
								<CustomSpinner />
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="">
				<div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 xl:mb-0">
					<div className="items-start justify-start mb-4">
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
							Recent Activity
						</h3>
						<hr />
					</div>

					{!loading ? (
						<>
							{activityList && activityList?.length > 0 ? (
								<ol className="relative border-l pl-8 border-gray-200 dark:border-gray-700">
									{activityList.map((activity) => (
										<li className="mb-10 ml-4" key={activity.id}>
											<div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"></div>
											<time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
												<DateTooltip date={activity.createDateTime}>
													{dateConversion(activity.createDateTime)}
												</DateTooltip>
											</time>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
												{activity.action}
											</h3>
											<p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
												{activity.details}
											</p>
										</li>
									))}
								</ol>
							) : (
								<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
									<p>Looks like there is no activity yet</p>
								</div>
							)}
						</>
					) : (
						<div className="flex items-center justify-center h-full dark:text-gray-400 text-gray-500">
							<CustomSpinner />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
export default UserDashBoard;
