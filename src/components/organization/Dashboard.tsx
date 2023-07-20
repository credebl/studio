import { Alert, Avatar, Spinner } from 'flowbite-react';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { useEffect, useState } from 'react';

import { Avatar } from 'flowbite-react';
import CustomAvatar from '../Avatar';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import type { Organisation } from './interfaces'
import OrganizationDetails from './OrganizationDetails';
import WalletSpinup from './WalletSpinup';
import { getFromLocalStorage } from '../../api/Auth';
import Credential_Card from '../../assets/Credential_Card.svg';
import User_Card from '../../assets/User_Card.svg';
import Invitation_Card from '../../assets/Invitation_Card.svg';
import Schema_Card from '../../assets/Schema_Card.svg';

import { getOrganizationById } from '../../api/organization';

const Dashboard = () => {
    const [orgData, setOrgData] = useState<Organisation | null>(null);

    const [walletStatus, setWalletStatus] = useState<boolean>(false);

    const [orgLogo, setOrgLogo] = useState<Array<Organisation> | null>(null)

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

    useEffect(() => {
        fetchOrganizationDetails();
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
        setSuccess('Agent spined up successfully')
        fetchOrganizationDetails()
    }

    const redirectOrgUsers = () => {
        // setToLocalStorage(storageKeys.ORG_ID, orgId.toString())
        window.location.href = '/organizations/users'
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
                    className="mt-4 items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >

                    <div
                        className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
                    ><div>
                        </div>
                        <div>
                            {(orgData?.logoUrl) ? <CustomAvatar size='60' src={orgData?.logoUrl} /> : <CustomAvatar size='60' name={orgData?.name} />}
                        </div>
                        <div>
                            <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                Dashboard:{orgData?.name}
                            </h3>

                            <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                                {orgData?.description}
                            </p>

                        </div>
                    </div>
                </div>

                <div
                    className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                    <div
                        className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-3 2xl:grid-cols-4"
                    >
                         <div
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${User_Card})` }} 
                        >
                            <div className="w-full" onClick={redirectOrgUsers}>
                                <h3 className="text-base font-medium text-white">
                                    Users
                                </h3>
                                <span
                                    className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >2,340</span
                                >

                            </div>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-10 h-10">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg> */}


                        </div>
                        <div
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${Invitation_Card})` }}
                        >
                            <div className="w-full">
                                <h3 className="text-base font-medium text-white">
                                    Invitations
                                </h3>
                                <span
                                    className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >134</span
                                >
                            </div>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg> */}

                        </div>
                        
                        <div
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover"style={{ backgroundImage: `url(${Schema_Card})` }}
                            onClick={() => {
                                window.location.href = `/organizations/schemas`;
                            }}
                        >
                            <div className="w-full">
                                <h3 className="text-base font-medium text-white">
                                    Schemas
                                </h3>
                                <span
                                    className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >2,340</span
                                >

                            </div>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-10 h-10">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                            </svg> */}

                        </div>
                        <div
                        
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${Credential_Card})` }} 
                            >
                                
                            <div className="w-full" >
                                
                                <h3 className="text-base font-medium text-white">
                                    
                                    New Credentials
                                </h3>
                                <span
                                
                                    className="text-2xl font-semi-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >2,340</span
                                >

                            </div>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-10 h-10">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg> */}


                        </div>
                       
                        
                    </div>

                </div>


                {
                    loading
                        ? (<div className="flex items-center justify-center m-4">
                            <Spinner
                                color="info"
                            />
                        </div>)
                        : walletStatus === true
                            ? (<OrganizationDetails orgData={orgData} />)
                            : (<WalletSpinup setWalletSpinupStatus={(flag: boolean) => setWalletSpinupStatus(flag)} />)

                }
              
            </div>
        </div>
    )

}

export default Dashboard