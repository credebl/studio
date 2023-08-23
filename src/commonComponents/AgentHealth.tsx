import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

import { getAgentHealth } from '../api/Agent';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { getFromLocalStorage } from '../api/Auth';
import { Spinner } from 'flowbite-react';

interface Agent {
    label: string;
    endpoints: string[];
    isInitialized: boolean;
}

const AgentHealth = () => {
    const [agentHealthDetails, setAgentHealthDetails] = useState<Agent>();
    const [loader, setLoader] = useState<boolean>(true);
    const [agentErrMessage, setAgentErrMessage] = useState<string>('');

    useEffect(() => {
        getAgentHealthDetails();
    }, []);

    const getAgentHealthDetails = async () => {
        try {
            const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
            const agentData = await getAgentHealth(Number(organizationId));
            const { data } = agentData as AxiosResponse;
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setAgentHealthDetails(data?.data);
                setLoader(false);
            } else {
                setLoader(false);
                setAgentErrMessage(agentData as string);
            }
        } catch (error) {
            setLoader(false);
            console.error("An error occurred:", error);
        }
    };

    return (
        <div className='pr-4'>
            {loader ? (
                <div>
                    <Spinner color="info" />
                </div>
            ) : (
                agentHealthDetails?.isInitialized ? (
                    <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                        <div className="w-2 h-2 mr-1 bg-green-500 rounded-full" />
                        SSI Agent is up and running
                    </div>
                ) : (
                    <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                        <span className="w-2 h-2 mr-1 bg-red-500 rounded-full" />
                        {/* {agentErrMessage} */}
                        SSI Agent is not running
                    </span>
                )
            )}
        </div>
    );
};

export default AgentHealth;
