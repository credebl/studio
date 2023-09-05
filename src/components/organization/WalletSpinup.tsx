import * as yup from 'yup';

import { Alert, Button, Label } from 'flowbite-react';
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
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import DedicatedIllustrate from './DedicatedIllustrate';
import InputCopy from '../InputCopy';
import SOCKET from '../../config/SocketConfig';
import SharedIllustrate from './SharedIllustrate';
import { nanoid } from 'nanoid';

interface Values {
	seed: string;
	name: string;
	password: string;
}

interface ValuesShared {
	seed: string;
	label: string;
}

enum AgentType {
	SHARED = 'shared',
	DEDICATED = 'dedicated',
}

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


	const generateWalletname = () => {

	}
	useEffect(() => {
		setSeeds(nanoid(32));
		generateWalletname()
	}, []);

	function copyTextVal(event: React.MouseEvent<HTMLButtonElement>) {
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
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		const payload = {
			walletName: values.name,
			seed: seeds,
			orgId: Number(orgId),
			walletPassword: passwordEncryption(values.password),
			clientSocketId: SOCKET.id,
		};
		setLoading(true);
		const spinupRes = await spinupDedicatedAgent(payload);
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
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		const payload = {
			label: values.label,
			seed: seeds,
			orgId: Number(orgId),
			clientSocketId: SOCKET.id,
		};

		const spinupRes = await spinupSharedAgent(payload);
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
        window.location.href= "/organizations/dashboard"
		console.log(`invitation-url-creation-success`, JSON.stringify(data));
	});

	SOCKET.on('error-in-wallet-creation-process', (data) => {
		setLoading(false);
		setTimeout(() => {
			setFailure('Wallet Creation Failed');
		}, 5000);
		console.log(`error-in-wallet-creation-process`, JSON.stringify(data));
	});

	const DedicatedAgentForm = () => (
		<Formik
			initialValues={{
				seed: seeds,
				name: '',
				password: '',
			}}
			validationSchema={yup.object().shape({
				name: yup
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
			})}
			validateOnBlur
			validateOnChange
			enableReinitialize
			onSubmit={(values: Values) => submitDedicatedWallet(values)}
		>
			{(formikHandlers): JSX.Element => (
				<Form
					className="mt-8 space-y-6 max-w-lg flex-col gap-4"
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
							disabled={true}
							value={seeds}
							component={InputCopy}
							className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							type="text"
						/>
						{formikHandlers?.errors?.seed && formikHandlers?.touched?.seed && (
							<span className="text-red-500 text-xs">
								{formikHandlers?.errors?.seed}
							</span>
						)}
					</div>
					<div>
						<div className="mb-1 block">
							<Label htmlFor="name" value="Wallet Name" />
							<span className="text-red-500 text-xs">*</span>
						</div>

						<Field
							id="name"
							name="name"
							className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							type="text"
						/>
						{formikHandlers?.errors?.name && formikHandlers?.touched?.name && (
							<span className="text-red-500 text-xs">
								{formikHandlers?.errors?.name}
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
	);

	const SharedAgentForm = () => (
		<Formik
			initialValues={{
				seed: '',
				label: props.orgName,
			}}
			validationSchema={yup.object().shape({
				label: yup.string()
				.required('Wallet label is required')
				.trim()
				.test('no-spaces', 'Spaces are not allowed', value => !value || !value.includes(' '))
				.matches(
						/^[A-Za-z0-9-][^ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/,
						'Wallet label must be alphanumeric only',
				),
			})}
			validateOnBlur
			validateOnChange
			enableReinitialize
			onSubmit={(values: ValuesShared) => submitSharedWallet(values)}
		>
			{(formikHandlers): JSX.Element => (
				<Form
					className="mt-8 space-y-6 max-w-lg flex-col gap-4"
					onSubmit={formikHandlers.handleSubmit}
				>
					<div>
						<div className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
							<Label htmlFor="seed" value="Seed" />
						</div>
						<div className="flex align-center block mb-1 text-sm text-gray-900 dark:text-white">
							{seeds}
								<span
							className="text-base font-semibold text-gray-900 truncate dark:text-white"
						>
							<button
								className=
								{`${isCopied}`} onClick={copyTextVal}
								>
								{isCopied
									? <svg className="h-6 w-6 text-white ml-2 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="green" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
									: <svg className="h-6 w-6 text-green ml-2 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
								}

							</button>
						</span>
						</div>
					
					</div>
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
						className='float-right text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
					>
						Create
					</Button>
				</Form>
			)}
		</Formik>
	);
	
	return (
		<div className="mt-4 flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800">
			<div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
				<div>
					{(success || failure) && (
						<Alert
							color={success ? 'success' : 'failure'}
							onDismiss={() => setFailure(null)}
						>
							<span>
								<p>{success || failure}</p>
							</span>
						</Alert>
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
										<input
											id="horizontal-list-radio-license"
											type="radio"
											checked={agentType === AgentType.SHARED ? true : false}
											value=""
											onChange={() => onRadioSelect(AgentType.SHARED)}
											name="list-radio"
											className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
										/>
										<label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
											Shared
										</label>
									</div>
								</li>
								<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
									<div className="flex items-center pl-3">
										<input
											id="horizontal-list-radio-id"
											type="radio"
											value=""
											onChange={() => onRadioSelect(AgentType.DEDICATED)}
											checked={agentType === AgentType.DEDICATED ? true : false}
											name="list-radio"
											disabled
											className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
										/>
										<label className="w-full py-3 ml-2 text-sm font-medium text-gray-400 dark:text-gray-300">
											Dedicated{' '}
										</label>
									</div>
								</li>
							</ul>
						</div>
					)}

					{!agentSpinupCall ? (
						agentType === AgentType.SHARED ? (
							<SharedAgentForm />
						) : (
							<DedicatedAgentForm />
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
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
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
						<span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"></span>
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
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
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
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
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
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
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
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
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
