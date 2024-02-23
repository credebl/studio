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

interface IProps {
    agent: Agent
    orgId: string
}

const AgentHealth = ({ agent, orgId }: IProps) => {
    const [agentHealthDetails, setAgentHealthDetails] = useState<Agent>(agent);
    const [loader, setLoader] = useState<boolean>(true);
    const [agentErrMessage, setAgentErrMessage] = useState<string>('');
    const [checkOrgExist, setCheckOrgExist] = useState<string>(orgId);

    useEffect(() => {
        getAgentHealthDetails();
    }, []);

    const getAgentHealthDetails = async () => {
        try {
            const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
            if (organizationId) {
                setCheckOrgExist(organizationId)
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
                setLoader(false);
                console.error("Organization not created yet")
            }

        } catch (error) {
            setLoader(false);
            console.error("An error occurred:", error);
        }
    };
    return (
        <div className=''>
            {checkOrgExist && (
                <>
                    {loader && !(agentHealthDetails?.isInitialized) ? (
                        <div>
                            <CustomSpinner />
                        </div>
                    ) : (
                        agentHealthDetails?.isInitialized ? (
                            <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                <div className="w-2 h-2 mr-1 bg-green-500 rounded-full" />
                                Wallet Agent is up and running
                            </div>
                        ) : (
                            <span title={agentErrMessage} className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                <div className="w-2 h-2 mr-1 bg-red-500 rounded-full" />
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