import * as yup from 'yup';
import { Button,  Label } from 'flowbite-react';
import { Field, Form, Formik, type FormikProps } from 'formik';
import {
	apiStatusCodes,
	storageKeys,
} from '../../../config/CommonConstant';
import { useEffect, useState, type ChangeEvent } from 'react';
import { HttpStatusCode, type AxiosResponse } from 'axios';
import {
	getLedgerConfig,
	getLedgers
} from '../../../api/Agent';
import { DidMethod } from '../../../common/enums';
import type { IDedicatedAgentForm, ILedgerConfigData, ILedgerItem, IValuesShared } from './interfaces';
import { getFromLocalStorage, setToLocalStorage } from '../../../api/Auth';
import CopyDid from '../../../commonComponents/CopyDid';
import SetDomainValueInput from './SetDomainValueInput';
import SetPrivateKeyValueInput from './SetPrivateKeyValue';
import { getOrganizationById, setAgentConfigDetails } from '../../../api/organization';
import type { IDedicatedAgentConfig, Organisation } from '../interfaces';

interface DedicatedAgentPayload {
	walletName: string;
	agentEndpoint: string;
	apiKey: string;
	seed:string;
	keyType:string;
	method:string;
	network:string;
	role:string;
}

const DedicatedAgentForm = ({
	seeds,
	loading,
	 submitDedicatedWallet,
 }: IDedicatedAgentForm) => {

	const [createDidFormFlag, setCreateDidFormFlag]=useState<boolean>(false)
	const [seedVal, setSeedVal] = useState('');
	const [mappedData, setMappedData] = useState(null);
	const [selectedLedger, setSelectedLedger] = useState('');
	const [selectedDid, setSelectedDid] = useState('');
	const [selectedMethod, setSelectedMethod]=useState('')
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');
	const [domainValue, setDomainValue] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);


	const fetchLedgerConfigDetails = async () => {
		try {
			const { data } = await getLedgerConfig() as AxiosResponse;
	
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const ledgerConfigDetails: ILedgerConfigData = {
					indy: {
						'did:indy': {}
					},
					polygon: {
						'did:polygon': {}
					},
					noLedger: {}
				};
				
				data.data.forEach(({ name, details }: ILedgerItem) => {
					const lowerCaseName = name.toLowerCase();
				
					if (lowerCaseName === 'indy' && details) {
						for (const [key, subDetails] of Object.entries(details)) {
							if (typeof subDetails === 'object' && subDetails !== null) {
								for (const [subKey, value] of Object.entries(subDetails)) {
									const formattedKey = `${key}:${subKey}`.replace('did:indy:', '');
									ledgerConfigDetails.indy['did:indy'][formattedKey] = value;
								}
							}
						}
					} else if (lowerCaseName === 'polygon' && details) {
						for (const [key, value] of Object.entries(details)) {
							if (typeof value === 'object' && value !== null) {
								for (const [subKey, subValue] of Object.entries(value)) {
									ledgerConfigDetails.polygon['did:polygon'][subKey] = subValue;
								}
							} else if (typeof value === 'string') {
								ledgerConfigDetails.polygon['did:polygon'][key] = value;
							}
						}
					} else if (lowerCaseName === 'noledger' && details) {
						for (const [key, value] of Object.entries(details)) {
							ledgerConfigDetails.noLedger[key] = value  as string;
						}
					}
				});
				
	
				setMappedData(ledgerConfigDetails);
			}
		} catch (err) {
			console.error('Fetch Network ERROR::::', err);
		}
	};


	const fetchOrganizationDetails = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId as string);
		const { data } = response as AxiosResponse;
		
		
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const walletName = data?.data?.org_agents[0]?.walletName

				if(walletName){
					setCreateDidFormFlag(true)
				}
		} 
		
	};

	const fetchNetwork = async () => {
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

	const handleLedgerChanges = (e: ChangeEvent<HTMLInputElement>) => {
		setSelectedLedger(e.target.value);
		setSelectedMethod('');
		setSelectedDid('');
	};
	const handleMethodChanges = (e: ChangeEvent<HTMLInputElement>) => {
		setSelectedMethod(e.target.value);
		setSelectedDid('');
	};

	const handleNetworkChanges = (e: ChangeEvent<HTMLInputElement>) => {
		const didMethod = `${e.target.value}`;
		setSelectedDid(didMethod);
	};
	

	const getLedgerList = async () => {
		await fetchNetwork();
	};

	useEffect(() => {
	fetchOrganizationDetails();
	}, []);

	useEffect(() => {
		getLedgerList();
		fetchLedgerConfigDetails();
	}, []);

	useEffect(() => {
		console.log('seedVal',seedVal)
		setSeedVal(seeds)
	}, [seeds])
	const validation = {
		walletName: yup
			.string()
			.min(6, 'Wallet name must be at least 6 characters')
			.max(20, 'Wallet name must be at most 20 characters')
			.trim()
			.required('Wallet name is required')
			.label('Wallet name'),

		agentEndpoint:yup
			.string()
			.url()
			.trim()
			.required('agent endpoint is required')
			.label('Agent Endpoint'),
			
		apiKey:yup
			.string()
			.trim()
			.required('Api key is required')
			.label('Api key')
	};

	const didCreationValidation={
		method:yup.string().trim().required().label('Method'),
		...(DidMethod.INDY === selectedMethod || DidMethod.POLYGON === selectedMethod) && { network: yup.string().required('Network is required') },
		...(DidMethod.WEB === selectedMethod) && { domain: yup.string().required('Domain is required') },
		...(DidMethod.POLYGON === selectedMethod) && { privatekey: yup.string().required('Private key is required').trim().length(64, 'Private key must be exactly 64 characters long') },
	
	}

	
const setAgentConfig=async (values: IDedicatedAgentConfig)=>{
	setIsLoading(true);
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const payload = {
			walletName: values.walletName,
			agentEndpoint: values.agentEndpoint,
			apiKey: values.apiKey
		  };
	
	  try {
		const agentConfigResponse = await setAgentConfigDetails(payload, orgId)
	  
		const { data } = agentConfigResponse as AxiosResponse;
		
		if (data?.statusCode === HttpStatusCode.Created) {
			setIsLoading(false);

			await fetchOrganizationDetails()
	}
	  }
	  catch (error) {
		const err = error as Error
		return err?.message
	  }
}

const methodRenderOptions = (formikHandlers: { handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
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
					handleMethodChanges(e);
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

	const networkRenderOptions = (formikHandlers: { handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
		if (!selectedLedger || !selectedMethod) {
			return null;
		}
		const networks = mappedData?.[selectedLedger][selectedMethod];
		if (!networks) {
			return null;
		}

		return Object.keys(networks).map((network) => (
			<div key={network} className="mt-2">
				<input
					type="radio"
					id={network}
					name="network"
					value={networks[network]}
					onChange={(e) => {
						formikHandlers.handleChange(e)
						 handleNetworkChanges(e)
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
		<>
		{console.log("createDidFormFlag:::::::", createDidFormFlag)}
	 {!createDidFormFlag ?
 <Formik
	initialValues={{
				  walletName: '',
				  agentEndpoint: '',
				  apiKey: '',
			  }}
			  validationSchema={yup.object().shape(validation)}
			  onSubmit={async (values: DedicatedAgentPayload) => {
				 await setAgentConfig(values)

			  }}
			  >	
			  {(formikHandlers):JSX.Element => (
				  <Form className="mt-8 w-full gap-4">
					<div className='flex bg-[#F4F4F4] w-full p-4 gap-4'>	
					  <div className='flex flex-wrap w-full'>
						  <div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
							  <Label htmlFor="walletName" value="Wallet Name" />
							  <span className="text-red-500 text-xs">*</span>
						  </div>
						  <Field
							  id="walletName"
							  name="walletName"
							  value={formikHandlers.values.walletName}
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
					  <div className='flex flex-wrap w-full'>
						  <div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
							  <Label htmlFor="agentEndpoint" value="Agent Endpoint" />
							  <span className="text-red-500 text-xs">*</span>
						  </div>
						  <Field
							  id="agentEndpoint"
							  name="agentEndpoint"
							  value={formikHandlers.values.agentEndpoint}
							  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							  type="text"
						  />
						  {formikHandlers?.errors?.agentEndpoint &&
							  formikHandlers?.touched?.agentEndpoint && (
								  <span className="text-red-500 text-xs">
									  {formikHandlers?.errors?.agentEndpoint}
								  </span>
							  )}
					  </div>
					  <div className='flex flex-wrap w-full'>
						  <div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
							  <Label htmlFor="apiKey" value="Api Key" />
							  <span className="text-red-500 text-xs">*</span>
						  </div>
						  <Field
							  id="apiKey"
							  name="apiKey"
							  value={formikHandlers.values.apiKey}
							  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							  type="text"
						  />
						  {formikHandlers?.errors?.apiKey &&
							  formikHandlers?.touched?.apiKey && (
								  <span className="text-red-500 text-xs">
									  {formikHandlers?.errors?.apiKey}
								  </span>
							  )}
					  </div> 	
					</div>
					  <Button
						  isProcessing={isLoading}						
						  type="submit"
						  className='mt-4 float-right text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
					     >
						  Setup Config
					  </Button>
					
				  </Form>
				  )}
          </Formik>
:

		<Formik
		initialValues={{
			seed:'',
			keyType:'',
			method:'',
			network:'',
			role:'',
			ledger:'',
			privatekey: ''
		}}
		validationSchema={yup.object().shape(didCreationValidation)}
		onSubmit={async (values: IValuesShared) => {
			{console.log("setPK", privateKeyValue)}
			
			// await createNewDid(values)
			submitDedicatedWallet(
				values,
				privateKeyValue,
		            domainValue
			);
		}}
		
		>
				
		{(formikHandlers):JSX.Element => (
			<Form className="mt-4">
				<div className="my-3 bg-[#F4F4F4] max-w-lg -mt-4 pt-2 pb-4 pl-4 pr-4">
				
						<div className="block mt-3 relative">
							<Label value="Seed" />
						</div>
						<div className="flex">
							<CopyDid
								className="align-center block text-sm text-gray-900 dark:text-white"
								value={seedVal}
							/>
						</div>
					</div>
				
						<div className="grid grid-cols-4 gap-4 bg-[#F4F4F4] pl-4 pt-4 pb-4">
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
														handleLedgerChanges(e);
														setSelectedLedger(ledger);
														setSelectedMethod('');
														setSeedVal(seeds);
														// setSelectedNetwork('');
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
									{methodRenderOptions(formikHandlers)}
								</div>
								{formikHandlers.errors.method && formikHandlers.touched.method && (
									<span className="text-red-500 text-xs">
										{formikHandlers.errors.method}
									</span>
								)}
							</div>


							{selectedLedger !== 'noLedger' && (
								<div className="mb-3 relative">
									<label
										htmlFor="network"
										className="text-sm font-medium text-gray-900 dark:text-gray-300"
									>
										Network
										<span className="text-red-500 text-xs">*</span>
									</label>
									<div className="mt-2">
										{networkRenderOptions(formikHandlers)}
									</div>
									{formikHandlers.errors.network && formikHandlers.touched.network && (
										<span className="text-red-500 text-xs">
											{formikHandlers.errors.network}
										</span>
									)}
								</div>
							)}

							{selectedLedger !== 'noLedger' && (

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
										className="mt-2 bg-[#F4F4F4]" />
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
										className="bg-gray-50 border mt-2 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										type="text" />
									{formikHandlers?.errors?.label && formikHandlers?.touched?.label && (
										<span className="text-red-500 absolute text-xs">{formikHandlers?.errors?.label}</span>
									)}
								</div>
							</div>
						</div>


							<div className="grid grid-cols-2 bg-[#F4F4F4] mt-4 pl-4">
							{selectedMethod === 'did:polygon' && (
								<>
								
								<div className="grid-col-1">
									<SetPrivateKeyValueInput
									  setPrivateKeyValue={setPrivateKeyValue}
										privateKeyValue={privateKeyValue} formikHandlers={formikHandlers} />
								</div>
									<div className="grid-col-1 mb-2 relative mt-4">
										<Label className="flex mb-2">
											<p>Follow these instructions to generate polygon tokens:</p>
										</Label>
										<ol>
											<li className='mb-2'>
												<span className='font-semibold text-sm text-gray-800'>Step 1:</span>
												<div className='ml-4 text-sm text-gray-700'>
													Copy the address and get the free tokens for the testnet.
													<div> For eg. use&nbsp;
														<a href='https://faucet.polygon.technology/' className='text-blue-900 text-sm underline'>
															https://faucet.polygon.technology/&nbsp;
														</a>
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
									</div></>
							)}
						</div>

				
				<Button
						  isProcessing={loading}
						  type="submit"
						  className='float-right text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
					     >
						  Create did
					  </Button>

			</Form>
			)}
		    </Formik>
	}
		
		</>
	);
};
export default DedicatedAgentForm;