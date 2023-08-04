import type { Connection, OrgAgent, Organisation } from './interfaces'
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import { Spinner } from 'flowbite-react';
import { apiStatusCodes } from '../../config/CommonConstant';
import { createConnection } from '../../api/organization';
import CustomQRCode from '../../commonComponents/QRcode';

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
            <div className='w-1/2'>
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
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
                                        >
                                            Wallet Name:
                                        </p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
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
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
                                        >
                                            Org DID:
                                        </p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
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
                                            className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
                                        >
                                            Created On:
                                        </p>
                                        <p
                                            className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
                                        >
                                            {agentData?.agents_type.createDateTime.split("T")[0]}
                                        </p>

                                    </div>
                                </div>
                            </li>
                        </ul>

                    </div>
                </div>
            </div>
            <div className='w-1/2 float-right flex items-center'>
                {
                    loading
                        ? (
                            <Spinner
                                color="info"
                            />
                        )
                        : <div>
                            <CustomQRCode value={connectionData?.connectionInvitation as string} size={180} />
                        </div>

                }
            </div>

        </div>
    )

}

export default OrganizationDetails