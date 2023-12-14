import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import CustomSpinner from '../components/CustomSpinner';
import { getAgentHealth } from '../api/Agent';
import { getFromLocalStorage } from '../api/Auth';

interface Agent {
    label: string;
    endpoints: string[];
    isInitialized: boolean;
}

const AgentHealth = () => {
    const [agentHealthDetails, setAgentHealthDetails] = useState<Agent>();
    const [loader, setLoader] = useState<boolean>(true);
    const [agentErrMessage, setAgentErrMessage] = useState<string>('');
    const [checkOrgExist, setCheckOrgExist] = useState<number>(0);

    useEffect(() => {
        setTimeout(() => {
            getAgentHealthDetails();
        }, 4000)
    }, []);

    const getAgentHealthDetails = async () => {
        try {
            const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
            setCheckOrgExist(Number(organizationId))
            if (Number(organizationId) !== 0) {
                const agentData = await getAgentHealth(organizationId);
                const { data } = agentData as AxiosResponse;
                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    setAgentHealthDetails(data?.data);
                    setLoader(false);
                } else {
                    setLoader(false);
                    setAgentErrMessage(agentData as string);
                }
            } else {
                console.error("Organization not created yet")
            }

        } catch (error) {
            setLoader(false);
            console.error("An error occurred:", error);
        }
    };
    return (
        <div className=''>
            {checkOrgExist !== 0 && (
                <>
                    {loader ? (
                        <div>
                            <CustomSpinner/>
                        </div>
                    ) : (
                        agentHealthDetails?.isInitialized ? (
                            <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                <div className="w-2 h-2 mr-1 bg-green-500 rounded-full" />
                                Wallet Agent is up and running
                            </div>
                        ) : (
                            <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                <span className="w-2 h-2 mr-1 bg-red-500 rounded-full" />
                                {/* {agentErrMessage} */}
                                Wallet Agent is not running
                            </span>
                        )
                    )}
                </>
            )}
        </div>

    );
};

export default AgentHealth;