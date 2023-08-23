
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';


import { getAgentHealth } from '../api/Agent';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { getFromLocalStorage } from '../api/Auth';

interface Agent {
    label: string;
    endpoints: string[];
    isInitialized: boolean;
  }

const AgentHealth = () => {
    const [agentHealthDetails, setAgentHealthDetails] = useState<Agent>({
        label: "",
        endpoints: [],
        isInitialized: false
      });

    const [isAgentActive, setIsAgentActive] = useState<boolean>(false);  

    useEffect(() => {
        getAllorgs()
    }, []);

    const getAllorgs = async () => {
        const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
        const response = await getAgentHealth(Number(organizationId));
        const { data } = response as AxiosResponse;
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            setAgentHealthDetails(data?.data)
            setIsAgentActive(data?.data?.isInitialized)

        } else {
            console.log("data?.data?.organizations")
        }
    };

console.log("AgentHealthDetails::::", agentHealthDetails)

    return (
        <>
            {(<span
                className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
            >
                <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                SSI Agent is Up and Running
            </span>)}
        </>
    );
};

export default AgentHealth;
