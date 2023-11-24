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
import { getLedgers } from '../../api/Agent';
import { AlertComponent } from '../AlertComponent'

interface Values {
	seed: string;
	walletName: string;
	password: string;
	did: string;
	network: string;
}

interface ValuesShared {
	label: string;
	seed?: string;
	did?: string;
	network: string;
}

enum AgentType {
	SHARED = 'shared',
	DEDICATED = 'dedicated',
}

interface INetworks {
	id: number
	name: string
}

interface ISharedAgentForm {
	seeds: string
	isCopied: boolean
	copyTextVal: (e: any) => void
	orgName: string
	loading: boolean
	submitSharedWallet: (values: ValuesShared) => void
}

interface IDedicatedAgentForm {
	seeds: string
	loading: boolean
	submitDedicatedWallet: (values: Values) => void
}

const fetchNetworks = async () => {
	try {
		const { data } = await getLedgers() as AxiosResponse
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			return data?.data 
		}
		return []
	} catch (err) {
		console.log(7578, err)
	}
}

const NetworkInput = ({formikHandlers}) => {
	const [networks, setNetworks] = useState([])
	const getLedgerList = async () => {
		const res = await fetchNetworks()
		setNetworks(res)
	}
	useEffect(() => {
		getLedgerList()
	}, [])
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
				{networks && networks.length > 0 && networks.map((item: INetworks) => (
					<option key={item.id} value={item.id}>
						{item.name}
					</option>
				))}
			</select>

			{formikHandlers?.errors?.network &&
				formikHandlers?.touched?.network && (
					<span className="text-red-500 text-xs">
						{formikHandlers?.errors?.network}
					</span>
				)}
		</div>
	)
}

const SharedAgentForm = ({ orgName, seeds, isCopied, loading, copyTextVal, submitSharedWallet }: ISharedAgentForm) => {
	const [haveDidShared, setHaveDidShared] = useState(false)
	const validation = {
		label: yup.string()
			.required('Wallet label is required')
			.trim()
			.test('no-spaces', 'Spaces are not allowed', value => !value || !value.includes(' '))
			.matches(
				/^[A-Za-z0-9-][^ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/,
				'Wallet label must be alphanumeric only',
			)
			.min(2, 'Wallet label must be at least 2 characters')
			.max(25, 'Wallet label must be at most 25 characters'),
		seed: haveDidShared ? yup.string().required("Seed is required") : yup.string(),
		did: haveDidShared ? yup.string().required("DID is required") : yup.string(),
		network: yup.string().required("Network is required")
	}

	return (
		<div className='mt-4 max-w-lg flex-col gap-4'>
			<div className="flex items-center gap-2 mt-4">
				<Checkbox id="haveDidShared" onChange={(e) => setHaveDidShared(e.target.checked)} />
				<Label
					className="flex"
					htmlFor="haveDidShared"
				>
					<p>
						Already have DID?
					</p>

				</Label>
			</div>
			{
				!haveDidShared &&
				<div className='mt-4'>
					<div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
						<Label value="Seed" />
					</div>
					<div className="flex align-center block mb-1 text-sm text-gray-900 dark:text-white">
						{seeds}
						<span
							className="text-base font-semibold text-gray-900 truncate dark:text-white"
						>
							<button
								className=
								{`${isCopied}`} onClick={(e) => copyTextVal(e)}
							>
								{isCopied
									? <svg className="h-6 w-6 text-white ml-2 text-base" width="25" height="25" viewBox="0 0 24 24" strokeWidth={2} stroke="green" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
									: <svg className="h-6 w-6 text-green ml-2 text-base" width="25" height="25" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
								}
							</button>
						</span>
					</div>
				</div>
			}
			<Formik
				initialValues={{
					label: orgName || '',
					seed: "",
					did: "",
					network: ""
				}}
				validationSchema={yup.object().shape(validation)}
				validateOnBlur
				validateOnChange
				enableReinitialize
				onSubmit={(values: ValuesShared) => submitSharedWallet(values)}
			>
				{(formikHandlers): JSX.Element => (
					<Form
						className=""
						onSubmit={formikHandlers.handleSubmit}
					>
						{
							haveDidShared &&
							<>
								<div className='mt-4'>
									<div className="mb-1 block">
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
											<span className="text-red-500 text-xs">
												{formikHandlers?.errors?.seed}
											</span>
										)}
								</div>
								<div className=''>
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
							</>
						}
						<NetworkInput formikHandlers={formikHandlers} />
						<div>
							<div className="mb-1 block">
								<Label htmlFor="name" value="Wallet Label" />
								<span className="text-red-500 text-xs">*</span>
							</div>

							<Field
								id="label"
								name="label"
								className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								type="text"
							/>
							{formikHandlers?.errors?.label &&
								formikHandlers?.touched?.label && (
									<span className="text-red-500 text-xs">
										{formikHandlers?.errors?.label}
									</span>
								)}
						</div>
						<Button
							isProcessing={loading}
							type="submit"
							className='mt-4 float-right text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
						>
							<svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
								<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
							</svg>
							Create
						</Button>
					</Form>
				)}
			</Formik>
		</div>
	)
};

const DedicatedAgentForm = ({ seeds, loading, submitDedicatedWallet }: IDedicatedAgentForm) => {
	const [haveDid, setHaveDid] = useState(false)
	const [networks, setNetworks] = useState([])
	const getLedgerList = async () => {
		const res = await fetchNetworks()
		setNetworks(res)
	}
	useEffect(() => {
		getLedgerList()
	}, [])

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
		did: haveDid ? yup.string().required("DID is required") : yup.string(),
		network: yup.string().required("Network is required")
	}

	if (haveDid) {
		validation.seed = yup.string().required("Seed is required")
	}


	return (
		<>
			<div className="flex items-center gap-2 mt-4">
				<Checkbox id="haveDid" onChange={(e) => setHaveDid(e.target.checked)} />
				<Label
					className="flex"
					htmlFor="haveDid"
				>
					<p>
						Already have DID?
					</p>

				</Label>
			</div>
			<Formik
				initialValues={{
					seed: haveDid ? "" : seeds,
					walletName: '',
					password: '',
					did: "",
					network: ""
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
							{formikHandlers?.errors?.seed && formikHandlers?.touched?.seed && (
								<span className="text-red-500 text-xs">
									{formikHandlers?.errors?.seed}
								</span>
							)}
						</div>
						{
							haveDid &&
							<div className=''>
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
						}
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
							{formikHandlers?.errors?.walletName && formikHandlers?.touched?.walletName && (
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
	)
};

const WalletSpinup = (props: {
	setWalletSpinupStatus: (flag: boolean) => void;
	orgName: string
}) => {
	const [agentType, setAgentType] = useState<string>(AgentType.SHARED);
	const [loading, setLoading] = useState<boolean>(false);
	const [walletSpinStep, setWalletSpinStep] = useState<number>(0);
	const [success, setSuccess] = useState<string | null>(null);
	const [agentSpinupCall, setAgentSpinupCall] = useState<boolean>(false);
	const [failure, setFailure] = useState<string | null>(null);
	const [seeds, setSeeds] = useState<string>('');
	const [isCopied, setIsCopied] = useState(false);
	// const [organization, setOrganization] = useState(props.orgName)

	useEffect(() => {
		setSeeds(nanoid(32));
	}, []);

	const copyTextVal = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()

		setIsCopied(true);

		// Copy the text inside the text field
		navigator.clipboard.writeText(seeds);

		// Reset copied state after 1 second
		setTimeout(() => {
			setIsCopied(false);
		}, 1500);

	}

	const onRadioSelect = (type: string) => {
		setAgentType(type);
	};

	const submitDedicatedWallet = async (values: Values) => {
		const payload = {
			walletName: values.walletName,
			seed: values.seed || seeds,
			walletPassword: passwordEncryption(values.password),
			did: values.did,
			ledgerId: [
				(values.network.toString())
			],
			clientSocketId: SOCKET.id
		}

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

	const submitSharedWallet = async (values: ValuesShared) => {
		setLoading(true);
		const payload = {
			label: values.label,
			seed: values.seed || seeds,
			ledgerId: [
				(values.network.toString())
			],
			did: values.did,
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
		window.location.href = "/organizations/dashboard"
		console.log(`invitation-url-creation-success`, JSON.stringify(data));
	});

	SOCKET.on('error-in-wallet-creation-process', (data) => {
		setLoading(false);
		setTimeout(() => {
			setFailure('Wallet Creation Failed');
		}, 5000);
		console.log(`error-in-wallet-creation-process`, JSON.stringify(data));
	});

	const generateAlphaNumeric = props?.orgName ? props?.orgName?.split(" ").reduce((s, c) => (s.charAt(0).toUpperCase() + s.slice(1)) + (c.charAt(0).toUpperCase() + c.slice(1))
	) : ""

	const orgName = generateAlphaNumeric.slice(0, 19) + "Wallet"

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
				<div className='col-span-1'>
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
							<SharedAgentForm seeds={seeds} isCopied={isCopied} copyTextVal={copyTextVal} orgName={orgName} loading={loading} submitSharedWallet={submitSharedWallet} />
						) : (
							<DedicatedAgentForm seeds={seeds} loading={loading} submitDedicatedWallet={submitDedicatedWallet} />
						)
					) : (
						<WalletSteps
							steps={walletSpinStep}
							agentSpinupCall={agentSpinupCall}
						/>
					)}
				</div>
				<div className='col-span-2'>
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
