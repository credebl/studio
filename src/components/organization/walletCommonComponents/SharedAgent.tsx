import { Button, Label, Checkbox } from "flowbite-react";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import { useState, useEffect, type ChangeEvent } from "react";
import { getLedgerConfig, getLedgers } from "../../../api/Agent";
import { apiStatusCodes } from "../../../config/CommonConstant";
import * as yup from 'yup';
import type { AxiosResponse } from 'axios';
import CopyDid from '../../../commonComponents/CopyDid';
import { DidMethod, Ledgers, Network } from '../../../common/enums';
import SetDomainValueInput from './SetDomainValueInput';
import SetPrivateKeyValueInput from './SetPrivateKeyValue';
import type { ISharedAgentForm, IValuesShared } from "./interfaces";
import React from "react";
interface IDetails {
    [key: string]: string | { [subKey: string]: string };
}

interface ILedgerItem {
    name: string;
    details: IDetails;
}

interface ILedgerConfigData {
    indy: {
        'did:indy': {
            [key: string]: string;
        };
    };
    polygon: {
        'did:polygon': {
            [key: string]: string;
        };
    };
    noLedger: {
        [key: string]: string;
    };
}

const SharedAgentForm = ({
	orgName,
	maskedSeeds,
	seeds,
	submitSharedWallet,
}: ISharedAgentForm) => {
	const [haveDidShared, setHaveDidShared] = useState(false);
	const [selectedLedger, setSelectedLedger] = useState('');
	const [selectedMethod, setSelectedMethod] = useState(''); 
	const [selectedNetwork, setSelectedNetwork] = useState(''); 
	const [seedVal, setSeedVal] = useState('');
	const [maskedSeedVal, setMaskedSeedVal] = useState('');
	const [selectedDid, setSelectedDid] = useState('');
	const [mappedData, setMappedData] = useState(null);
	const [domainValue, setDomainValue] = useState<string>('');
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');

	const fetchLedgerConfig = async () => {
		try {
			const { data } = await getLedgerConfig() as AxiosResponse;
	
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const ledgerConfigData: ILedgerConfigData = {
					indy: {
						[`${DidMethod.INDY}`]: {}
					},
					polygon: {
						[`${DidMethod.POLYGON}`]: {}
					},
					noLedger: {}
				};
				
				data.data.forEach(({ name, details }: ILedgerItem) => {
					const lowerName = name.toLowerCase();
				
					if (lowerName === Ledgers.INDY && details) {
						for (const [key, subDetails] of Object.entries(details)) {
							if (typeof subDetails === 'object' && subDetails !== null) {
								for (const [subKey, value] of Object.entries(subDetails)) {
									const formattedKey = `${key}:${subKey}`.replace(`${DidMethod.INDY}:`, '');
									ledgerConfigData.indy[`${DidMethod.INDY}`][formattedKey] = value;
								}
							}
						}
					} else if (lowerName === Ledgers.POLYGON && details) {
						for (const [key, value] of Object.entries(details)) {
							if (typeof value === 'object' && value !== null) {
								for (const [subKey, subValue] of Object.entries(value)) {
									ledgerConfigData.polygon[`${DidMethod.POLYGON}`][subKey] = subValue;
								}
							} else if (typeof value === 'string') {
								ledgerConfigData.polygon[`${DidMethod.POLYGON}`][key] = value;
							}
						}
					} else if (lowerName === Ledgers.NO_LEDGER.toLowerCase() && details) {
						for (const [key, value] of Object.entries(details)) {
							ledgerConfigData.noLedger[key] = value  as string;
						}
					}
				});
				
	
				setMappedData(ledgerConfigData);
			}
		} catch (err) {
			console.error('Fetch Network ERROR::::', err);
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
			console.error('Fetch Network ERROR::::', err);
		}
	};

	const handleLedgerChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSelectedLedger(e.target.value);
		setSelectedMethod('');
		setSelectedNetwork('');
		setSelectedDid('');
	};

	const handleMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSelectedMethod(e.target.value);
		setSelectedDid('');
	};

	const handleNetworkChange = (e: ChangeEvent<HTMLInputElement>) => {
		const didMethod = `${e.target.value}`;
		setSelectedDid(didMethod);
	};

	const getLedgerList = async () => {
		await fetchNetworks();
	};

	useEffect(() => {
		getLedgerList();
		fetchLedgerConfig();
	}, []);

	useEffect(() => {
		setSeedVal(seeds);
		setMaskedSeedVal(maskedSeeds);
	}, [seeds]);

	const validations = {
		label: yup
			.string()
			.required('Wallet label is required')
			.trim()
			.min(2, 'Wallet label must be at least 2 characters')
			.max(25, 'Wallet label must be at most 25 characters'),
		method: yup.string().required('Method is required'),
		ledger: yup.string().required('Ledger is required'),
		...(haveDidShared) && {
			seed: yup.string().required('Seed is required'),
			did: yup.string().required('DID is required'),
		},
		...(DidMethod.INDY === selectedMethod || DidMethod.POLYGON === selectedMethod) && { network: yup.string().required('Network is required') },
		...(DidMethod.WEB === selectedMethod) && { domain: yup.string().required('Domain is required') },
	};

		const renderMethodOptions = (formikHandlers: { handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
		if (!selectedLedger) {
			return null;
		}

		const methods = mappedData?.[selectedLedger];

		if (!methods) {
			return null;
		}

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
						setDomainValue('');
					}}
					className="mr-2"
				/>
				<label htmlFor={method} className="text-gray-700 dark:text-gray-300">
					{method}
				</label>
			</div>
		));
	};

	const renderNetworkOptions = (formikHandlers: { handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
		if (!selectedLedger || !selectedMethod) {
			return null;
		}

		const networks = mappedData?.[selectedLedger][selectedMethod];

		if (!networks) {
			return null;
		}

		let filteredNetworks = Object.keys(networks);
		if (selectedMethod === DidMethod.POLYGON) {
			filteredNetworks = filteredNetworks.filter(network => network === Network.TESTNET);
		}

		return filteredNetworks.map((network) => (
				<div key={network} className="mt-2">
				<input
					type="radio"
					id={network}
					name="network"
					value={networks[network]}
					onChange={(e) => {
						formikHandlers.handleChange(e)
						 handleNetworkChange(e)
						 setSelectedNetwork(networks[network])
					}}
					className="mr-2"
				/>
				<label htmlFor={network} className="text-gray-700 dark:text-gray-300">
					{network}
				</label>
			</div>
		));
	};

	const isSubmitDisabled = () => {
		if (!selectedLedger) {
			return true;
		}
		else if ((selectedLedger === Ledgers.POLYGON && !privateKeyValue) || (selectedLedger === Ledgers.INDY && (!selectedMethod || !selectedNetwork))) {
			return true;
		}
		else if ((selectedLedger === Ledgers.NO_LEDGER && !selectedMethod) ||(selectedLedger === Ledgers.NO_LEDGER && selectedMethod === DidMethod.WEB && !domainValue)) {
			return true;
		}

		return false;
	};


	return (
		<div className="mt-4 flex-col gap-4">
			<div className="bg-[#F4F4F4] dark:bg-gray-700 max-w-lg">
				<div className="flex items-center gap-2 ml-4">
					<Checkbox
						id="haveDidShared"
						onChange={(e) => setHaveDidShared(e.target.checked)}
					/>
					<Label className="flex" htmlFor="haveDidShared">
						<p>Already have DID?</p>
					</Label>
				</div>
			</div>

			{!haveDidShared && (
				<div className="my-3 bg-[#F4F4F4] dark:bg-gray-700 max-w-lg">
					<div className="block text-sm font-medium text-gray-900 dark:text-white mb-1 pr-4 pl-4 pt-4 -mt-4">
						<Label value="Seed" />
					</div>
					<div className="flex ml-4 pb-2">
						<p className="align-center block text-sm text-gray-900 dark:text-white">{maskedSeedVal}</p>
						<CopyDid
							className="align-center hidden text-sm text-gray-900 dark:text-white"
							value={seedVal}
						/>
					</div>
				</div>
			)}

			<Formik
				initialValues={{
					seed: seedVal || '',
					method: '',
					network: '',
					did: '',
					ledger: '',
					domain: '',
					privatekey: '',
					label: orgName,
					keyType: ''
				}}
				validationSchema={yup.object().shape(validations)}
				onSubmit={(values: IValuesShared,
					actions: FormikHelpers<IValuesShared>
				) => {
					if (!values.privatekey) {
						values.privatekey = privateKeyValue;
					}
					values.network = selectedNetwork;
					submitSharedWallet(
						values,
						domainValue,
					);
					actions.resetForm();
				}}
			>
				{(formikHandlers) => (
					<Form className="mt-4">
						<div className="my-3 bg-[#F4F4F4] dark:bg-gray-700 max-w-lg -mt-4 pt-2 pb-4 pl-4 pr-4">

							{haveDidShared && (
								<><div className="mt-3 relative">
									<div className="block">
										<Label htmlFor="seed" value="Seed" />
										<span className="text-red-500 text-xs">*</span>
									</div>

									<Field
										id="seed"
										name="seed"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="text" />
									{formikHandlers?.errors?.seed &&
										formikHandlers?.touched?.seed && (
											<span className="text-red-500 absolute text-xs">
												{formikHandlers?.errors?.seed}
											</span>
										)}
								</div>
									<div className="mt-6 relative">
										<div className="block">
											<Label htmlFor="did" value="DID" />
											<span className="text-red-500 text-xs">*</span>
										</div>

										<Field
											id="did"
											name="did"
											className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
											type="text" />
										{formikHandlers?.errors?.did &&
											formikHandlers?.touched?.did && (
												<span className="text-red-500 absolute text-xs">
													{formikHandlers?.errors?.did}
												</span>
											)}
									</div></>

							)
							}
						</div>
						<div className="grid md:grid-cols-4 gap-4 pl-4 pt-4 bg-[#F4F4F4] dark:bg-gray-700 pb-4">
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
														setSelectedDid('');
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
								{formikHandlers.errors.ledger && formikHandlers.touched.ledger && (
									<span className="text-red-500 text-xs">
										{formikHandlers.errors.ledger}
									</span>
								)}
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
									<span className="text-red-500 text-xs">
										{formikHandlers.errors.method}
									</span>
								)}
							</div>

							{selectedLedger !== Ledgers.NO_LEDGER && (
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
									{formikHandlers.errors.network && formikHandlers.touched.network && (
										<span className="text-red-500 text-xs">
											{formikHandlers.errors.network}
										</span>
									)}
								</div>
							)}

							{selectedLedger !== Ledgers.NO_LEDGER && (

								<div className="mb-3 relative">
									<label
										htmlFor="did-method"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										DID Method
										<span className="text-red-500 text-xs">*</span>
									</label>
									<div>
									<input
										type="text"
										id="did-method"
										name="did-method"
										value={selectedDid}
										readOnly
										className="mt-2 bg-[#F4F4F4] w-[180px] dark:bg-gray-700 text-gray-900 dark:text-gray-300" />
										</div>
								</div>
							)}

							<div>

								{selectedMethod === DidMethod.WEB && (
									<SetDomainValueInput
										setDomainValue={setDomainValue}
										domainValue={domainValue}
										formikHandlers={formikHandlers}
									/>

								)}

								<div className="mt-3 relative pb-4">
									<Label htmlFor="name" value="Wallet Label" />
									<span className="text-red-500 text-xs">*</span>

									<Field
										id="label"
										name="label"
										value={formikHandlers?.values?.label}
										onChange={formikHandlers.handleChange}
										className="bg-gray-50 border mt-2 w-full border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="text" />
									{formikHandlers?.errors?.label && formikHandlers?.touched?.label && (
										<span className="text-red-500 absolute text-xs">{formikHandlers?.errors?.label}</span>
									)}
								</div>
							</div>

						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 bg-[#F4F4F4] dark:bg-gray-700 mt-4 pl-4 pr-2 md:pr-0">
							{selectedMethod === DidMethod.POLYGON && (
								<><div className="grid-col-1">
									<SetPrivateKeyValueInput setPrivateKeyValue={setPrivateKeyValue}
										privateKeyValue={privateKeyValue} formikHandlers={formikHandlers} />	
								</div>
									<div className="grid-col-1 mb-2 relative mt-4">
										<Label className="flex mb-2">
											<p>Follow these instructions to generate polygon tokens:</p>
										</Label>
										<ol>
											<li className='mb-2'>
												<span className='font-semibold text-sm text-gray-800 dark:text-white'>Step 1:</span>
												<div className='ml-4 text-sm text-gray-900 dark:text-white'>
													Copy the address and get the free tokens for the testnet.
													<div> For eg. use&nbsp;
														<a href='https://faucet.polygon.technology/' className='text-blue-900 dark:text-primary-500 text-sm underline'>
															`https://faucet.polygon.technology/`&nbsp;
														</a>
														to get free token
													</div>
												</div>
											</li>
											<li className='mb-2'>
												<span className='font-semibold text-sm gray-800 dark:text-white'>Step 2:</span>
												<div className='ml-4 text-sm text-gray-900 dark:text-white'>Check that you have recieved the tokens.</div>
												<div className='ml-4 text-sm text-gray-900 dark:text-white'>For eg. copy the address and check the balance on
													<div>
														<a href='https://mumbai.polygonscan.com/' className='text-blue-900 dark:text-primary-500 text-sm underline'>
															https://mumbai.polygonscan.com/&nbsp;
														</a>
													</div>
												</div>
											</li>
										</ol>
									</div></>
							)}
						</div>

						<div className="w-full flex justify-end">
							<Button
							disabled={isSubmitDisabled()}
								type="submit"
								className="flex h-min p-0.5 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								Submit
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);

};

export default SharedAgentForm;