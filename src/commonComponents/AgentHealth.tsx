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
	const [checkOrgExist, setCheckOrgExist] = useState<number>(0);

	useEffect(() => {
		setTimeout(() => {
			getAgentHealthDetails();
		}, 2000);
	}, []);

	const getAgentHealthDetails = async () => {
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setCheckOrgExist(Number(organizationId));
			if (Number(organizationId) !== 0) {
				const agentData = await getAgentHealth(organizationId);
				const { data } = agentData as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setAgentHealthDetails(data?.data);
					setLoader(false);
				} else {
					setLoader(false);
				}
			} else {
				console.error('Organization not created yet');
			}
		} catch (error) {
			setLoader(false);
			console.error('An error occurred:', error);
		}
	};
	return (
		<div className="">
			{checkOrgExist !== 0 && (
				<>
					{loader ? (
						<div>
							<CustomSpinner />
						</div>
					) : agentHealthDetails?.isInitialized ? (
						<div className="w-fit flex shrink-0 items-center bg-green-100 text-green-800 text-xs font-medium rounded-full p-2 md:p-1 dark:bg-green-900 dark:text-green-300">
							<div className="w-1 h-1 bg-green-500 rounded-full p-1 shrink-0 md:mr-1" />
							<span className="w-fit mr-1 shrink-0 md:block hidden rounded-full dark:bg-green-900 dark:text-green-300">
								Wallet Agent is up and running
							</span>
						</div>
					) : (
						<div className="w-fit flex shrink-0 items-center bg-red-100 text-red-800 text-xs font-medium rounded-full p-2 md:p-1 dark:bg-red-900 dark:text-red-300">
							<div className="w-1 h-1 md:mr-1 bg-red-500 rounded-full p-1 shrink-0 md:mr-1" />
							<span className="w-fit mr-1 shrink-0 md:block hidden rounded-full text-red-800 dark:bg-red-900 dark:text-red-300">
								Wallet Agent is not running
							</span>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default AgentHealth;
