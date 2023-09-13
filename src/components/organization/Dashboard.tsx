import type { OrgDashboard, Organisation } from './interfaces'
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getOrgDashboard, getOrganizationById } from '../../api/organization';
import { useEffect, useState } from 'react';

import { Alert } from 'flowbite-react';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import Credential_Card from '../../assets/Credential_Card.svg';
import CustomAvatar from '../Avatar';
import CustomSpinner from '../CustomSpinner';
import EditOrgdetailsModal from './EditOrgdetailsModal';
import OrganizationDetails from './OrganizationDetails';
import WalletSpinup from './WalletSpinup';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrganizationById } from '../../api/organization';
import { pathRoutes } from '../../config/pathRoutes';
import React from 'react';

const Dashboard = () => {
    const [orgData, setOrgData] = useState<Organisation | null>(null);

    const [walletStatus, setWalletStatus] = useState<boolean>(false);

    const [orgDashboard, setOrgDashboard] = useState<OrgDashboard | null>(null)
    const [success, setSuccess] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null)

    const [loading, setLoading] = useState<boolean | null>(true)

    const [openModal, setOpenModal] = useState<boolean>(false);
    const props = { openModal, setOpenModal };


    const EditOrgDetails = () => {
        props.setOpenModal(true)
    }


    const updateOrganizationData = (updatedData: Organisation) => {
        setOrgData(updatedData);
    };



    const fetchOrganizationDetails = async () => {

        setLoading(true)

        const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

        const response = await getOrganizationById(orgId as string);

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            console.log(data?.data);

            if(data?.data?.org_agents && data?.data?.org_agents?.length > 0){
                console.log(`IF COndition`);
                
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
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">

                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">

                </h1>
            </div>
            <div>

                <div
                    className="mt-4 flex flex-wrap items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >

                    <div
                        className="items-center flex flex-wrap"
                    >
                        <div className='mr-4'>
                            {(orgData?.logoUrl) ? <CustomAvatar size='60' src={orgData?.logoUrl} /> : <CustomAvatar size='60' name={orgData?.name} />}
                        </div>
                        <div>
                            <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                {orgData?.name}
                            </h3>

                            <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                                {orgData?.description}
                            </p>

                        </div>
                    </div>
                    <div className="inline-flex items-center">
                        <button type="button" className=""

                        >
                            <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5"
                                fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg" color='#3558A8'
                                onClick={EditOrgDetails}><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                                >
                                </path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>

                        </button>
                    </div>


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
                        className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-3 2xl:grid-cols-4"
                    >
                        <div
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${User_Card})`, minHeight: '133px' }}
                        >
                            <div className="w-full" onClick={redirectOrgUsers}>
                                <h3 className="text-base font-medium text-white">
                                    Users
                                </h3>
                                <span
                                    className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >{orgDashboard?.usersCount}</span
                                >

                            </div>
                        </div>

                        <div
                            className={`items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover ${!walletStatus ? 'pointer-events-none' : ''}`}
                            style={{ backgroundImage: `url(${Schema_Card})`, minHeight: '133px' }}
                            onClick={() => {
                                if (walletStatus) {
                                    window.location.href = pathRoutes.organizations.schemas;
                                }
                            }}
                        > 
                            <div className="w-full">
                                <h3 className="text-base font-medium text-white">
                                    Schemas
                                </h3>
                                <span className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white">
                                    {orgDashboard?.schemasCount}
                                </span>
                            </div>
                        </div>
                        <div

                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${Credential_Card})`, minHeight: '133px' }}
                        >

                            <div className="w-full" >

                                <h3 className="text-base font-medium text-white">

                                    Credentials
                                </h3>
                                <span

                                    className="text-2xl font-semi-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >{orgDashboard?.credentialsCount}</span
                                >

                            </div>
                        </div>
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
                            <CustomSpinner/>
                        </div>)
                        : walletStatus === true
                            ? (<OrganizationDetails orgData={orgData} />)
                            : (<WalletSpinup orgName={orgData?.name} setWalletSpinupStatus={(flag: boolean) => setWalletSpinupStatus(flag)} />)

                }

            </div>
        </div>
    )

}

export default Dashboard
