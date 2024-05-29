import * as yup from 'yup';
import { Button, Checkbox, Label } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import {
    apiStatusCodes,
	passwordRegex,
} from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';
import InputCopy from '../../InputCopy';
import type { AxiosResponse } from 'axios';
import {
	getLedgers
} from '../../../api/Agent';
import NetworkInput from './NetworkInput';
import type { IDedicatedAgentForm, IValues } from './interfaces';

const DedicatedAgentForm = ({
	seeds,
	loading,
	submitDedicatedWallet,
}: IDedicatedAgentForm) => {
	const [haveDid, setHaveDid] = useState(false);
	const [networks, setNetworks] = useState([]);

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
				onSubmit={(values: IValues) => submitDedicatedWallet(values)}
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

export default DedicatedAgentForm;