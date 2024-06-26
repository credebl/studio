import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { getFromLocalStorage, passwordEncryption } from '../../../api/Auth';
import {
	createDid,
	getOrganizationById,
	spinupDedicatedAgent,
	spinupSharedAgent,
} from '../../../api/organization';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import SOCKET from '../../../config/SocketConfig';
import { nanoid } from 'nanoid';
import { AlertComponent } from '../../AlertComponent';
import { DidMethod } from '../../../common/enums';
import DedicatedAgentForm from '../walletCommonComponents/DedicatedAgent';
import SharedAgentForm from './SharedAgent';
import WalletSteps from './WalletSteps';
import type { IValuesShared } from './interfaces';
import React from 'react';
import OrganizationDetails from '../OrganizationDetails';
import type { Organisation } from '../interfaces';

interface Values {
	seed: string;
	walletName: string;
	password: string;
	did: string;
	network: string;
}

enum AgentType {
	SHARED = 'shared',
	DEDICATED = 'dedicated',
}

const WalletSpinup = (props: {
	setWalletSpinupStatus: (flag: boolean) => void;
	orgName: string;
}) => {
	const [agentType, setAgentType] = useState<string>(AgentType.SHARED);
	const [loading, setLoading] = useState<boolean>(false);
	const [walletSpinStep, setWalletSpinStep] = useState<number>(0);
	const [success, setSuccess] = useState<string | null>(null);
	const [agentSpinupCall, setAgentSpinupCall] = useState<boolean>(false);
	const [failure, setFailure] = useState<string | null>(null);
	const [seeds, setSeeds] = useState<string>('');
    const [maskedSeeds, setMaskedSeeds] = useState('');
	const [orgData, setOrgData] = useState<Organisation | null>(null);
	const [isShared, setIsShared] = useState<boolean>(false);
	const [isConfiguredDedicated, setIsConfiguredDedicated] = useState<boolean>(false);

	  
	const maskSeeds = (seed: string) => {
		const visiblePart = seed.slice(0, -10);
		const maskedPart = seed.slice(-10).replace(/./g, '*');
		return visiblePart + maskedPart;
	};
	
    useEffect(() => {
        const generatedSeeds = nanoid(32);
        const masked = maskSeeds(generatedSeeds);
        setSeeds(generatedSeeds);
        setMaskedSeeds(masked);
    }, []);
	
	const configureDedicatedWallet = ()=> {
		setIsConfiguredDedicated(true);
	}
	const fetchOrganizationDetails = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const orgInfoData = await getFromLocalStorage(storageKeys.ORG_INFO);
		const response = await getOrganizationById(orgId as string);
		const { data } = response as AxiosResponse;
		setLoading(false)
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

			const agentData = data?.data?.org_agents

			if (data?.data?.org_agents && data?.data?.org_agents[0]?.org_agent_type?.agent?.toLowerCase()  === AgentType.DEDICATED){
				setIsConfiguredDedicated(true)
				setAgentType(AgentType.DEDICATED)
			}
			
			if (agentData.length > 0 && agentData?.orgDid) {
				setOrgData(data?.data);
			}
	};
}

	useEffect(() => {
       fetchOrganizationDetails()
    }, []);

	const onRadioSelect = (type: string) => {
		setAgentType(type);
	};

const submitDedicatedWallet = async (
	values: IValuesShared,
	privatekey: string,
	domain: string
) => {	
		const didData = {
			seed:values.method === DidMethod.POLYGON ? '' : seeds,
			keyType: values.keyType || 'ed25519',
		    method: values.method.split(':')[1] || '',
			network:
			values.method === DidMethod.INDY ?
            values.network?.split(':').slice(2).join(':') :
				values.method === DidMethod.POLYGON
					? values.network?.split(':').slice(1).join(':') 
					: '',
			domain: values.method === DidMethod.WEB ? domain : '',
			role: values.method === DidMethod.INDY ? 'endorser' : '',
			privatekey: values.method === DidMethod.POLYGON ? privatekey : '',
			did: values.did || '',
			endorserDid: values?.endorserDid || '',
			isPrimaryDid: true,
		};
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		
		const spinupRes = await createDid(didData);
		const { data } = spinupRes as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			
				if (data?.data?.did) {
	            setAgentSpinupCall(true);
				window.location.reload();
      			
			} else {
				setFailure(spinupRes as string);
			}
		} else {
			setLoading(false);
			setFailure(spinupRes as string);
		}
	};

	const submitSharedWallet = async (
		values: IValuesShared,
		domain: string,
	) => {
		setLoading(true);
		const ledgerName = values?.network?.split(":")[2]
		const network = values?.network?.split(":").slice(2).join(":");
		const polygonNetwork = values?.network?.split(":").slice(1).join(":");

		const payload = {
			keyType: values.keyType || 'ed25519',
			method: values.method.split(':')[1] || '',
			ledger: values.method === DidMethod.INDY ? ledgerName : '',
			label: values.label,
			privatekey: values.method === DidMethod.POLYGON ? values?.privatekey : '',
			seed: values.method === DidMethod.POLYGON ? '' : values?.seed || seeds,
			network:
				values.method === DidMethod.POLYGON
					? polygonNetwork
					: network,
			domain: values.method === DidMethod.WEB ? domain : '',
			role: values.method === DidMethod.INDY ? values?.role ?? 'endorser' : '',
			did: values?.did ?? '',
			endorserDid: values?.endorserDid ?? '',
			clientSocketId: SOCKET.id,
		};
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const spinupRes = await spinupSharedAgent(payload, orgId);
		const { data } = spinupRes as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setLoading(false);

			if (data?.data['agentSpinupStatus'] === 1) {
				setAgentSpinupCall(true);
				setIsShared(true)
			} else {
				setFailure(spinupRes as string);
			}
		} else {
			setLoading(false);
			setFailure(spinupRes as string);
		}
	};

	SOCKET.on('agent-spinup-process-initiated', () => {
		console.log(`agent-spinup-process-initiated`);
		setWalletSpinStep(1);
	});

	SOCKET.on('agent-spinup-process-completed', (data) => {
		console.log(`agent-spinup-process-completed`, JSON.stringify(data));
		setWalletSpinStep(2);
	});

	SOCKET.on('did-publish-process-initiated', (data) => {
		console.log(`did-publish-process-initiated`, JSON.stringify(data));
		setWalletSpinStep(3);
	});

	SOCKET.on('did-publish-process-completed', (data) => {
		console.log(`did-publish-process-completed`, JSON.stringify(data));
		setWalletSpinStep(4);
	});

	SOCKET.on('invitation-url-creation-started', (data) => {
		console.log(` invitation-url-creation-started`, JSON.stringify(data));
		setTimeout(() => {
			setWalletSpinStep(5);
		}, 1000);
	});

	SOCKET.on('invitation-url-creation-success', (data) => {
		setLoading(false);
		setTimeout(() => {
			setWalletSpinStep(6);
			props.setWalletSpinupStatus(true);
		}, 3000);
		window.location.href = '/organizations/dashboard';
		console.log(`invitation-url-creation-success`, JSON.stringify(data));
	});

	SOCKET.on('error-in-wallet-creation-process', (data) => {
		setLoading(false);
		setTimeout(() => {
			setFailure('Wallet Creation Failed');
		}, 5000);
		console.log(`error-in-wallet-creation-process`, JSON.stringify(data));
	});

	const generateAlphaNumeric = props?.orgName
		? props?.orgName
				?.split(' ')
				.reduce(
					(s, c) =>
						s.charAt(0).toUpperCase() +
						s.slice(1) +
						(c.charAt(0).toUpperCase() + c.slice(1)),
					'',
				)
		: '';

	const orgName = generateAlphaNumeric.slice(0, 19);

	let formComponent;

	if (!agentSpinupCall) {
		if (agentType === AgentType.SHARED) {
			formComponent = (
				<SharedAgentForm
				    maskedSeeds={maskedSeeds}
					seeds={seeds}
					orgName={orgName}
					loading={loading}
					submitSharedWallet={submitSharedWallet}
					isCopied={false}
				/>
			);
	    	} else {
			formComponent = (
				<DedicatedAgentForm
					seeds={seeds}
					loading={loading}
					onConfigureDedicated={configureDedicatedWallet}
					submitDedicatedWallet={submitDedicatedWallet}
				/>
			);
		}
	} 
	
	else {

		        if (agentType === AgentType.SHARED) {
		            formComponent = (
		                <WalletSteps steps={walletSpinStep} />
		            );
		        }
		        else {
		            formComponent = (
		                <OrganizationDetails orgData={orgData} />
		            );
		        }
		    }

	return (
		<div className="mt-4 flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800">
			<div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
				<div>
					{(success || failure) && (
						<AlertComponent
							message={success ?? failure}
							type={success ? 'success' : 'failure'}
							onAlertClose={() => {
								setSuccess(null);
								setFailure(null);
							}}
						/>
					)}

					<h3 className="mb-1 mt-1 text-xl font-bold text-gray-900 dark:text-white">
						Create Wallet
					</h3>
				</div>
			</div>

			<div className="grid w-full mb-4">
				<div className="col-span-1">
					<div className='bg-[#F4F4F4] dark:bg-gray-700 max-w-lg'>
					{!agentSpinupCall && !loading && (
						<div className="mt-4 flex flex-col gap-4 max-w-lg ml-4 mr-4 -mb-4">
							<ul className="items-center w-full mx-2 my-4 text-sm ml-0 font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-500 dark:text-white">
								<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-500">
									<div className="flex items-center pl-3">
										<label className="w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center">
											<input
											disabled={isConfiguredDedicated && agentType === AgentType.DEDICATED}
												id="horizontal-list-radio-license"
												type="radio"
												checked={agentType === AgentType.SHARED}
												value=""
												onChange={() => onRadioSelect(AgentType.SHARED)}
												name="list-radio"
												className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
											/>
											Shared
										</label>
									</div>
								</li>
								<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-500">
									<div className="flex items-center pl-3">
										<label className="w-full py-3 text-sm font-medium text-gray-400 dark:text-gray-300 flex items-center">
											<input
												id="horizontal-list-radio-id"
												type="radio"
												value=""
												onChange={() => onRadioSelect(AgentType.DEDICATED)}
												checked={agentType === AgentType.DEDICATED}
												name="list-radio"
											
												className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 disabled:cursor-not-allowed mr-2"
											/>
											Dedicated
										</label>
									</div>
								</li>
							</ul>
						</div>
					)}
					</div>
					

					{formComponent}
				</div>
			</div>
		</div>
	);
}
	

export default WalletSpinup;

