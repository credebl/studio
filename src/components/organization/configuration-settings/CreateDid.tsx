import * as yup from 'yup';
import { Button, Checkbox, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';
import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import { createDid, getOrganizationById } from '../../../api/organization';
import type { EditOrgdetailsModalProps, IFormikValues } from '../interfaces';
import { createPolygonKeyValuePair } from '../../../api/Agent';
import { DidMethod } from '../../../common/enums';
import { nanoid } from 'nanoid';
import TokenWarningMessage from '../walletCommonComponents/TokenWarningMessage';
import CopyDid from '../../../commonComponents/CopyDid';
import { getFromLocalStorage } from '../../../api/Auth';
import { ethers } from 'ethers';

interface IPolygonKeys {
	privateKey: string;
	publicKeyBase58: string;
	address: string;
}

const CreateDIDModal = (props: EditOrgdetailsModalProps) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [seed, setSeed] = useState('');
	const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
	const [ledgerValue, setLedgerValue] = useState<string | null>(null);
	const [method, setMethod] = useState<string | null>(null);
	const [networkValue, setNetworkValue] = useState<string | null>(null);
	const [completeDidMethodValue, setCompleteDidMethodValue] = useState<string | null>(null);
	const [havePrivateKey, setHavePrivateKey] = useState(false);
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const fetchOrganizationDetails = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		setLoading(false);
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const didMethod = data?.data?.org_agents[0]?.orgDid
				?.split(':')
				.slice(0, 2)
				.join(':');
			setMethod(didMethod);


			let ledgerName;
			if (didMethod === DidMethod.INDY || DidMethod.POLYGON) {
				ledgerName = data?.data?.org_agents[0]?.orgDid.split(':')[1];
			} else {
				ledgerName = 'No Ledger';

			}
			setLedgerValue(ledgerName);

			let networkName;

			if (didMethod === DidMethod.INDY) {
				networkName = data?.data?.org_agents[0]?.orgDid.split(':').slice(2, 4).join(':');
			} else if (didMethod === DidMethod.POLYGON) {
				networkName = data?.data?.org_agents[0]?.orgDid.split(':')[2];
			} else {
				networkName = '';
			}
			setNetworkValue(networkName);


			let completeDidMethod;

			if (didMethod === DidMethod.INDY) {
				completeDidMethod = data?.data?.org_agents[0]?.orgDid.split(':').slice(0, 4).join(':');
			} else {
				completeDidMethod = didMethod;
			}
			setCompleteDidMethodValue(completeDidMethod);

		} else {
			console.error('Error in fetching organization:::');
		}
	};

	useEffect(() => {
		fetchOrganizationDetails();
	}, []);


	const checkWalletBalance = async (privateKey: string) => {
		try {
			const testnetUrl = 'https://rpc-amoy.polygon.technology';

			const provider = new ethers.JsonRpcProvider(testnetUrl)

			const wallet = new ethers.Wallet(privateKey, provider);
			const address = await wallet.getAddress();
			const balance = await provider.getBalance(address);

			const etherBalance = ethers.formatEther(balance);

			if (parseFloat(etherBalance) < 0.01) {
				setErrorMessage('You have insufficient funds.');
			} else {
				setErrorMessage(null);
			}


			return etherBalance;
		} catch (error) {
			console.error('Error checking wallet balance:', error);
			return null;
		}
	};

	useEffect(() => {
		if (privateKeyValue && privateKeyValue.length === 64) {
			checkWalletBalance(privateKeyValue);
		} else {
			setErrorMessage(null);
		}

	}, [privateKeyValue]);

	const createNewDid = async (values: IFormikValues) => {
		setLoading(true);
		const didData = {
			seed: values.method === DidMethod.POLYGON ? '' : seed,
			keyType: 'ed25519',
			method: values.method.split(':')[1],
			network: values.method === DidMethod.INDY ? values?.network : values.method === DidMethod.POLYGON ? `${values.ledger}:${values.network}` : '',
			domain: values.method === DidMethod.WEB ? values.domain : '',
			role: values.method === DidMethod.INDY ? 'endorser' : '',
			privatekey: values.method === DidMethod.POLYGON ? values.privatekey : '',
			did: values?.did ?? '',
			endorserDid: values?.endorserDid || '',
			isPrimaryDid: false,
		};
		try {
			const response = await createDid(didData);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				if (props?.onEditSucess) {
					props?.onEditSucess();
				}
				props.setOpenModal(false);
				props.setMessage(data?.message);
				setSuccessMsg(data?.message);
				setLoading(true);
			} else {
				setErrMsg(response as string);
				setLoading(false);
				props.setOpenModal(true);
			}
		} catch (error) {
			console.error('An error occurred while creating did:', error);
			setLoading(false);
		}
	};

	const generatePolygonKeyValuePair = async () => {
		try {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			const resCreatePolygonKeys = await createPolygonKeyValuePair(orgId);
			const { data } = resCreatePolygonKeys as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				setGeneratedKeys(data?.data);
				const privateKey = data?.data?.privateKey.slice(2)
				console.log('');
				setPrivateKeyValue( privateKeyValue || privateKey);
				const sdfgh = await checkWalletBalance(privateKeyValue || privateKey);
				console.log('sdfgh::::', sdfgh);

			}
		} catch (err) {
			console.error('Generate private key ERROR::::', err);
		}
	};

	useEffect(() => {
		setSeed(nanoid(32));
	}, []);

	useEffect(() => {
		if (havePrivateKey) {
			setPrivateKeyValue('');
			setErrorMessage(null);
			setGeneratedKeys(null);
		} else {
			setPrivateKeyValue('');
			setErrorMessage(null);
		}
	}, [havePrivateKey]);

	const validations = {
		...(DidMethod.WEB === method) && { domain: yup.string().required('Domain is required') },
		...(DidMethod.POLYGON === method) && { privatekey: yup.string().required('Private key is required').trim().length(64, 'Private key must be exactly 64 characters long') },
	};

	return (
		<Modal
			show={props.openModal}
			onClose={() => {				
				setErrMsg(null);
				setGeneratedKeys(null);
				setHavePrivateKey(false);
				props.setOpenModal(false);
			}}
		>
			<Modal.Header>Create DID</Modal.Header>
			<Modal.Body>
				<AlertComponent
					message={successMsg ?? errMsg}
					type={successMsg ? 'success' : 'failure'}
					onAlertClose={() => {
						setErrMsg(null);
						setSuccessMsg(null);
					}}
				/>
				<Formik
					initialValues={{
						method: method,
						ledger: ledgerValue,
						network: networkValue,
						domain: '',
						privatekey: generatedKeys?.privateKey.slice(2) || '',
						endorserDid: '',
					}}
					validationSchema={yup.object().shape(validations)}
					validateOnBlur
					validateOnChange
					enableReinitialize
					onSubmit={async (
						values: IFormikValues,
						{ resetForm }: FormikActions<IFormikValues>,
					) => {

						await createNewDid(values);

						setTimeout(() => {
							window.location.reload();
						}, 4000);
				
					}}
				>
					{(formikHandlers): JSX.Element => {
						return (
							<Form className="" onSubmit={formikHandlers.handleSubmit}>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="mb-3 relative">
										<label
											htmlFor="ledger"
											className="text-sm font-medium text-gray-900 dark:text-gray-300"
										>
											Ledger
											<span className="text-red-500 text-xs">*</span>
										</label>
										<input
											value={formikHandlers.values.ledger}
											onChange={(e) => {
												formikHandlers.handleChange(e);
												setLedgerValue(e.target.value);
											}}
											id="ledger"
											name="ledger"
											className="bg-gray-50 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white h-11"
											readOnly
										>
										</input>
									</div>

									{formikHandlers.values.method !== DidMethod.KEY && (

										<div className="mb-3 relative">
											<label
												htmlFor="method"
												className="text-sm font-medium text-gray-900 dark:text-gray-300"
											>Method <span className="text-red-500 text-xs">*</span>
											</label>
											<input
												value={formikHandlers.values.method}
												onChange={(e) => {
													formikHandlers.handleChange(e);
													setMethod(e.target.value);
												}}

												id="method"
												name="method"
												className="bg-gray-50 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white h-11"
												readOnly
											>
											</input>
										</div>
									)}

									{formikHandlers.values.method !== DidMethod.WEB &&
										formikHandlers.values.method !== DidMethod.KEY && (
											<div className="mb-3 relative">
												<label
													htmlFor="network"
													className="text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Network <span className="text-red-500 text-xs">*</span>
												</label>
												<input
													value={formikHandlers.values.network}
													onChange={(e) => {
														formikHandlers.handleChange(e);
														setNetworkValue(e.target.value);
													}}

													id="network"
													name="network"
													className="bg-gray-50 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white h-11"
													readOnly
												>
												</input>
											</div>
										)}

									{formikHandlers.values.method === DidMethod.WEB && (
										<div>
											<div>
												<Label
													htmlFor="domain"
													className="text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Domain <span className="text-red-500 text-xs">*</span>
												</Label>
												<Field
													id="domain"
													name="domain"
													className="bg-gray-50 min-h-[44px] border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:bg-gray-100"
													placeholder={`Enter Name`}
													onChange={formikHandlers.handleChange}
												/>
												{formikHandlers.errors?.domain && formikHandlers.touched?.domain && (
													<span className="static bottom-0 text-red-500 text-xs">
														{formikHandlers.errors?.domain}
													</span>
												)}

											</div>
										</div>
									)}
									<div>

										<label
											htmlFor="did-method"
											className="text-sm font-medium text-gray-900 dark:text-gray-300"
										>
											DID Method <span className="text-red-500 text-xs">*</span>
										</label>
										<input
											id="did-method"
											disabled={true}
											name="did-method"
											value={completeDidMethodValue}
											className="bg-gray-50 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white h-11"
											placeholder="DID Method"
											readOnly
										/>
									</div>


									{formikHandlers.values.method === DidMethod.POLYGON && (
										<>
											<div className="mb-3 relative">
												<div className="flex items-center gap-2 mt-4">
													<Checkbox
														id="havePrivateKey"
														onChange={(e) => setHavePrivateKey(e.target.checked)} />
													<Label className="flex" htmlFor="havePrivateKey">
														<p>Already have a private key?</p>
													</Label>
												</div>
												{!havePrivateKey ? (
													<>
														<div className="my-3 relative flex justify-between">
															<div className="mt-4">
																<Label value="Generate private key" />
																<span className="text-red-500 text-xs">*</span>
															</div>

															<Button
																type="button"
																className="h-min p-0 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
																onClick={() => generatePolygonKeyValuePair()}
															>
																Generate
															</Button>
														</div>
														{generatedKeys && (
															<>
																<div className="mt-3 relative flex items-center">

																	<Field
																		type="text"
																		id="privatekey"
																		name="privatekey"
																		className="truncate bg-gray-50 border mt-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
																		value={generatedKeys.privateKey.slice(2)}
																		placeholder="Generated private key"
																		readOnly />
																	<div className='mt-4'>
																		<CopyDid
																			className="align-center hidden text-sm text-gray-900 dark:text-white truncate mt-8"
																			value={generatedKeys.privateKey.slice(2)}
																		/>
																	</div>
																</div>


																{formikHandlers?.errors?.privatekey &&
																	formikHandlers?.touched?.privatekey && (
																		<span className="static botton-0 text-red-500 text-xs">
																			{formikHandlers?.errors?.privatekey}
																		</span>
																	)}
																{errorMessage && (
																	<span className="static bottom-0 text-red-500 text-xs">
																		{errorMessage}
																	</span>
																)}
																<TokenWarningMessage />
																<div className="my-3 relative">
																	<p className="text-sm truncate">
																		<span className="font-semibold text-gray-900 dark:text-white">
																			Address:
																		</span>
																		<div className="flex">
																			<CopyDid
																				className="align-center block text-sm text-gray-900 dark:text-white truncate"
																				value={generatedKeys.address} />
																		</div>
																	</p>
																</div>
															</>
														)}
													</>
												) : (
													<>
														<Field
															type="text"
															id="privatekey"
															name="privatekey"
															className="truncate bg-gray-50 border mt-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
															value={formikHandlers.values.privatekey}
															onChange={(e) => {
																formikHandlers.setFieldValue('privatekey', e.target.value);
															}
															}
															placeholder="Enter private key" />
														<div>	
														</div>
														{formikHandlers?.errors?.privatekey &&
																	formikHandlers?.touched?.privatekey && (
																		<span className="static botton-0 text-red-500 text-xs">
																			{formikHandlers?.errors?.privatekey}
																		</span>
																	)}
																{errorMessage && (
																	<span className="static bottom-0 text-red-500 text-xs">
																		{errorMessage}
																	</span>
																)}
														<TokenWarningMessage />
													</>
												)}
											</div>
											<div className="grid-col-1 mb-2 relative mt-4">
												<Label className="flex mb-2">
													<p>Follow these instructions to generate polygon tokens:</p>
												</Label>
												<ol>
													<li className='mb-2'>
														<span className='font-semibold text-sm text-gray-800'>Step 1:</span>
														<div className='ml-4 text-sm text-gray-700'>Copy the address and get the free tokens for the testnet.<div> For eg. use&nbsp;<a href='https://faucet.polygon.technology/' className='text-blue-900 text-sm underline'>https://faucet.polygon.technology/&nbsp;</a>
															to get free token
														</div>
														</div>
													</li>
													<li className='mb-2'>
														<span className='font-semibold text-sm'>Step 2:</span>
														<div className='ml-4 text-sm text-gray-700'>Check that you have recieved the tokens.</div>
														<div className='ml-4 text-sm text-gray-700'>For eg. copy the address and check the balance on
															<div>
																<a href='https://mumbai.polygonscan.com/' className='text-blue-900 text-sm underline'>
																	https://mumbai.polygonscan.com/&nbsp;
																</a>

															</div>
														</div>
													</li>
												</ol>
											</div>
										</>
									)}
								</div>
								<div className="flex justify-end mt-4">
									<Button
										type="submit"
										isProcessing={loading}
										disabled={formikHandlers.values.method === DidMethod.POLYGON && !formikHandlers.values.privatekey}
										className="mb-2 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
									>
										Submit
									</Button>
								</div>
							</Form>
						);
					}}

				</Formik>
			</Modal.Body>
		</Modal>

	)
};

export default CreateDIDModal;
