import * as yup from 'yup';
import { Button, Checkbox, Label } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import {
    apiStatusCodes,
	passwordRegex,
	storageKeys,
} from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';
import InputCopy from '../../InputCopy';
import type { AxiosResponse } from 'axios';
import {
	createPolygonKeyValuePair,
	getLedgerConfig,
	getLedgers
} from '../../../api/Agent';
import { DidMethod } from '../../../common/enums';
import NetworkInput from './NetworkInput';
import type { IDedicatedAgentForm, IPolygonKeys, IValues } from './interfaces';
import { getFromLocalStorage } from '../../../api/Auth';
import { apiRoutes } from '../../../config/apiRoutes';
import { axiosPost } from '../../../services/apiRequests';
import CopyDid from '../../../commonComponents/CopyDid';
import GenerateBtnPolygon from './GenerateBtnPolygon';
import TokenWarningMessage from './TokenWarningMessage';
import SetDomainValueInput from './SetDomainValueInput';
import SetPrivateKeyValueInput from './SetPrivateKeyValue';


interface DedicatedAgentConfig {
	walletName: string;
	agentEndpoint: string;
	apiKey: string;
}

interface DidCreationConfig{
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
	const [isConfigDone, setIsConfigDone]=useState<boolean>(true)
	const [seedVal, setSeedVal] = useState('');
	const [mappedData, setMappedData] = useState(null);
	const [selectedMethod, setSelectedMethod]=useState(null)
	const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
	const [privateKeyValue, setPrivateKeyValue] = useState<string>('');
	const [domainValue, setDomainValue] = useState<string>('');
	// const [selectedLedger, setSelectedLedger] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState('');
	const [networkOptions, setNetworkOptions]=useState<string[]>([])

	const fetchLedgerConfig = async () => {
		try {
			const { data } = await getLedgerConfig();
			console.log('data',data)
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
	useEffect(() => {
		fetchLedgerConfig();
	}, []);

	useEffect(() => {
		console.log('seedVal',seedVal)
		setSeedVal(seeds)
	}, [seeds])
	const handleMethodChange=(e)=>{
		setSelectedMethod(e.target.value)
	}
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

	}
	// {
	// 	"seed": "jfrekfngdjrkfejhgdjfdkjhjdbeiuff",
	// 	"keyType": "ed25519",
	// 	"method": "indy",
	// 	"network": "bcovrin:testnet",
	// 	"role": "endorser",
	//   }

	const setAgentConfig=async (values: DedicatedAgentConfig)=>{
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const token = await getFromLocalStorage(storageKeys.TOKEN)

		const details = {
			url:  `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.setAgentConfig}`,
			payload:{
				"walletName": values.walletName,
				"agentEndpoint": values.agentEndpoint,
				"apiKey": values.apiKey
			  },
			config: { headers: {
				'Content-type': 'application/json',
				'Authorization': `Bearer ${token}`,
			  }, }
		  };
		
		  try {
			const response = await axiosPost(details)
			console.log('response',response)
			setIsConfigDone(true)
			return response
		  }
		  catch (error) {
			const err = error as Error
			return err?.message
		  }
	}

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

	useEffect(()=>{
		if(selectedMethod && mappedData){
			const ledgerDetails = mappedData[selectedMethod]
			const networkList:string[] = []
			Object.keys(ledgerDetails).map(ledger=>{
				Object.keys(ledgerDetails[ledger]).map(network=>{
					networkList.push(`${ledger}:${network}`)
				})
			})
			setNetworkOptions(networkList)
		}
	},[selectedMethod])

	return (
		<>
		<div className="flex items-center gap-2 mt-4">
				<Checkbox
					id="isConfigDone"
					onChange={(e) => setIsConfigDone(e.target.checked)}
				/>
				<Label className="flex" htmlFor="isConfigDone">
					<p>On-Premises</p>
				</Label>
			</div>
		{!isConfigDone ? (
			<Formik
		initialValues={{
			seed:seedVal,
			keyType:'ed25519',
			method:'',
			network:'',
			role:''
		}}
		validationSchema={yup.object().shape(didCreationValidation)}
		onSubmit={async (values: DidCreationConfig) => {
			console.log('did creation values',values);

		}}
		>	
		{(formikHandlers):JSX.Element => (
			<Form className="mt-8 space-y-4 max-w-lg flex-col gap-4">
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
				<div>
					<div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
						<Label htmlFor="keyType" value="Key Type" />
					</div>
					<div className='flex'>ed25519</div>
				</div>
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
							handleMethodChange(e);
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

				{formikHandlers.values.method===DidMethod.INDY&&
				<div className="my-3 relative">
					<label
					htmlFor="network"
					className="text-sm font-medium text-gray-900 dark:text-gray-300"
				>
					Network
					<span className="text-red-500 text-xs">*</span>
				</label>
				<select
					onChange={(e) => {
						formikHandlers.handleChange(e);
						setSelectedNetwork(e.target.value);
					}}
					value={selectedNetwork}
					id="network"
					name="network"
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
				>
					<option value="">Select Network</option>
						{mappedData &&
						networkOptions &&
						networkOptions.map(element=>(
							<option key={element} value={element}>
						 	{element}
						 </option>
						))
						}
				</select>

				{formikHandlers?.errors?.network &&
					formikHandlers?.touched?.network && (
						<span className="absolute botton-0 text-red-500 text-xs">
							{formikHandlers?.errors?.network}
						</span>
					)}
				</div>
				}
				<div className="my-3 relative">
					<label
						htmlFor="DID Method"
						className="text-sm font-medium text-gray-900 dark:text-gray-300"
					>
						DID Method
					</label>
					<div className="bg-gray-100 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
						{formikHandlers.values.method}
					</div>
				</div>
				<Button
					isProcessing={loading}
					type="submit"
					className='float-right text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
				>
					Create Did
				</Button>
			</Form>
			)}
		    </Formik>
		) : (
         <Formik
				initialValues={{
					walletName: '',
					agentEndpoint: '',
					apiKey: '',
				}}
				validationSchema={yup.object().shape(validation)}
				onSubmit={async (values: DedicatedAgentConfig) => {
					console.log('values',values);
					// agentHealthCheck(values.agentEndpoint,values.apiKey)
					setAgentConfig(values)
					

				}}
				>	
				{(formikHandlers):JSX.Element => (
					<Form className="mt-8 space-y-4 max-w-lg flex-col gap-4">
						<div>
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
						<div>
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
						<div>
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
						<Button
							isProcessing={loading}
							type="submit"
							className='float-right text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
						>
							Setup Config
						</Button>
					</Form>
					)}
				</Formik>
		)
	}	
		
		</>
	);
};
export default DedicatedAgentForm;