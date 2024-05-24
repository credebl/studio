import * as yup from 'yup';
import { Button, Modal } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import type { FormikHelpers as FormikActions } from 'formik';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';
import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import { createDid, getOrganizationById } from '../../../api/organization';
import type { EditOrgdetailsModalProps, IFormikValues, Organisation } from '../interfaces';
import { createPolygonKeyValuePair, getLedgerConfig } from '../../../api/Agent';
import { DidMethod } from '../../../common/enums';
import { nanoid } from 'nanoid';
import TokenWarningMessage from '../walletCommonComponents/TokenWarningMessage';
import CopyDid from '../../../commonComponents/CopyDid';
import GenerateBtnPolygon from '../walletCommonComponents/GenerateBtnPolygon';
import { getFromLocalStorage } from '../../../api/Auth';


interface IPolygonKeys {
	privateKey: string;
	publicKeyBase58: string;
	address: string;
}

interface ILedgerConfig {
	[method: string]: {
		[network: string]: string;
	};
}

interface ILedgerItem {
	name: string;
	details: {
		[network: string]: string;
	};
}

const CreateDIDModal = (props: EditOrgdetailsModalProps) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [mappedData, setMappedData] = useState<ILedgerConfig>({});
	const [erroMsg, setErrMsg] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [seed, setSeed] = useState('');
	const [selectedMethod, setSelectedMethod] = useState('');
	const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
	const [ledgerName, setLedgerName] = useState<string | null>(null);
	const fetchLedgerConfig = async () => {
		try {
			const { data } = (await getLedgerConfig()) as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const ledgerdata: ILedgerConfig = {};
				data.data.forEach((item: ILedgerItem) => {
					ledgerdata[item.name.toLowerCase()] = { ...item.details };
				});
				setMappedData(ledgerdata);
			}
		} catch (err) {
			console.error('Error in fetching ledger config:::', err);
		}
	};

	const fetchOrganizationDetails = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId as string);
		const { data } = response as AxiosResponse;
		setLoading(false);
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const didMethod = data?.data?.org_agents[0]?.orgDid
				?.split(':')
				.slice(0, 2)
				.join(':');
			let getLedgerName;
			switch (didMethod) {
				case 'did:indy':
				case 'did:polygon':
					getLedgerName = data?.data?.org_agents[0]?.ledgers?.name;
					setLedgerName(getLedgerName);

					break;
				case 'did:web':
				case 'did:key':
					getLedgerName = data?.data?.org_agents[0]?.orgDid
						?.split(':')
						.slice(1)[0];
					setLedgerName(getLedgerName);

					break;
				default:
					console.error('Unsupported DID format');
			}
		} else {
			console.error('Error in fetching organization:::');
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchOrganizationDetails();
	}, []);

	const createNewDid = async (values: IFormikValues) => {
		setLoading(true);

		const didData = {
			seed: values.method === DidMethod.POLYGON ? '' : seed,
			keyType: 'ed25519',
			method: values.method,
			network:
				values.method === DidMethod.POLYGON
					? `${values.method}:${values.network}`
					: values.method !== DidMethod.KEY
					? `${values.ledger}:${values.network}`
					: '',
			domain: values.method === DidMethod.WEB ? values.domain : '',
			role: values.method === DidMethod.INDY ? 'endorser' : '',
			privatekey: values.method === DidMethod.POLYGON ? values.privatekey : '',
			did: '',
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
				setLoading(false);
			} else {
				setErrMsg(response as string);
				setLoading(false);
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
			}
		} catch (err) {
			console.error('Generate private key ERROR::::', err);
		}
	};

	const showMethod = (
		method: string,
		selectedLedger: string,
		selectedMethod: string,
		selectedNetwork: string,
	): string => {
		switch (method) {
			case DidMethod.POLYGON: {
				return mappedData && selectedNetwork && method
					? mappedData[method][selectedNetwork] || ''
					: '';
			}
			case DidMethod.INDY: {
				return mappedData && selectedLedger && selectedNetwork && method
					? mappedData[method][selectedLedger][selectedNetwork] || ''
					: '';
			}
			case DidMethod.KEY:
			case DidMethod.WEB: {
				return mappedData && method ? mappedData[method][method] || '' : '';
			}
			default:
				return '';
		}
	};

	useEffect(() => {
		fetchLedgerConfig();
		setSeed(nanoid(32));
	}, []);

	const validations = {
		method: yup.string().required('Method is required').trim(),
		ledger: yup.string(),
		network: yup.string(),
		domain: yup.string(),
		privatekey: yup.string(),
	};

	if (selectedMethod === DidMethod.WEB) {
		validations['domain'] = yup.string().required('Domain is required').trim();
	}

	if (selectedMethod === DidMethod.POLYGON) {
		(validations['network'] = yup
			.string()
			.required('Network is required')
			.trim()),
			(validations['privatekey'] = yup
				.string()
				.required('Private key is required')
				.trim()
				.length(64, 'Private key must be exactly 64 characters long'));
	}

	if (selectedMethod === DidMethod.INDY) {
		(validations['ledger'] = yup.string().required('Ledger is required')),
			(validations['network'] = yup.string().required('Network is required'));
	}

	return (
		<Modal
			show={props.openModal}
			onClose={() => {
				props.setOpenModal(false);
				setErrMsg(null);
			}}
		>
			<Modal.Header>Create DID</Modal.Header>
			<Modal.Body>
				<AlertComponent
					message={successMsg ?? erroMsg}
					type={successMsg ? 'success' : 'failure'}
					onAlertClose={() => {
						setErrMsg(null);
						setSuccessMsg(null);
					}}
				/>
				<Formik
					initialValues={{
						method: '',
						ledger: '',
						network: '',
						domain: '',
						privatekey: '',
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
						const didMethodValue = showMethod(
							values.method,
							values.ledger,
							values.method,
							values.network,
						);

						const didMethodName = didMethodValue
							.split(':')
							.slice(0, 2)
							.join(':');
						let selectedLedgerName;

						switch (didMethodName) {
							case 'did:indy':
								selectedLedgerName = didMethodValue
									.split(':')
									.slice(-2)
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ');

								break;

							case 'did:polygon':
								selectedLedgerName = didMethodValue
									.split(':')
									.slice(1)
									.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
									.join(' ');

								break;

							case 'did:web':
							case 'did:key':
								selectedLedgerName = didMethodValue.split(':')[1];

								break;

							default:
								console.error('Unsupported DID format');
						}

						if (ledgerName !== selectedLedgerName) {
							setErrMsg('This ledger is not applicable to create a DID');
						} else {
							await createNewDid(values);
							setErrMsg(null);
							window.location.reload();
						}
					}}
				>
					{(formikHandlers): JSX.Element => {
						return (
							<Form className="" onSubmit={formikHandlers.handleSubmit}>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
												formikHandlers.setFieldValue('ledger', '');
												formikHandlers.setFieldValue('network', '');
												setSelectedMethod(e.target.value);
											}}
											id="method"
											name="method"
											className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
										>
											<option value="">Select Method</option>
											{mappedData &&
												Object.keys(mappedData)?.map((method) => (
													<option key={method} value={method}>
														{method.charAt(0).toUpperCase() + method.slice(1)}
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

									{formikHandlers.values.method !== DidMethod.POLYGON &&
										formikHandlers.values.method !== DidMethod.KEY &&
										formikHandlers.values.method !== DidMethod.WEB && (
											<div className="mb-3 relative">
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
														formikHandlers.setFieldValue('network', '');
													}}
													id="ledger"
													name="ledger"
													className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
												>
													<option value="">Select Ledger</option>
													{mappedData &&
														formikHandlers?.values?.method &&
														mappedData[formikHandlers?.values?.method] &&
														Object.keys(
															mappedData[formikHandlers?.values?.method],
														)?.map((ledger) => (
															<option key={ledger} value={ledger}>
																{ledger.charAt(0).toUpperCase() +
																	ledger.slice(1)}
															</option>
														))}
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
											<div className="mb-3 relative">
												<label
													htmlFor="network"
													className="text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Network
													<span className="text-red-500 text-xs">*</span>
												</label>
												<select
													onChange={formikHandlers.handleChange}
													id="network"
													name="network"
													className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
												>
													<option value="">Select Network</option>
													{mappedData &&
														formikHandlers?.values?.method &&
														mappedData[formikHandlers?.values?.method] &&
														Object.keys(
															formikHandlers.values.method === DidMethod.INDY &&
																formikHandlers?.values?.ledger
																? mappedData[formikHandlers?.values?.method][
																		formikHandlers?.values?.ledger
																  ]
																: mappedData[formikHandlers?.values?.method],
														)?.map((ledger) => (
															<option key={ledger} value={ledger}>
																{ledger.charAt(0).toUpperCase() +
																	ledger.slice(1)}
															</option>
														))}
												</select>
												{formikHandlers?.errors?.network &&
													formikHandlers?.touched?.network && (
														<span className="absolute botton-0 text-red-500 text-xs">
															{formikHandlers?.errors?.network}
														</span>
													)}
											</div>
										)}
									{formikHandlers.values.method === DidMethod.POLYGON && (
										<div>
											{formikHandlers.values.method === DidMethod.POLYGON && (
												<GenerateBtnPolygon
													generatePolygonKeyValuePair={() =>
														generatePolygonKeyValuePair()
													}
												/>
											)}
											{generatedKeys && (
												<div className="mb-3 relative">
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

											{generatedKeys &&
												formikHandlers.values.method === DidMethod.POLYGON && (
													<TokenWarningMessage />
												)}

											{formikHandlers.values.method === DidMethod.POLYGON && (
												<div>
													<div>
														<label
															htmlFor="privatekey"
															className="text-sm font-medium text-gray-900 dark:text-gray-300"
														>
															Private key
															<span className="text-red-500 text-xs">*</span>
														</label>
														<Field
															id="private key"
															name="privatekey"
															className="bg-gray-50 min-h-[44px] border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:bg-gray-100"
															placeholder="Enter Private Key"
															onChange={formikHandlers.handleChange}
														/>
													</div>
													{formikHandlers?.errors?.privatekey &&
														formikHandlers?.touched?.privatekey && (
															<span className="absolute botton-0 text-red-500 text-xs">
																{formikHandlers?.errors?.privatekey}
															</span>
														)}
												</div>
											)}
										</div>
									)}

									{formikHandlers.values.method === DidMethod.WEB && (
										<div>
											<div>
												<label
													htmlFor="domain"
													className="text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Domain
													<span className="text-red-500 text-xs">*</span>
												</label>
												<Field
													id="domain"
													name="domain"
													className="bg-gray-50 min-h-[44px] border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:bg-gray-100"
													placeholder="Enter Domain"
													onChange={formikHandlers.handleChange}
												/>
											</div>
											{formikHandlers?.errors?.domain &&
												formikHandlers?.touched?.domain && (
													<span className="absolute botton-0 text-red-500 text-xs">
														{formikHandlers?.errors?.domain}
													</span>
												)}
										</div>
									)}
									<div
										className={`${
											formikHandlers?.values?.method === DidMethod.POLYGON
												? 'mt-auto'
												: ''
										}`}
									>
										<label
											htmlFor="did-method"
											className="text-sm font-medium text-gray-900 dark:text-gray-300"
										>
											DID Method
											<span className="text-red-500 text-xs">*</span>
										</label>
										<Field
											id="did-method"
											disabled={true}
											name="did-method"
											value={showMethod(
												formikHandlers.values.method,
												formikHandlers.values.ledger,
												formikHandlers.values.method,
												formikHandlers.values.network,
											)}
											className="bg-gray-50 min-h-[44px] border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:bg-gray-100"
											placeholder="DID Method"
											onChange={formikHandlers.handleChange}
										/>
									</div>
								</div>
								<div className="flex justify-end mt-4">
									<Button
										type="submit"
										isProcessing={loading}
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
	);
};

export default CreateDIDModal;
