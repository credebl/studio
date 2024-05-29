import { Button, Label, Checkbox } from "flowbite-react";
import { Field, Form, Formik } from "formik";
import { useState, useEffect } from "react";
import { getLedgerConfig, getLedgers } from "../../../api/Agent";
import { apiStatusCodes } from "../../../config/CommonConstant";
import * as yup from 'yup';
import type { AxiosResponse } from 'axios';
import CopyDid from '../../../commonComponents/CopyDid';
import { DidMethod } from '../../../common/enums';
import SetDomainValueInput from './SetDomainValueInput';
import LedgerLessMethodsComponents from './LegderLessMethods'
import SetPrivateKeyValueInput from './SetPrivateKeyValue';
import type { ISharedAgentForm, IValuesShared } from "./interfaces";

const SharedAgentForm = ({
	orgName,
	seeds,
	submitSharedWallet,
}: ISharedAgentForm) => {
	const [haveDidShared, setHaveDidShared] = useState(false);
	const [selectedLedger, setSelectedLedger] = useState('');
	const [selectedMethod, setSelectedMethod] = useState('');
	const [seedVal, setSeedVal] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState('');
	const [selectedDid, setSelectedDid] = useState('');
	const [mappedData, setMappedData] = useState(null);
	const [domainValue, setDomainValue] = useState<string>('');
	const [endPointValue, setEndPointValue] = useState<string>('');
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');

	const fetchLedgerConfig = async () => {
		try {
			const { data } = await getLedgerConfig();
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const obj = {
					indy: {
						'did:indy': {
							'bcovrin:testnet': 'did:indy:bcovrin:testnet',
							'indicio:demonet': 'did:indy:indicio:demonet',
							'indicio:mainnet': 'did:indy:indicio:mainnet',
							'indicio:testnet': 'did:indy:indicio:testnet',
						},
					},
					polygon: {
						'did:polygon': {
							mainnet: 'did:polygon:mainnet',
							testnet: 'did:polygon:testnet',
						},
					},
					'no ledger': {
						'did:key': 'did:key',
						'did:web': 'did:web',
					},
				};
				setMappedData(obj);
				console.log('obj34567:::::', obj);
			}
		} catch (err) {
			console.log('Fetch Network ERROR::::', err);
		}
	};

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

	const handleLedgerChange = (e) => {
		setSelectedLedger(e.target.value);
		setSelectedMethod('');
		setSelectedNetwork('');
		setSelectedDid('');
	};

	const handleMethodChange = (e) => {
		setSelectedMethod(e.target.value);
		setSelectedNetwork('');
		setSelectedDid('');
	};

	const handleNetworkChange = (e) => {
		setSelectedNetwork(e.target.value);
		const didMethod = `${e.target.value}`;
		console.log('didMethod::::::', didMethod);
		setSelectedDid(didMethod);
	};

	const getLedgerList = async () => {
		const res = await fetchNetworks();
	};

	useEffect(() => {
		getLedgerList();
		fetchLedgerConfig();
	}, []);

	useEffect(() => {
		setSeedVal(seeds);
	}, [seeds]);

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
	};

	const renderMethodOptions = (formikHandlers) => {
		if (!selectedLedger) return null;

		const methods = mappedData?.[selectedLedger];

		if (!methods) return null;

		return Object.keys(methods).map((method) => (
			<div key={method} className="mt-2">
				<input
					type="radio"
					id={method}
					name="method"
					value={method}
					onChange={(e) => {
						formikHandlers.handleChange(e);
						handleMethodChange(e);
						setSelectedMethod(method);
					}}
					className="mr-2"
				/>
				<label htmlFor={method} className="text-gray-700 dark:text-gray-300">
					{method}
				</label>
			</div>
		));
	};

	const renderNetworkOptions = (formikHandlers) => {
		if (!selectedLedger || !selectedMethod) return null;
		const networks = mappedData?.[selectedLedger][selectedMethod];
		console.log('networks:::::', networks);
		if (!networks) return null;

		return Object.keys(networks).map((network) => (
			<div key={network} className="mt-2">
				<input
					type="radio"
					id={network}
					name="network"
					value={networks[network]}
					onChange={(e) => {
						formikHandlers.handleChange(e),
							handleNetworkChange(e)
					}}
					className="mr-2"
				/>
				<label htmlFor={network} className="text-gray-700 dark:text-gray-300">
					{network}
				</label>
			</div>
		));
	};

	return (
		<div className="mt-4 flex-col gap-4">
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
							label: orgName,
						}}
						validationSchema={yup.object().shape(validations)}
						onSubmit={(values: IValuesShared) => {
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

							<div className="grid grid-cols-4 gap-4">
								<div className="mb-3 relative">
									<label
										htmlFor="ledger"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										Ledger
										<span className="text-red-500 text-xs">*</span>
									</label>
									<div className="mt-2">
										{mappedData &&
											Object.keys(mappedData).map((ledger) => (
												<div key={ledger} className="mt-2">
													<input
														type="radio"
														id={ledger}
														name="ledger"
														value={ledger}
														onChange={(e) => {
															formikHandlers.handleChange(e);
															handleLedgerChange(e);
															setSelectedLedger(ledger);
															setSelectedMethod('');
															setSeedVal(seeds);
															setSelectedNetwork('');
															setSelectedDid('');
															// setGeneratedKeys(null);
														}}
														className="mr-2"
													/>
													<label
														htmlFor={ledger}
														className="text-gray-700 dark:text-gray-300"
													>
														{ledger.charAt(0).toUpperCase() + ledger.slice(1)}
													</label>
												</div>
											))}
									</div>
								</div>

								<div className="mb-3 relative">
									<label
										htmlFor="method"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										Method
										<span className="text-red-500 text-xs">*</span>
									</label>
									<div className="mt-2">
										{renderMethodOptions(formikHandlers)}
									</div>
									{formikHandlers.errors.method && formikHandlers.touched.method && (
										<span className="absolute bottom-0 text-red-500 text-xs">
											{formikHandlers.errors.method}
										</span>
									)}
								</div>

								{selectedLedger !== 'no ledger' && (
									<div className="mb-3 relative">
										<label
											htmlFor="network"
											className="text-sm font-medium text-gray-900 dark:text-gray-300"
										>
											Network
											<span className="text-red-500 text-xs">*</span>
										</label>
										<div className="mt-2">
											{renderNetworkOptions(formikHandlers)}
										</div>
									</div>
								)}

								{selectedLedger !== 'no ledger' && (

									<div className="mb-3 relative">
										<label
											htmlFor="did-method"
											className="text-sm font-medium text-gray-900 dark:text-gray-300"
										>
											DID Method
											<span className="text-red-500 text-xs">*</span>
										</label>
										<input
											type="text"
											id="did-method"
											name="did-method"
											value={selectedDid}
											readOnly
											className="mt-2 block w-full text-gray-700 dark:text-gray-300 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										/>
									</div>
								)}
								<div>

									{selectedMethod === 'did:polygon' && (
										<SetPrivateKeyValueInput setPrivateKeyValue={(val: string) => setPrivateKeyValue(val)} privateKeyValue={privateKeyValue} formikHandlers={formikHandlers} />
									)}

									{selectedMethod === 'did:web' && (
										<SetDomainValueInput
											setDomainValue={(val: string) => setDomainValue(val)}
											domainValue={domainValue}
											formikHandlers={formikHandlers}
										/>
									)}

									<div className="mt-3 relative">
										<Label htmlFor="name" value="Wallet Label" />
										<span className="text-red-500 text-xs">*</span>

										<Field
											id="label"
											name="label"
											value={formikHandlers?.values?.label}
											onChange={formikHandlers.handleChange}
											className="bg-gray-50 border mt-2 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											type="text" />
										{formikHandlers?.errors?.label && formikHandlers?.touched?.label && (
											<span className="text-red-500 absolute text-xs">{formikHandlers?.errors?.label}</span>
										)}
									</div>
								</div>

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
					onSubmit={(values: IValuesShared) => {
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
										// setGeneratedKeys(null);
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

							{formikHandlers.values.method === DidMethod.WEB && (
								<SetDomainValueInput
									setDomainValue={(val: string) => setDomainValue(val)}
									domainValue={domainValue}
									formikHandlers={formikHandlers}
								/>
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
									<LedgerLessMethodsComponents
										formikHandlers={formikHandlers}
										setSelectedDid={(val: string) => setSelectedDid(val)}
										selectedDid={selectedDid}
										mappedData={mappedData}
										selectedLedger={selectedLedger}
										selectedNetwork={selectedNetwork}
									/>
								)}

							<div className="my-3 relative">
								<label
									htmlFor="DID Method"
									className="text-sm font-medium text-gray-900 dark:text-gray-300"
								>
									DID Method
								</label>
								<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
									{/* {showMethod(formikHandlers.values.method)} */}
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

export default SharedAgentForm;