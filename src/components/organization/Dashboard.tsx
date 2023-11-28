import type { OrgDashboard, Organisation } from './interfaces'
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getOrgDashboard, getOrganizationById } from '../../api/organization';
import { useEffect, useState } from 'react';

import { Alert, Dropdown } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import credIcon from '../../assets/cred-icon.svg';
import CustomAvatar from '../Avatar';
import CustomSpinner from '../CustomSpinner';
import EditOrgdetailsModal from './EditOrgdetailsModal';
import OrganizationDetails from './OrganizationDetails';
import { Roles } from '../../utils/enums/roles';
import schemaCard from '../../assets/schema-icon.svg';
import userCard from '../../assets/users-icon.svg';
import WalletSpinup from './WalletSpinup';
import { getFromLocalStorage } from '../../api/Auth';
import { pathRoutes } from '../../config/pathRoutes';
import DashboardCard from '../../commonComponents/DashboardCard';
import DeleteOrgModal from './DeleteOrgPopup';

const Dashboard = () => {
    const [orgData, setOrgData] = useState<Organisation | null>(null);
    const [walletStatus, setWalletStatus] = useState<boolean>(false);
    const [orgDashboard, setOrgDashboard] = useState<OrgDashboard | null>(null)
    const [success, setSuccess] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean | null>(true)
    const [userRoles, setUserRoles] = useState<string[]>([])
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [dropdownOpen, setDropdownOpen] = useState(true);

    const props = { openModal, setOpenModal };

    const EditOrgDetails = () => {
        props.setOpenModal(true)
    }

    const DeleteOrgAndWalletDetails = () => {
        setDeleteModalOpen(true)
    }

    const updateOrganizationData = (updatedData: Organisation) => {
        setOrgData(updatedData);
    };

    const getUserRoles = async () => {
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        const roles = orgRoles.split(',')
        setUserRoles(roles)
    }

    useEffect(() => {
        getUserRoles()
    }, [])


    const fetchOrganizationDetails = async () => {

        setLoading(true)

        const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

        const response = await getOrganizationById(orgId as string);

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
                setWalletStatus(true)
            }
            setOrgData(data?.data)
        } else {
            setFailure(response as string)
        }
        setLoading(false)

    }

    const fetchOrganizationDashboard = async () => {

        setLoading(true)

        const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

        const response = await getOrgDashboard(orgId as string);

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            setOrgDashboard(data?.data)

        } else {
            setFailure(response as string)
        }
        setLoading(false)

    }

    useEffect(() => {
        fetchOrganizationDetails();
        fetchOrganizationDashboard()
    }, [])

    useEffect(() => {
        setTimeout(() => {
            setSuccess(null)
            setFailure(null)
        }, 3000);
    }, [success !== null, failure !== null])

    const redirectDashboardInvitations = () => {
        window.location.href = '/organizations/invitations'
    }

    const setWalletSpinupStatus = (status: boolean) => {
        setSuccess('Wallet created successfully')
        fetchOrganizationDetails()
    }

    const redirectOrgUsers = () => {
        window.location.href = pathRoutes.organizations.users
    }

    return (
			<div className="px-4 pt-2">
				<div className="col-span-full xl:mb-2">
					<BreadCrumbs />
				</div>
				<div className="mt-4">
					<div className="flex flex-wrap items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800">
						<div className="items-center flex flex-wrap">
							<div className="mr-4">
								{orgData?.logoUrl ? (
									<CustomAvatar size="80" src={orgData?.logoUrl} />
								) : (
									<CustomAvatar size="90" name={orgData?.name} />
								)}
							</div>
							{orgData ? (
								<div>
									<h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
										{orgData?.name}
									</h3>

									<p className="mb-1 text-base font-normal text-gray-900 dark:text-white">
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

						{(userRoles.includes(Roles.OWNER) ||
							userRoles.includes(Roles.ADMIN)) && (
							<div className="inline-flex items-center ml-auto">
								{dropdownOpen ? (
									<Dropdown
										className="w-148 h-87"
										label={'test'}
										renderTrigger={() => (
											<svg
												className="ml-4 w-4 h-4 text-gray-800 cursor-pointer dark:text-white"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="currentColor"
												viewBox="0 0 4 15"
											>
												<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
											</svg>
										)}
										dismissOnClick={true}
									>
										<Dropdown.Item
											onClick={() => {
												EditOrgDetails();
											}}
										>
											<div className="flex justify-between">
												<svg
													aria-hidden="true"
                                                    width="18"
                                                    height="19"
													className="mr-1 -ml-1 w-5 h-5 mt-1"
													fill="currentColor"
													viewBox="0 0 20 20"
													xmlns="http://www.w3.org/2000/svg"
													color="#3558A8"
													onClick={EditOrgDetails}
												>
													<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
													<path
														fill-rule="evenodd"
														d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
														clip-rule="evenodd"
													></path>
												</svg>
												<span className="text-primary-700 text-xl">Edit</span>
											</div>
										</Dropdown.Item>
										<hr className='mx-2'/>
										<Dropdown.Item className='hover:bg-red-600 hover:text-white'>
											<div className="flex justify-between text-red-500 hover:text-white">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="mr-1 -ml-1 w-5 h-5 mt-1 text-xl hover:text-white"
													width="19"
													height="18"
													viewBox="0 0 15 18"
													fill="none"
													onClick={DeleteOrgAndWalletDetails}
												>
													<path
														d="M9.80045 6.98438C9.56761 6.98438 9.37891 7.17308 9.37891 7.40592V15.3731C9.37891 15.6058 9.56761 15.7947 9.80045 15.7947C10.0333 15.7947 10.222 15.6058 10.222 15.3731V7.40592C10.222 7.17308 10.0333 6.98438 9.80045 6.98438Z"
														fill="#FF0002"
													/>
													<path
														d="M4.8278 6.98438C4.59496 6.98438 4.40625 7.17308 4.40625 7.40592V15.3731C4.40625 15.6058 4.59496 15.7947 4.8278 15.7947C5.06063 15.7947 5.24934 15.6058 5.24934 15.3731V7.40592C5.24934 7.17308 5.06063 6.98438 4.8278 6.98438Z"
														fill="#FF0002"
													/>
													<path
														d="M1.19725 5.35877V15.7447C1.19725 16.3586 1.42235 16.9351 1.81557 17.3487C2.20699 17.7635 2.7517 17.999 3.32177 18H11.2975C11.8678 17.999 12.4125 17.7635 12.8037 17.3487C13.1969 16.9351 13.422 16.3586 13.422 15.7447V5.35877C14.2037 5.15129 14.7102 4.39614 14.6057 3.59405C14.5009 2.79213 13.8177 2.19225 13.0089 2.19209H10.8506V1.66516C10.8531 1.22204 10.6779 0.796544 10.3642 0.483514C10.0505 0.170649 9.62436 -0.00356726 9.18124 5.53875e-05H5.43806C4.99494 -0.00356726 4.56879 0.170649 4.2551 0.483514C3.94141 0.796544 3.76621 1.22204 3.76868 1.66516V2.19209H1.6104C0.801563 2.19225 0.118365 2.79213 0.0136372 3.59405C-0.0909256 4.39614 0.415586 5.15129 1.19725 5.35877ZM11.2975 17.1569H3.32177C2.60103 17.1569 2.04034 16.5378 2.04034 15.7447V5.39582H12.579V15.7447C12.579 16.5378 12.0183 17.1569 11.2975 17.1569ZM4.61176 1.66516C4.60896 1.44566 4.69525 1.23439 4.85102 1.07944C5.00663 0.924489 5.21839 0.839357 5.43806 0.843144H9.18124C9.4009 0.839357 9.61266 0.924489 9.76827 1.07944C9.92405 1.23423 10.0103 1.44566 10.0075 1.66516V2.19209H4.61176V1.66516ZM1.6104 3.03517H13.0089C13.428 3.03517 13.7677 3.37488 13.7677 3.79395C13.7677 4.21303 13.428 4.55273 13.0089 4.55273H1.6104C1.19133 4.55273 0.851621 4.21303 0.851621 3.79395C0.851621 3.37488 1.19133 3.03517 1.6104 3.03517Z"
														fill="#FF0002"
													/>
													<path
														d="M7.30826 6.98438C7.07543 6.98438 6.88672 7.17308 6.88672 7.40592V15.3731C6.88672 15.6058 7.07543 15.7947 7.30826 15.7947C7.5411 15.7947 7.72981 15.6058 7.72981 15.3731V7.40592C7.72981 7.17308 7.5411 6.98438 7.30826 6.98438Z"
														fill="#FF0002"
													/>
												</svg>
												<span className="text-red-500 text-xl hover:text-white">Delete</span>
											</div>
										</Dropdown.Item>
									</Dropdown>
								) : (
									<svg
										className="ml-4 w-4 h-4 text-gray-800 cursor-pointer dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 4 15"
									>
										<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
									</svg>
								)}
							</div>
						)}

						<EditOrgdetailsModal
							orgData={orgData}
							openModal={openModal}
							setOpenModal={props.setOpenModal}
							onEditSucess={fetchOrganizationDetails}
							setMessage={(message: string) => {
								throw new Error('Function not implemented.');
							}}
						/>
						<DeleteOrgModal
							openModal={isDeleteModalOpen}
							onClose={() => setDeleteModalOpen(false)}
						/>
					</div>

					<div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
						<div className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-3 2xl:grid-cols-3">
							<DashboardCard
								icon={userCard}
								backgroundColor="linear-gradient(279deg, #FFF -18.24%, #2F80ED -0.8%, #1F4EAD 61.45%)"
								label="Users"
								value={orgDashboard?.usersCount ?? 0}
								onClickHandler={redirectOrgUsers}
							/>

							<DashboardCard
								icon={schemaCard}
								classes={!walletStatus ? 'pointer-events-none' : ''}
								backgroundColor="linear-gradient(279deg, #FFF -28.6%, #5AC2E8 21.61%, #0054FF 68.63%)"
								label="Schemas"
								value={orgDashboard?.schemasCount ?? 0}
								onClickHandler={() => {
									if (walletStatus) {
										window.location.href = pathRoutes.organizations.schemas;
									}
								}}
							/>
							<DashboardCard
								icon={credIcon}
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
					) : walletStatus === true ? (
						<OrganizationDetails orgData={orgData} />
					) : (
						(userRoles.includes(Roles.OWNER) ||
							userRoles.includes(Roles.ADMIN)) && (
							<WalletSpinup
								orgName={orgData?.name}
								setWalletSpinupStatus={(flag: boolean) =>
									setWalletSpinupStatus(flag)
								}
							/>
						)
					)}
				</div>
			</div>
		);

}

export default Dashboard
