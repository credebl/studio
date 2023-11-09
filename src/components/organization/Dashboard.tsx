import type { OrgDashboard, Organisation } from './interfaces'
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getOrgDashboard, getOrganizationById } from '../../api/organization';
import { useEffect, useState } from 'react';

import { Alert } from 'flowbite-react';
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

const Dashboard = () => {
    const [orgData, setOrgData] = useState<Organisation | null>(null);

    const [walletStatus, setWalletStatus] = useState<boolean>(false);

    const [orgDashboard, setOrgDashboard] = useState<OrgDashboard | null>(null)
    const [success, setSuccess] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null)

    const [loading, setLoading] = useState<boolean | null>(true)
    const [userRoles, setUserRoles] = useState<string[]>([])

    const [openModal, setOpenModal] = useState<boolean>(false);
    const props = { openModal, setOpenModal };


    const EditOrgDetails = () => {
        props.setOpenModal(true)
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
            <div className='mt-4'>
                <div
                    className="flex flex-wrap items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >

                    <div
                        className="items-center flex flex-wrap"
                    >

                        <div className='mr-4'>
                            {(orgData?.logoUrl) ? <CustomAvatar size='80' src={orgData?.logoUrl} /> : <CustomAvatar size='90' name={orgData?.name} />}
                        </div>
                        {orgData ?
                            <div>
                                <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                    {orgData?.name}
                                </h3>

                                <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                                    {orgData?.description}
                                </p>

                                <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                                    Profile view :
                                    <span className='font-semibold'>
                                        {orgData?.publicProfile ? " Public" : " Private"}
                                    </span>
                                </p>

                            </div>
                            :
                            <CustomSpinner />
                        }
                    </div>

                    {
                        (userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN))
                        && <div className="inline-flex items-center">
                            <button type="button"
                            >
                                <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5"
                                    fill="currentColor" viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg" color='#3558A8'
                                    onClick={EditOrgDetails}><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                                    >
                                    </path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>

                            </button>
                        </div>
                    }

                    <EditOrgdetailsModal
                        orgData={orgData}
                        openModal={openModal}
                        setOpenModal={
                            props.setOpenModal
                        }
                        onEditSucess={fetchOrganizationDetails}
                        setMessage={(message: string) => {
                            throw new Error('Function not implemented.');
                        }}

                    />



                </div>

                <div
                    className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                    <div
                        className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-3 2xl:grid-cols-3"
                    >
                        <DashboardCard icon={userCard} backgroundColor="linear-gradient(279deg, #FFF -18.24%, #2F80ED -0.8%, #1F4EAD 61.45%)" label="Users" value={orgDashboard?.usersCount ?? 0} onClickHandler={redirectOrgUsers} />

                        <DashboardCard icon={schemaCard} classes={!walletStatus ? 'pointer-events-none' : ''} backgroundColor="linear-gradient(279deg, #FFF -28.6%, #5AC2E8 21.61%, #0054FF 68.63%)" label="Schemas" value={orgDashboard?.schemasCount ?? 0} onClickHandler={() => {
                            if (walletStatus) {
                                window.location.href = pathRoutes.organizations.schemas;
                            }
                        }} />
                        <DashboardCard icon={credIcon} backgroundColor="linear-gradient(279deg, #FFF -34.06%, #FFC968 43.71%, #FEB431 111.13%)" label="Credentials" value={orgDashboard?.credentialsCount ?? 0} />
                    </div>
                </div>

                {
                    (success || failure) &&
                    <Alert
                        color={success ? "success" : "failure"}
                        onDismiss={() => setFailure(null)}
                    >
                        <span>
                            <p>
                                {success || failure}
                            </p>
                        </span>
                    </Alert>
                }
                {
                    loading
                        ? (<div className="flex items-center justify-center m-4">
                            <CustomSpinner />
                        </div>)
                        : walletStatus === true
                            ? (<OrganizationDetails orgData={orgData} />)
                            : ((userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN))
                                && <WalletSpinup orgName={orgData?.name} setWalletSpinupStatus={(flag: boolean) => setWalletSpinupStatus(flag)} />)


                }

            </div>
        </div>
    )

}

export default Dashboard
