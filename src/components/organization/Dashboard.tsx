import type { OrgDashboard, Organisation } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getEcosystems, getOrgDashboard, getOrganizationById } from '../../api/organization';
import { useEffect, useState } from 'react';
import { Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomAvatar from '../Avatar/index';
import CustomSpinner from '../CustomSpinner';
import EditOrgdetailsModal from './EditOrgdetailsModal';
import OrganizationDetails from './OrganizationDetails';
import { Roles } from '../../utils/enums/roles';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { pathRoutes } from '../../config/pathRoutes';
import { AlertComponent } from '../AlertComponent';
import WalletSpinup from './walletCommonComponents/WalletSpinup';
import DashboardCard from '../../commonComponents/DashboardCard';
import { envConfig } from '../../config/envConfig';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};


const Dashboard = () => {
	const [orgData, setOrgData] = useState<Organisation | null>(null);
	const [walletStatus, setWalletStatus] = useState<boolean>(false);
	const [orgDashboard, setOrgDashboard] = useState<OrgDashboard | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean | null>(true);
	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [orgSuccess, setOrgSuccess] = useState<string | null>(null);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [ecoCount, setEcoCount] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [redirectToEndorsment, setRedirectToEndorsment] = useState<boolean>();
	const [ecosystemUserRoles, setEcosystemUserRoles] = useState<string>('');



	const EditOrgDetails = () => {
		setOpenModal(true);
	};

	const deleteOrgDetails = () => {
		window.location.href = pathRoutes.organizations.deleteOrganization
	};

	const getUserRoles = async () => {
		const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
		const roles = orgRoles.split(',');
		setUserRoles(roles);
	};
	
	useEffect(() => {
		getUserRoles();
	}, []);

	
	const fetchOrganizationDetails = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const orgInfoData = await getFromLocalStorage(storageKeys.ORG_INFO);
		const response = await getOrganizationById(orgId as string);
		const { data } = response as AxiosResponse;
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {			
			
			if (data?.data?.org_agents?.length > 0 && data?.data?.org_agents[0]?.orgDid) {
				setWalletStatus(true);
			}
			
			setOrgData(data?.data);
				
			const organizationData = orgInfoData ? JSON.parse(orgInfoData) : {};
			const {id, name, description, logoUrl} = data?.data || {};
			const orgInfo = {
				...organizationData,
				...id && { id },
				...name && { name },
				...description && { description },
				...logoUrl && { logoUrl }
			}
			await setToLocalStorage(storageKeys.ORG_INFO, orgInfo);

		} else {
			setFailure(response as string);
		}
		setLoading(false);
	};

	const fetchEcosystems = async () => {
		let organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
	  
		if (organizationId) {
		  const response = await getEcosystems(
			organizationId,
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
		);
		  const { data } = response as AxiosResponse;	  
		  if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setEcoCount(data?.data?.totalItems);
			const ecosystems = data?.data?.ecosystemList;
			let isLead = false;
	  
			ecosystems.forEach((ecosystem: any) => {
			  ecosystem.ecosystemOrgs.forEach((org: any) => {
				const role = org.ecosystemRole?.name;
				if (role === 'Ecosystem Lead') {
				  isLead = true;
				}
			  });
			});
			if (!isLead && ecoCount > 0) {
			  setRedirectToEndorsment(true);
			}
		  } else {
			setError(response as string);
		  }
		}
	  };  
	

	const fetchOrganizationDashboard = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if(orgId){
			const response = await getOrgDashboard(orgId as string);
			const { data } = response as AxiosResponse;
			setLoading(false);

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setOrgDashboard(data?.data);
			} else {
				setFailure(response as string);
			}
		}
		setLoading(false);
	};	

	useEffect(() => {
		fetchOrganizationDetails();
		fetchOrganizationDashboard();
		fetchEcosystems();
	}, []);

	const handleEditModalClose = () => {
		setOpenModal(false);
		fetchOrganizationDetails();
		window.location.reload();
	};

	useEffect(() => {
		setTimeout(() => {
			setSuccess(null);
			setFailure(null);
		}, 3000);
	}, [success !== null, failure !== null]);

	const setWalletSpinupStatus = (status: boolean) => {
		setSuccess('Wallet created successfully');
		fetchOrganizationDetails();
	};

	const redirectOrgUsers = () => {
		window.location.href = pathRoutes.organizations.users;
	};
	
		

	return (
		<div className="px-4 pt-2 w-full">
			<div className="col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div className="w-full">
				{orgSuccess && (
					<div className="w-full" role="alert">
						<AlertComponent
							message={orgSuccess}
							type={'success'}
							onAlertClose={() => {
								setOrgSuccess(null);
							}}
						/>
					</div>
				)}
			</div>
			<div className="mt-4 w-full">
				<div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
					<div className="relative w-full">
						<div className="items-center block sm:flex flex-wrap break-normal w-full sm:space-x-4 justify-center sm:justify-start">
							<div>
								{orgData?.logoUrl ? (
									<CustomAvatar className='text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium' size="80px" src={orgData?.logoUrl} round />
								) : (
									<CustomAvatar className='text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium' size="80px" name={orgData?.name} round/>
								)}
							</div>
							<div className="sm:w-100/12rem mt-2">
								{orgData ? (
									<div className="break-normal">
										<h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
											{orgData?.name}
										</h3>

										<p className="mb-1 text-base font-normal text-gray-900 dark:text-white break-all">
											{orgData?.description}
										</p>

										<p className="mb-1 text-base font-normal text-gray-900 dark:text-white">
											Profile view :
											<span className="font-semibold">
												{orgData?.publicProfile ? ' Public' : ' Private'}
											</span>
										</p>
									</div>
								) : (
									<CustomSpinner />
								)}
							</div>
						</div>
						
						<div className='absolute top-0 right-0 flex' >
						

						 <div>
                             {(userRoles.includes(Roles.OWNER) ||
							userRoles.includes(Roles.ADMIN)) && (
							<div className="">
								<button type="button">
									<svg
										aria-hidden="true"
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
										color="#3558A8"
										onClick={EditOrgDetails}
									>
										<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
										<path
											fillRule="evenodd"
											d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
											clipRule="evenodd"
										></path>
									</svg>
								</button>
							</div>
						)}
						</div>
						<div>
							{
								userRoles.includes(Roles.OWNER) && (
									<div className='ml-4'>
										<button onClick={deleteOrgDetails}>
										<img src="/images/delete_button_image.svg" width={20} height={20} alt="" />
                                       </button>

									</div>
								)
							}
							</div>
						</div>					
					</div>

					<EditOrgdetailsModal
						openModal={openModal}
						setOpenModal={setOpenModal}
						onEditSucess={handleEditModalClose}
						setMessage={(message: string) => {
							setOrgSuccess(message);
						}}
						orgData={orgData}
					/>
				</div>

				<div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<div className="grid w-full grid-cols-1 gap-4 mt-0 xl:grid-cols-3 2xl:grid-cols-3">
						<DashboardCard
							icon={'/images/users-icon.svg'}
							backgroundColor="linear-gradient(279deg, #FFF -18.24%, #2F80ED -0.8%, #1F4EAD 61.45%)"
							label="Users"
							value={orgDashboard?.usersCount ?? 0}
							onClickHandler={redirectOrgUsers}
						/>

						<DashboardCard
							icon={'/images/schema-icon.svg'}
							classes={!walletStatus ? 'pointer-events-none' : ''}
							backgroundColor="linear-gradient(279deg, #FFF -28.6%, #5AC2E8 21.61%, #0054FF 68.63%)"
							label="Schemas"
							value={orgDashboard?.schemasCount ?? 0}
							onClickHandler={() => {
								if (walletStatus && !redirectToEndorsment) {
									window.location.href = pathRoutes.organizations.schemas;
								}
								else if(walletStatus && redirectToEndorsment) {
									window.location.href = `${envConfig.PUBLIC_ECOSYSTEM_FRONT_END_URL}${pathRoutes.organizations.schemas}`
								}
							}}
						/>
						<DashboardCard
							icon={'/images/cred-icon.svg'}
							backgroundColor="linear-gradient(279deg, #FFF -34.06%, #FFC968 43.71%, #FEB431 111.13%)"
							label="Credentials"
							value={orgDashboard?.credentialsCount ?? 0}
						/>
					</div>
				</div>

				{(success || failure) && (
					<Alert
						color={success ? 'success' : 'failure'}
						onDismiss={() => setFailure(null)}
					>
						<span>
							<p>{success || failure}</p>
						</span>
					</Alert>
				)}
				{loading ? (
					<div className="flex items-center justify-center m-4">
						<CustomSpinner />
					</div>
				) : (
					walletStatus === true ? (
						<OrganizationDetails orgData={orgData}  />

					) : (
						(userRoles.includes(Roles.OWNER) ||
							userRoles.includes(Roles.ADMIN)) && (
							<WalletSpinup
								orgName={orgData?.name || ''}
								setWalletSpinupStatus={(flag: boolean) =>
									setWalletSpinupStatus(flag)
								}
							/>
						)
					))}
			</div>
		</div>
	);
};

export default Dashboard;
