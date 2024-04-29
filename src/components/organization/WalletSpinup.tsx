import * as yup from 'yup';
import { Button, Checkbox, Label } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import {
	apiStatusCodes,
	passwordRegex,
	storageKeys,
} from '../../config/CommonConstant';
import { getFromLocalStorage, passwordEncryption } from '../../api/Auth';
import {
	spinupDedicatedAgent,
	spinupSharedAgent,
} from '../../api/organization';
import React, { ReactElement, useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import DedicatedIllustrate from './DedicatedIllustrate';
import InputCopy from '../InputCopy';
import SOCKET from '../../config/SocketConfig';
import SharedIllustrate from './SharedIllustrate';
import { nanoid } from 'nanoid';
import {
	createPolygonKeyValuePair,
	getLedgerConfig,
	getLedgers,
} from '../../api/Agent';
import { AlertComponent } from '../AlertComponent';
import CopyDid from '../../commonComponents/CopyDid';
import { DidMethod } from '../../common/enums';
import GenerateBtnPolygon from './walletCommonComponents/GenerateBtnPolygon';
import SetDomainValueInput from './walletCommonComponents/SetDomainValueInput';
import TokenWarningMessage from './walletCommonComponents/TokenWarningMessage';
import LedgerLessMethodsComponents from './walletCommonComponents/LegderLessMethods'
import SetPrivateKeyValueInput from './walletCommonComponents/SetPrivateKeyValue';


interface Values {
	seed: string;
	walletName: string;
	password: string;
	did: string;
	network: string;
}

export interface ValuesShared {
	keyType: string;
	seed: string;
	method: string;
	network?: string;
	did?: string;
	endorserDid?: string;
	privatekey?: string;
	endpoint?: string;
	domain?: string;
	role?: string;
	ledger: string;
	label: string;
}

enum AgentType {
	SHARED = 'shared',
	DEDICATED = 'dedicated',
}
interface INetworks {
	id: number;
	name: string;
}

interface ISharedAgentForm {
	seeds: string;
	isCopied: boolean;
	copyTextVal: (e: any) => void;
	orgName: string;
	loading: boolean;
	submitSharedWallet: (
		values: ValuesShared,
		privatekey: string,
		domain: string,
		endPoint: string,
	) => void;
}

interface IDedicatedAgentForm {
	seeds: string;
	loading: boolean;
	submitDedicatedWallet: (values: Values) => void;
}

interface IPolygonKeys {
	privateKey: string;
	publicKeyBase58: string;
	address: string;
}

const fetchNetworks = async () => {
	try {
		const { data } = (await getLedgers()) as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			return data?.data;
		}
		return [];
	} catch (err) {
		console.log('Fetch Network ERROR::::', err);
	}
};

const NetworkInput = ({ formikHandlers }) => {
	return (
		<div>
			<div className="mb-1 block">
				<Label htmlFor="network" value="Network" />
				<span className="text-red-500 text-xs">*</span>
			</div>

			<select
				onChange={(e) => formikHandlers.handleChange(e)}
				id="network"
				name="network"
				className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
			>
				<option value="">Select network</option>
				{networks &&
					networks.length > 0 &&
					networks.map((item: INetworks) => (
						<option key={item.id} value={item.id}>
							{item.name}
						</option>
					))}
			</select>

			{formikHandlers?.errors?.network && formikHandlers?.touched?.network && (
				<span className="text-red-500 text-xs">
					{formikHandlers?.errors?.network}
				</span>
			)}
		</div>
	);
};

const SharedAgentForm = ({
	orgName,
	seeds,
	loading,
	submitSharedWallet,
}: ISharedAgentForm) => {
	const [haveDidShared, setHaveDidShared] = useState(false);
	const [networks, setNetworks] = useState([]);
	const [selectedLedger, setSelectedLedger] = useState('');
	const [seedVal, setSeedVal] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState('');
	const [selectedDid, setSelectedDid] = useState('');
	const [mappedData, setMappedData] = useState(null);
	const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
	const [domainValue, setDomainValue] = useState<string>('');
	const [endPointValue, setEndPointValue] = useState<string>('');
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');

	const fetchLedgerConfig = async () => {
		try {
			const { data } = await getLedgerConfig();
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const obj = {};
				data.data.forEach((item) => {
					obj[item.name.toLowerCase()] = { ...item.details };
				});
				setMappedData(obj);
			}
		} catch (err) {
			console.log('Fetch Network ERROR::::', err);
		}
	};
	

	const handleLedgerChange = (e) => {
		setSelectedLedger(e.target.value);
		setSelectedNetwork('');
		setSelectedDid('');
	};

	const generatePolygonKeyValuePair = async () => {
		try {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			const resCreatePolygonKeys = await createPolygonKeyValuePair(orgId);
			const { data } = resCreatePolygonKeys as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setGeneratedKeys(data?.data);
			}
		} catch (err) {
			console.log('Generate private key ERROR::::', err);
		}
	};

	const getLedgerList = async () => {
		const res = await fetchNetworks();
		setNetworks(res);
	};
	useEffect(() => {
		getLedgerList();
		fetchLedgerConfig();
	}, []);

	useEffect(() => {
		setSeedVal(seeds)
	}, [seeds])

	const showMethod = (method: string): ReactElement => {
		switch (method) {
			case DidMethod.POLYGON: {
				return mappedData && selectedLedger && selectedDid ? (
					<span>{mappedData[selectedLedger][selectedDid] || ''}</span>
				) : (
					<></>
				);
			}
			case DidMethod.INDY: {
				return mappedData &&
					selectedLedger &&
					selectedNetwork &&
					selectedDid ? (
					<span>
						{mappedData[selectedLedger][selectedNetwork][selectedDid] || ''}
					</span>
				) : (
					<></>
				);
			}

			case DidMethod.KEY:
			case DidMethod.WEB: {
				return mappedData && selectedLedger ? (
					<span>{mappedData[selectedLedger][selectedLedger] || ''}</span>
				) : (
					<></>
				);
			}
			default:
				return <></>;
		}
	};

	const validations = {
		label: yup
		.string()
		.required('Wallet label is required')
		.trim()
		.min(2, 'Wallet label must be at least 2 characters')
		.max(25, 'Wallet label must be at most 25 characters'),
		method: yup.string().required('Method is required'),
		...(DidMethod.INDY === selectedLedger || DidMethod.POLYGON === selectedLedger) && { network: yup.string().required('Network is required') },
		...(DidMethod.INDY === selectedLedger) && { ledger: yup.string().required('Ledger is required') },
		...(DidMethod.WEB === selectedLedger) && { domain: yup.string().required('Domain is required for web method') }, 
		...(DidMethod.POLYGON === selectedLedger) && { privatekey: yup.string().required('Private key is required').trim().length(64, 'Private key must be exactly 64 characters long') }, 
	}

	return (
		<div className="mt-4 max-w-lg flex-col gap-4">
			<div className="flex items-center gap-2 mt-4">
				<Checkbox
					id="haveDidShared"
					onChange={(e) => setHaveDidShared(e.target.checked)}
				/>
				<Label className="flex" htmlFor="haveDidShared">
					<p>Already have DID?</p>
				</Label>
			</div>
			{!haveDidShared ? (
				<>
					<div className="my-3">
						<div className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
							<Label value="Seed" />
						</div>
						<div className="flex">
							<CopyDid
								className="align-center block text-sm text-gray-900 dark:text-white"
								value={seedVal}
							/>
						</div>
					</div>

					<Formik
						initialValues={{
							seed: seedVal,
							method: '',
							network: '',
							did: '',
							ledger: '',
							domain: '',  
							privatekey: '', 
							label: orgName || '',
						}}
						validationSchema={yup.object().shape(validations)}
						onSubmit={(values: ValuesShared) => {
							submitSharedWallet(
								values,
								privateKeyValue,
								domainValue,
								endPointValue,
							);
							
						}}
					>
						{(formikHandlers) => (
							<Form className="">
								<div className="mb-3 relative">
									<label
										htmlFor="method"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										Method
										<span className="text-red-500 text-xs">*</span>
									</label>
									<select
										onChange={(e) => {
											formikHandlers.handleChange(e);
											handleLedgerChange(e);
											setSeedVal(seeds)
											setSelectedNetwork('');
											setSelectedDid('');
											setGeneratedKeys(null);
										}}
										id="method"	name="method" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
									>
										<option value="">Select Method</option>
										{mappedData && Object.keys(mappedData)?.map((method) => (
												<option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
											))}
									</select>
									{formikHandlers?.errors?.method && formikHandlers?.touched?.method && (
											<span className="absolute botton-0 text-red-500 text-xs">{formikHandlers?.errors?.method}</span>
										)}
								</div>

								{formikHandlers.values.method === DidMethod.POLYGON && (
									
									<GenerateBtnPolygon  generatePolygonKeyValuePair={()=>generatePolygonKeyValuePair()}/>
								)}

								{generatedKeys && (
									<div className="my-3 relative">
										<p className="text-sm truncate">
											<span className="font-semibold text-gray-900 dark:text-white">
												Private Key:
											</span>
											<div className="flex ">
												<CopyDid
													className="align-center block text-sm text-gray-900 dark:text-white truncate"
													value={generatedKeys?.privateKey.slice(2)}
												/>
											</div>
										</p>

										<p className="text-sm truncate">
											<span className="font-semibold text-gray-900 dark:text-white">
												Address:
											</span>
											<div className="flex ">
												<CopyDid
													className="align-center block text-sm text-gray-900 dark:text-white truncate"
													value={generatedKeys?.address}
												/>
											</div>
										</p>
									</div>
								)}

								{generatedKeys && formikHandlers.values.method === DidMethod.POLYGON && (<TokenWarningMessage />)}

								{formikHandlers.values.method === DidMethod.POLYGON && (<SetPrivateKeyValueInput setPrivateKeyValue={(val:string)=>setPrivateKeyValue(val)} privateKeyValue={privateKeyValue} formikHandlers={formikHandlers}/>)}

								{formikHandlers.values.method === DidMethod.WEB && (<SetDomainValueInput setDomainValue={(val:string)=>setDomainValue(val)} domainValue={domainValue} formikHandlers={formikHandlers}/>)} 

								{formikHandlers.values.method !== DidMethod.POLYGON && formikHandlers.values.method !== DidMethod.KEY && formikHandlers.values.method !== DidMethod.WEB && (
										<div className="my-3 relative">
											<label
												htmlFor="ledger"
												className="text-sm font-medium text-gray-900 dark:text-gray-300"
											>
												Ledger
												<span className="text-red-500 text-xs">*</span>
											</label>
											<select
												onChange={(e) => {
													formikHandlers.handleChange(e);
													setSelectedNetwork(e.target.value);
													setSelectedDid('');
												}}
												value={selectedNetwork}
												id="ledger"	name="ledger" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
											>
												<option value="">Select Ledger</option>
												{mappedData && selectedLedger && mappedData[selectedLedger] &&
													Object.keys(mappedData[selectedLedger])?.map(
														(ledger) => (
															<option key={ledger} value={ledger}>{ledger.charAt(0).toUpperCase() + ledger.slice(1)}</option>
														),
													)}
											</select>
											{formikHandlers?.errors?.ledger && formikHandlers?.touched?.ledger && (
													<span className="absolute botton-0 text-red-500 text-xs">{formikHandlers?.errors?.ledger}</span>)}
										</div>
									)}
								{formikHandlers.values.method !== DidMethod.WEB &&
									formikHandlers.values.method !== DidMethod.KEY && (
										
										< LedgerLessMethodsComponents formikHandlers={formikHandlers} setSelectedDid={(val: string) => setSelectedDid(val)} selectedDid={selectedDid} mappedData={mappedData} selectedLedger={selectedLedger} selectedNetwork={selectedNetwork} />
									)}

								<div className="my-3 relative">
									<label
										htmlFor="DID Method"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										DID Method
									</label>
									<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
										{showMethod(formikHandlers.values.method)}
									</div>
								</div>
								<div className="mt-3 relative">
									<Label htmlFor="name" value="Wallet Label" />
									<span className="text-red-500 text-xs">*</span>

									<Field id="label" name="label" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="text"/>
									{formikHandlers?.errors?.label && formikHandlers?.touched?.label && (
											<span className="text-red-500 absolute text-xs">{formikHandlers?.errors?.label}</span>
										)}
								</div>
								<div className="w-full flex justify-end">
									<Button
										type="submit"
										className="flex h-min p-0.5 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
									>
										Submit
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				</>
			) : (
				<Formik
					initialValues={{
						seed: '',
						method: '',
						network: '',
						did: '',
						ledger: '',
						label: orgName || '',
					}}
					validationSchema={yup.object().shape({
						seed: yup.string().required('Seed is required'),
						network: yup.string().required('Network is required'),
						label: yup.string().required('Wallet label is required'),
					})}
					onSubmit={(values: ValuesShared) => {
						submitSharedWallet(
							values,
							privateKeyValue,
							domainValue,
							endPointValue,
						);
					}}
				>
					{(formikHandlers) => (
						<Form className="">
							<div className="mt-3 relative">
								<div className="block">
									<Label htmlFor="seed" value="Seed" />
									<span className="text-red-500 text-xs">*</span>
								</div>

								<Field
									id="seed"
									name="seed"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.seed &&
									formikHandlers?.touched?.seed && (
										<span className="text-red-500 absolute text-xs">
											{formikHandlers?.errors?.seed}
										</span>
									)}
							</div>

							<div className="mt-3 relative">
								<div className="block">
									<Label htmlFor="did" value="DID" />
									<span className="text-red-500 text-xs">*</span>
								</div>

								<Field
									id="did"
									name="did"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.did &&
									formikHandlers?.touched?.did && (
										<span className="text-red-500 absolute text-xs">
											{formikHandlers?.errors?.did}
										</span>
									)}
							</div>

							<div className="mb-3 relative mt-3">
								<label
									htmlFor="method"
									className="text-sm font-medium text-gray-900 dark:text-gray-300"
								>
									Method
								</label>
								<select
									onChange={(e) => {
										formikHandlers.handleChange(e);
										handleLedgerChange(e);
										setSelectedNetwork('');
										setSelectedDid('');
										setGeneratedKeys(null);
									}}
									id="method"
									name="method"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
								>
									<option value="">Select Method</option>
									{mappedData &&
										Object.keys(mappedData)?.map((ledger) => (
											<option key={ledger} value={ledger}>
												{ledger}
											</option>
										))}
								</select>
								{formikHandlers?.errors?.method &&
									formikHandlers?.touched?.method && (
										<span className="absolute botton-0 text-red-500 text-xs">
											{formikHandlers?.errors?.method}
										</span>
									)}
							</div>

							{formikHandlers.values.method === DidMethod.POLYGON && (
			
                                 <GenerateBtnPolygon  generatePolygonKeyValuePair={()=>generatePolygonKeyValuePair()}/>

							)}

							{generatedKeys && (
								<div className="my-3 relative">
									<p className="text-sm truncate">
										<span className="font-semibold text-gray-900 dark:text-white">
											Private Key:
										</span>
										<div className="flex ">
											<CopyDid
												className="align-center block text-sm text-gray-900 dark:text-white truncate"
												value={generatedKeys?.privateKey}
											/>
										</div>
									</p>

									<p className="text-sm truncate">
										<span className="font-semibold text-gray-900 dark:text-white">
											Public Key Base58:
										</span>
										<div className="flex ">
											<CopyDid
												className="align-center block text-sm text-gray-900 dark:text-white truncate"
												value={generatedKeys?.publicKeyBase58}
											/>
										</div>
									</p>
									<p className="text-sm truncate">
										<span className="font-semibold text-gray-900 dark:text-white">
											Address:
										</span>
										<div className="flex ">
											<CopyDid
												className="align-center block text-sm text-gray-900 dark:text-white truncate"
												value={generatedKeys?.address}
											/>
										</div>
									</p>
								</div>
							)}

							{generatedKeys &&
								formikHandlers.values.method === DidMethod.POLYGON && (

									<TokenWarningMessage />
								)}

							{formikHandlers.values.method === DidMethod.POLYGON && (
							
								<SetPrivateKeyValueInput setPrivateKeyValue={(val:string)=>setPrivateKeyValue(val)} privateKeyValue={privateKeyValue} formikHandlers={formikHandlers}/>
							)}

							{formikHandlers.values.method === DidMethod.WEB && (

								<SetDomainValueInput setDomainValue={(val:string)=>setDomainValue(val)} domainValue={domainValue} formikHandlers={formikHandlers}/>

							)}

							{formikHandlers.values.method !== DidMethod.POLYGON &&
								formikHandlers.values.method !== DidMethod.KEY &&
								formikHandlers.values.method !== DidMethod.WEB && (
									<div className="my-3 relative">
										<label
											htmlFor="ledger"
											className="text-sm font-medium text-gray-900 dark:text-gray-300"
										>
											Ledger
										</label>
										<select
											onChange={(e) => {
												formikHandlers.handleChange(e);
												setSelectedNetwork(e.target.value);
												setSelectedDid('');
											}}
											value={selectedNetwork}
											id="ledger"
											name="ledger"
											className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
										>
											<option value="">Select Ledger</option>
											{mappedData &&
												selectedLedger &&
												mappedData[selectedLedger] &&
												Object.keys(mappedData[selectedLedger])?.map(
													(ledger) => (
														<option key={ledger} value={ledger}>
															{ledger}
														</option>
													),
												)}
										</select>
										{formikHandlers?.errors?.ledger &&
											formikHandlers?.touched?.ledger && (
												<span className="absolute botton-0 text-red-500 text-xs">
													{formikHandlers?.errors?.ledger}
												</span>
											)}
									</div>
								)}
							{formikHandlers.values.method !== DidMethod.WEB &&
								formikHandlers.values.method !== DidMethod.KEY && (
									
									< LedgerLessMethodsComponents formikHandlers={formikHandlers} setSelectedDid={(val: string) => setSelectedDid(val)} selectedDid={selectedDid} mappedData={mappedData} selectedLedger={selectedLedger} selectedNetwork={selectedNetwork} />
								)}

							<div className="my-3 relative">
								<label
									htmlFor="DID Method"
									className="text-sm font-medium text-gray-900 dark:text-gray-300"
								>
									DID Method
								</label>
								<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
									{showMethod(formikHandlers.values.method)}
								</div>
							</div>
							<div className="mt-3 relative">
								<Label htmlFor="name" value="Wallet Label" />
								<span className="text-red-500 text-xs">*</span>

								<Field
									id="label"
									name="label"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.label &&
									formikHandlers?.touched?.label && (
										<span className="text-red-500 absolute text-xs">
											{formikHandlers?.errors?.label}
										</span>
									)}
							</div>
							<div className="w-full flex justify-end">
								<Button
									type="submit"
									className="flex h-min p-0.5 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									Submit
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			)}
		</div>
	);
};

const DedicatedAgentForm = ({
	seeds,
	loading,
	submitDedicatedWallet,
}: IDedicatedAgentForm) => {
	const [haveDid, setHaveDid] = useState(false);
	const [networks, setNetworks] = useState([]);
	const getLedgerList = async () => {
		const res = await fetchNetworks();
		setNetworks(res);
	};
	useEffect(() => {
		getLedgerList();
	}, []);

	const validation = {
		walletName: yup
			.string()
			.min(6, 'Wallet name must be at least 6 characters')
			.max(20, 'Wallet name must be at most 20 characters')
			.trim()
			.required('Wallet name is required')
			.label('Wallet name'),
		password: yup
			.string()
			.matches(
				passwordRegex,
				'Password must contain one Capital, Special character',
			)
			.required('Wallet password is required')
			.label('Wallet password'),
		did: haveDid ? yup.string().required('DID is required') : yup.string(),
		network: yup.string().required('Network is required'),
	};

	if (haveDid) {
		validation.seed = yup.string().required('Seed is required');
	}

	return (
		<>
			<div className="flex items-center gap-2 mt-4">
				<Checkbox id="haveDid" onChange={(e) => setHaveDid(e.target.checked)} />
				<Label className="flex" htmlFor="haveDid">
					<p>Already have DID?</p>
				</Label>
			</div>
			<Formik
				initialValues={{
					seed: haveDid ? '' : seeds,
					walletName: '',
					password: '',
					did: '',
					network: '',
				}}
				validationSchema={yup.object().shape(validation)}
				validateOnBlur
				validateOnChange
				enableReinitialize
				onSubmit={(values: Values) => submitDedicatedWallet(values)}
			>
				{(formikHandlers): JSX.Element => (
					<Form
						className="mt-8 space-y-4 max-w-lg flex-col gap-4"
						onSubmit={formikHandlers.handleSubmit}
					>
						<div>
							<div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
								<Label htmlFor="seed" value="Seed" />
								<span className="text-red-500 text-xs">*</span>
							</div>
							<Field
								id="seed"
								name="seed"
								disabled={!haveDid}
								value={haveDid ? formikHandlers.values.seed : seeds}
								component={!haveDid && InputCopy}
								className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								type="text"
							/>
							{formikHandlers?.errors?.seed &&
								formikHandlers?.touched?.seed && (
									<span className="text-red-500 text-xs">
										{formikHandlers?.errors?.seed}
									</span>
								)}
						</div>
						{haveDid && (
							<div className="">
								<div className="mb-1 block">
									<Label htmlFor="did" value="DID" />
									<span className="text-red-500 text-xs">*</span>
								</div>

								<Field
									id="did"
									name="did"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									type="text"
								/>
								{formikHandlers?.errors?.did &&
									formikHandlers?.touched?.did && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.did}
										</span>
									)}
							</div>
						)}
						<NetworkInput formikHandlers={formikHandlers} />

						<div>
							<div className="mb-1 block">
								<Label htmlFor="walletName" value="Wallet Name" />
								<span className="text-red-500 text-xs">*</span>
							</div>
							<Field
								id="walletName"
								name="walletName"
								className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								type="text"
							/>
							{formikHandlers?.errors?.walletName &&
								formikHandlers?.touched?.walletName && (
									<span className="text-red-500 text-xs">
										{formikHandlers?.errors?.walletName}
									</span>
								)}
						</div>
						<div>
							<div className="mb-2 block">
								<Label htmlFor="password" value="Password" />
								<span className="text-red-500 text-xs">*</span>
							</div>
							<Field
								id="password"
								name="password"
								className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								type="password"
							/>
							{formikHandlers?.errors?.password &&
								formikHandlers?.touched?.password && (
									<span className="text-red-500 text-xs">
										{formikHandlers?.errors?.password}
									</span>
								)}
						</div>
						<Button
							isProcessing={loading}
							type="submit"
							className='float-right text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
						>
							Setup Agent
						</Button>
					</Form>
				)}
			</Formik>
		</>
	);
};

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
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		setSeeds(nanoid(32));
	}, []);

	const copyTextVal = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();

		setIsCopied(true);

		// Copy the text inside the text field
		navigator.clipboard.writeText(seeds);

		// Reset copied state after 1 second
		setTimeout(() => {
			setIsCopied(false);
		}, 1500);
	};

	const onRadioSelect = (type: string) => {
		setAgentType(type);
	};

	const submitDedicatedWallet = async (values: Values) => {
		const payload = {
			walletName: values.walletName,
			seed: values.seed || seeds,
			walletPassword: passwordEncryption(values.password),
			did: values.did,
			ledgerId: [values.network.toString()],
			clientSocketId: SOCKET.id,
		};

		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const spinupRes = await spinupDedicatedAgent(payload, orgId);
		const { data } = spinupRes as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			if (data?.data['agentSpinupStatus'] === 1) {
				setAgentSpinupCall(true);
			} else {
				setFailure(spinupRes as string);
			}
		} else {
			setLoading(false);
			setFailure(spinupRes as string);
		}
	};

	const submitSharedWallet = async (
		values: ValuesShared,
		privatekey: string,
		domain: string,
		endPoint: string,
	) => {
		setLoading(true);
		const payload = {
			keyType: values.keyType || 'ed25519',
			method: values.method || '',
			ledger: values.method === DidMethod.INDY ? values.ledger : '',
			label: values.label,
			privatekey: values.method === DidMethod.POLYGON ? privatekey : '',
			seed: values.method === DidMethod.POLYGON ? '' : values.seed || seeds,
			network:
				values.method === DidMethod.POLYGON
					? `${values?.method}:${values?.network}`
					: `${values?.ledger}:${values?.network}`,
			domain: values.method === DidMethod.WEB ? domain : '',
			role: values.method === DidMethod.INDY ? values?.role || 'endorser' : '',
			endorserDid: values?.endorserDid || '',
			clientSocketId: SOCKET.id,
		};
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const spinupRes = await spinupSharedAgent(payload, orgId);
		const { data } = spinupRes as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setLoading(false);

			if (data?.data['agentSpinupStatus'] === 1) {
				setAgentSpinupCall(true);
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
				)
		: '';

	const orgName = generateAlphaNumeric.slice(0, 19);

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

			<div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 mt-0 mb-4 xl:grid-cols-3 2xl:grid-cols-3">
				<div className="col-span-1">
					{!agentSpinupCall && !loading && (
						<div className="mt-4 flex max-w-lg flex-col gap-4">
							<ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
								<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
									<div className="flex items-center pl-3">
										<label className="w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center">
											<input
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
								<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
									<div className="flex items-center pl-3">
										<label className="w-full py-3 text-sm font-medium text-gray-400 dark:text-gray-300 cursor-not-allowed flex items-center">
											<input
												id="horizontal-list-radio-id"
												type="radio"
												value=""
												onChange={() => onRadioSelect(AgentType.DEDICATED)}
												checked={agentType === AgentType.DEDICATED}
												name="list-radio"
												disabled
												className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 disabled:cursor-not-allowed mr-2"
											/>
											Dedicated
										</label>
									</div>
								</li>
							</ul>
						</div>
					)}

					{!agentSpinupCall ? (
						agentType === AgentType.SHARED ? (
							<SharedAgentForm
								seeds={seeds}
								orgName={orgName}
								loading={loading}
								submitSharedWallet={submitSharedWallet}
							/>
						) : (
							<DedicatedAgentForm
								seeds={seeds}
								loading={loading}
								submitDedicatedWallet={submitDedicatedWallet}
							/>
						)
					) : (
						<WalletSteps
							steps={walletSpinStep}
							agentSpinupCall={agentSpinupCall}
						/>
					)}
				</div>
				<div className="col-span-2">
					{agentType === AgentType.DEDICATED ? (
						<DedicatedIllustrate />
					) : (
						<SharedIllustrate />
					)}
				</div>
			</div>
		</div>
	);
};

const WalletSteps = (props: { steps: number; agentSpinupCall: boolean }) => {
	return (
		<div className="mt-4 ml-4">
			<ol className="relative text-gray-500 border-l border-gray-200 dark:border-gray-700 dark:text-gray-400">
				<li className="mb-10 ml-6">
					{props.steps > 1 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
							<svg
								className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 16 12"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 5.917 5.724 10.5 15 1.5"
								/>
							</svg>
						</span>
					) : props.steps === 1 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
							<svg
								aria-hidden="true"
								className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
						</span>
					) : (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-900 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"></span>
					)}
					<h3 className="font-medium leading-tight">
						Wallet creation is in progress
					</h3>
				</li>
				<li className="mb-10 ml-6">
					{props.steps > 2 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
							<svg
								className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 16 12"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 5.917 5.724 10.5 15 1.5"
								/>
							</svg>
						</span>
					) : props.steps === 2 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
							<svg
								aria-hidden="true"
								className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
						</span>
						
					) : (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"></span>
					)}
					<h3 className="font-medium leading-tight">
						Starting the DID publishing process... 
					</h3>
				</li>
				<li className="mb-10 ml-6">
					{props.steps > 3 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
							<svg
								className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 16 12"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 5.917 5.724 10.5 15 1.5"
								/>
							</svg>
						</span>
					) : props.steps === 3 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
							<svg
								aria-hidden="true"
								className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
						</span>
					) : (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"></span>
					)}
					<h3 className="font-medium leading-tight">
						DID Publishing process is all done!
					</h3>
				</li>
				<li className="mb-10 ml-6">
					{props.steps > 4 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
							<svg
								className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 16 12"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 5.917 5.724 10.5 15 1.5"
								/>
							</svg>
						</span>
					) : props.steps === 4 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
							<svg
								aria-hidden="true"
								className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
						</span>
					) : (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"></span>
					)}
					<h3 className="font-medium leading-tight">
						Creating an invitation URL...
					</h3>
				</li>
				<li className="ml-6">
					{props.steps > 5 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
							<svg
								className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 16 12"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M1 5.917 5.724 10.5 15 1.5"
								/>
							</svg>
						</span>
					) : props.steps === 5 ? (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
							<svg
								aria-hidden="true"
								className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
						</span>
					) : (
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"></span>
					)}
					<h3 className="font-medium leading-tight">
						Invitation URL successfully created!
					</h3>
				</li>
			</ol>
		</div>
	);
};

export default WalletSpinup;