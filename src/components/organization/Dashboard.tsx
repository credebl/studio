import { Alert, Avatar, Spinner } from 'flowbite-react';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import Credential_Card from '../../assets/Credential_Card.svg';
import CustomAvatar from '../Avatar';
import Invitation_Card from '../../assets/Invitation_Card.svg';
import type { Organisation } from './interfaces'
import OrganizationDetails from './OrganizationDetails';
import Schema_Card from '../../assets/Schema_Card.svg';
import User_Card from '../../assets/User_Card.svg';
import WalletSpinup from './WalletSpinup';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrganizationById } from '../../api/organization';

const Dashboard = () => {
    const [orgData, setOrgData] = useState<Organisation | null>(null);

    const [walletStatus, setWalletStatus] = useState<boolean>(false);

    const [orgLogo, setOrgLogo] = useState<Array<Organisation> | null>(null)
    const [success, setSuccess] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null)

    const [loading, setLoading] = useState<boolean | null>(true)

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
                                {orgData?.name}
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
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${User_Card})`, minHeight:'122px' }} 
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
                        </div>
                        <div
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${Invitation_Card})`, minHeight:'122px' }}
                        >
                            <div className="w-full" onClick={redirectDashboardInvitations}>
                                <h3 className="text-base font-medium text-white">
                                    Sent Invitations
                                </h3>
                                <span
                                    className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                >134</span
                                >
                            </div>                         

                        </div>
                        
                        <div
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover"style={{ backgroundImage: `url(${Schema_Card})`, minHeight:'122px' }}
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

                        </div>
                        <div
                        
                            className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${Credential_Card})`, minHeight:'122px' }} 
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