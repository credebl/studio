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
import React, { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import DedicatedIllustrate from './DedicatedIllustrate';
import InputCopy from '../InputCopy';
import SOCKET from '../../config/SocketConfig';
import SharedIllustrate from './SharedIllustrate';
import { nanoid } from 'nanoid';
import {
	getLedgers,
} from '../../api/Agent';
import { AlertComponent } from '../AlertComponent';
import { DidMethod } from '../../common/enums';
import WalletSteps from './WalletSteps';
import SharedAgentForm from './SharedAgentForm';


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
		privateKey: string,
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
			.matches(
				/^[A-Za-z0-9-][^ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/,
				'Wallet name must be alphanumeric only',
			)
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
		privateKey: string,
		domain: string,
		endPoint: string,
	) => {
		const polygonPrivateKey = privateKey.slice(2);
		setLoading(true);
		const payload = {
			keyType: values.keyType || 'ed25519',
			method: values.method || '',
			ledger: values.method === DidMethod.INDY ? values.ledger : '',
			label: values.label,
			privatekey: values.method === DidMethod.POLYGON ? polygonPrivateKey : '',
			seed: values.method === DidMethod.POLYGON ? '' : values.seed || seeds,
			network:
				values.method === DidMethod.POLYGON
					? `${values?.method}:${values?.network}`
					: `${values?.ledger}:${values?.network}`,
			domain: values.method === DidMethod.WEB ? domain : '',
			role: values.method === DidMethod.INDY ? values?.role || 'endorser' : '',
			endorserDid: values?.endorserDid,
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

export default WalletSpinup;