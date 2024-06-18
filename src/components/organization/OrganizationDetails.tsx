import type { Connection, OrgAgent, Organisation } from './interfaces';
import React, { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import CustomQRCode from '../../commonComponents/QRcode';
import CustomSpinner from '../CustomSpinner';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { createConnection } from '../../api/organization';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import CopyDid from '../../commonComponents/CopyDid';
import { setToLocalStorage } from '../../api/Auth';
import { Tooltip } from 'flowbite-react';
import DIDList from './configuration-settings/DidList';

const OrganizationDetails = ({ orgData }: { orgData: Organisation | null }) => {
	
	const { org_agents } = orgData as Organisation;
	const agentData: OrgAgent | null =
	org_agents.length > 0 ? org_agents[0] : null;
		
	const [loading, setLoading] = useState<boolean>(true);
	const [connectionData, setConnectionData] = useState<Connection | null>(null);

	const createQrConnection = async () => {
		setLoading(true);
		const response = await createConnection(orgData?.name as string);

		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setConnectionData(data?.data);
		}
		setLoading(false);
	};

	const storeLedgerDetails = async () => {
		await setToLocalStorage(storageKeys.LEDGER_ID, agentData?.ledgers.id);
	};

	useEffect(() => {
		createQrConnection();
		storeLedgerDetails();
	}, []);

	return (
		<div>

		<div>
    		<div className="mt-4 flex justify-start items-start flex-wrap p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 gap-6">
				<div className='flex justify-between w-full'>
					<h3 className="mb-1 mt-1 text-xl font-bold text-gray-900 dark:text-white">
						Web Wallet Details
					</h3>
				</div>
				<div
					className="mb-4 sm:mb-0 px-0 sm:px-4 py-4 min-w-full lg:min-w-[550px] lg:max-w-[50rem]"
					style={{ width: 'calc(100% - 23rem)' }}
				>
					<div>
						<ul className="divide-y divide-gray-200 dark:divide-gray-700">
							<li className="py-4">
								<div className="flex items-center space-x-8">
									<div className="inline-flex min-w-0 items-center">
										<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
											Wallet Name
										</p>
										<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">
											:
										</p>
										<p className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white w-full">
											{agentData?.walletName}
										</p>
									</div>
								</div>
							</li>
							<li className="pb-4 pt-2">
								<div className="flex items-center space-x-4">
									<div className="flex min-w-0 items-center">
										<p className="text-base font-normal text-gray-500 dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
											Org DID
										</p>
										<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400">
											:
										</p>
										{agentData?.orgDid ? (
											<CopyDid
												className="ml-4 pt-2 font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white"
												value={agentData?.orgDid}
											/>
										) : (
											<span className="ml-4 pt-2 font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white">
												Not available
											</span>
										)}
									</div>
								</div>
							</li>

							<li className="py-4">
								<div className="flex items-center space-x-4">
									<div className="inline-flex min-w-0 items-center">
										<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
											Network
										</p>
										<p className="pr-4 text-base font-normal text-gray-500 dark:text-gray-400">
											:
										</p>
										<p className="text-base font-semibold text-gray-900 truncate dark:text-white w-full">
											{agentData?.ledgers ? agentData?.ledgers?.name : `-`}
										</p>
									</div>
								</div>
							</li>

							<li className="py-4">
								<div className="flex items-center space-x-4">
									<div className="inline-flex min-w-0 items-center">
										<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
											Agent Type
										</p>
										<p className="pr-4 text-base font-normal text-gray-500 dark:text-gray-400">
											:
										</p>
										<p className="text-base font-semibold text-gray-900 truncate dark:text-white w-full">
											{agentData?.org_agent_type?.agent
												? agentData?.org_agent_type?.agent
														?.charAt(0)
														.toUpperCase() +
												  agentData?.org_agent_type?.agent
														?.slice(1)
														.toLowerCase()
												: ''}
										</p>
									</div>
								</div>
							</li>
							<li className="py-4">
								<div className="flex items-center space-x-4">
									<div className="inline-flex min-w-0 items-center">
										<p className="text-base font-normal text-gray-500 truncate dark:text-gray-400 w-fit sm:w-32 lg:w-40 shrink-0">
											Created On
										</p>
										<p className="pr-4 text-base font-normal text-gray-500 dark:text-gray-400">
											:
										</p>
										<div className="text-base font-semibold text-gray-900 truncate dark:text-white w-full">
											{agentData?.createDateTime ? (
												<DateTooltip date={agentData?.createDateTime}>
													{' '}
													{dateConversion(agentData?.createDateTime)}{' '}
												</DateTooltip>
											) : (
												<DateTooltip date={agentData?.createDateTime || ''}>
													{' '}
													{dateConversion(new Date().toISOString())}{' '}
												</DateTooltip>
											)}
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div className="flex flex-col justify-center text-wrap">
					{loading ? (
						<div className="flex justify-center">
							
						</div>
					) : (
						connectionData && (
							<div>
								<CustomQRCode
									value={connectionData?.connectionInvitation as string}
									size={180}
								/>
							</div>
						)
					)}
				</div>
				<div className="mt-4 w-full p-4">
					<DIDList />
				</div>
			</div>
			{agentData?.orgDid?.startsWith('did:web') && (
				<div className="mt-4 flex justify-start items-center flex-wrap p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<div className="flex justify-between w-full">
						<div className="relative flex w-full">
							<div
								className="mb-4 sm:mb-0 px-0 sm:px-4 py-4 w-full"
							>
								<h3 className="mb-1 mt-1 text-2xl font-bold text-gray-900 dark:text-white">
									DID Document
								</h3>

								<div className="mt-4">
									<h3 className="mb-1 mt-1 text-lg font-semibold text-gray-900 dark:text-white">
										Instructions:
									</h3>
									<p className="dark:text-white">
										1. Kindly provide the DID document for hosting purposes in
										order to facilitate its publication
									</p>
									<p className="dark:text-white">
										2. Failure to host the DID document will result in the
										inability to publish your DID
									</p>
								</div>

								<div className="flex justify-between mt-6 bg-gray-200 dark:bg-gray-300">
									<div className="flex p-4">
										<pre>
											<code>
												{JSON.stringify(agentData?.didDocument, undefined, 4)}
											</code>
										</pre>
									</div>
									<div className="flex items-start mt-4 mr-4">
										<Tooltip
											content={'Copy DID Document'}
											placement="bottom"
											className="items-center text-center dark:text-white"
										>
											<CopyDid
												className="block text-sm truncate"
												value={JSON.stringify(agentData?.didDocument)}
												hideValue={true}
											/>
										</Tooltip>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}	</div>

		</div>
		
	);
};

export default OrganizationDetails;
