import type { Connection, OrgAgent, Organisation } from './interfaces'
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import CustomQRCode from '../../commonComponents/QRcode';
import { Spinner } from 'flowbite-react';
import { apiStatusCodes } from '../../config/CommonConstant';
import { createConnection } from '../../api/organization';

const OrganizationDetails = ({ orgData }: { orgData: Organisation | null }) => {

    const { org_agents } = orgData as Organisation
    const agentData: OrgAgent | null = org_agents.length > 0 ? org_agents[0] : null
    const [loading, setLoading] = useState<boolean>(true)
    const [connectionData, setConnectionData] = useState<Connection | null>(null)

    const createQrConnection = async () => {

        setLoading(true)
        const response = await createConnection(orgData?.name as string);
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            setConnectionData(data?.data)

        }
        setLoading(false)
    }

    useEffect(() => {
        createQrConnection()
    }, [])

    return (
        <div
            className="mt-4 w-full flex-wrap p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >
            <div className='w-full sm:w-1/2 mb-4 sm:mb-0 sm:pr-4'>
                <h3 className="mb-1 mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    Wallet Details
                </h3>
                <div
                    className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
                >
                    <div>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">

                            <li className="py-4">
                                <div className="flex items-center space-x-4">

                                    <div className="inline-flex min-w-0">
                                        <p
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-20 md:w-32 lg:w-40"
                                        >
                                            Wallet Name
                                        </p>
                                        <p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">:</p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-40 md:w-32 lg:w-80"
                                        >
                                            {agentData?.walletName}
                                        </p>

                                    </div>
                                </div>
                            </li>
                            <li className="py-4">
                                <div className="flex items-center space-x-4">

                                    <div className="inline-flex min-w-0">
                                        <p
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-20 md:w-32 lg:w-40"

                                        >
                                            Org DID
                                        </p>
                                        <p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">:</p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-40 md:w-32 lg:w-80"
                                        >
                                            {agentData?.orgDid}
                                        </p>

                                    </div>
                                </div>
                            </li>

                            <li className="py-4">
                                <div className="flex items-center space-x-4">

                                    <div className="inline-flex min-w-0">
                                        <p
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-20 md:w-32 lg:w-40"

                                        >
                                            Network
                                        </p>
                                        <p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">:</p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-40 md:w-32 lg:w-80"
                                        >
                                            {agentData?.ledgers ? agentData?.ledgers?.name : `-`}
                                        </p>

                                    </div>
                                </div>
                            </li>

                            <li className="py-4">
                                <div className="flex items-center space-x-4">

                                    <div className="inline-flex min-w-0">
                                        <p
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-20 md:w-32 lg:w-40"

                                        >
                                            Wallet Type
                                        </p>
                                        <p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">:</p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-40 md:w-32 lg:w-80"
                                        >
                                            {agentData?.org_agent_type?.agent
                                                ? agentData?.org_agent_type?.agent?.charAt(0).toUpperCase() +
                                                agentData?.org_agent_type?.agent?.slice(1).toLowerCase()
                                                : ''}

                                        </p>

                                    </div>
                                </div>
                            </li>
                            <li className="py-4">
                                <div className="flex items-center space-x-4">

                                    <div className="inline-flex min-w-0">
                                        <p
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-20 md:w-32 lg:w-40"

                                        >
                                            Created On
                                        </p>
                                        <p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">:</p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-40 md:w-32 lg:w-80"
                                        >
                                            {agentData?.createDateTime ? agentData?.createDateTime?.split("T")[0] : new Date().toISOString().split("T")[0]}

                                        </p>

                                    </div>
                                </div>
                            </li>
                        </ul>

                    </div>
                </div>
            </div>
            <div className='w-full sm:w-1/2 flex flex-col justify-center text-wrap'>
                {
                    loading
                        ? (
                            <Spinner
                                color="info"
                            />
                        )
                        : connectionData && <div>
                            <CustomQRCode value={connectionData?.connectionInvitation as string} size={180} />
                        </div>

                }
            </div>

        </div>
    )

}

export default OrganizationDetails