import { Alert, Button } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import CustomSpinner from '../CustomSpinner';
import { getFromLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { apiRoutes } from '../../config/apiRoutes';
import { getHeaderConfigs } from '../../config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '../../services/apiRequests';
import type { AxiosResponse } from 'axios';
import CopyDid from '../../commonComponents/CopyDid';
import { AlertComponent } from '../AlertComponent';
import { Roles } from '../../utils/enums/roles';

const index = () => {
	const [loading, setLoading] = useState(true);
	const [clentId, setClientId] = useState('');
	const [clientSecret, setClientSecret] = useState('');
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [warning, setWarning] = useState<string | null>(null);
	const [hideCopy, setHideCopy] = useState<boolean>(true);
	const [userRoles, setUserRoles] = useState<string[]>([]);
	console.log('userRoles', userRoles);

	const getCredentials = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.setting.setting}`;

		const axiosPayload = {
			url,
			config: await getHeaderConfigs(),
		};

		try {
			return await axiosGet(axiosPayload);
		} catch (error) {
			const err = error as Error;
			return err?.message;
		}
	};

	const createCredentials = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.setting.setting}`;

		const axiosPayload = {
			url,
			config: await getHeaderConfigs(),
		};
		try {
			return await axiosPost(axiosPayload);
		} catch (error) {
			const err = error as Error;
			return err?.message;
		}
	};

	const createClientCredentials = async () => {
		console.log('--------', 'create');

		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		if (orgId) {
			setLoading(true);
			try {
				// const response = await createCredentials();
				// const { data } = response as AxiosResponse;

				const data = {
					statusCode: 201,
					message: 'Organization credentials created successfully',
					data: {
						clientId: '5d1533ac-0432-4da4-bd15-e86dc5465c0a',
						clientSecret: 'T7QSRemu1MtcN1rjyVZ3uNA9FzVkp2U9',
					},
				};
				if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
					setHideCopy(false);

					setClientId(data.data.clientId);
					setClientSecret(data.data.clientSecret);
					setSuccess(data.message);
					setWarning(
						'Make sure to copy your new client secret now. You won’t be able to see it again.',
					);
				}
			} catch (error) {
				setFailure(error as string);
			} finally {
				setLoading(false);
			}
		} else {
			setLoading(false);
		}
	};

	const getClientCredentials = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		if (orgId) {
			setLoading(true);
			try {
				// const response = await getCredentials();
				// const { data } = response as AxiosResponse;
				const data = {
					statusCode: 200,
					message: 'Organization credentials fetched successfully',
					data: {
						clientId: '5d1533ac-0432-4da4-bd15-e86dc5465c0a',
						clientSecret: '************************FzVkp2U9',
					},
				};
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setHideCopy(true);
					setClientId(data.data.clientId);
					setClientSecret(data.data.clientSecret);
				}
			} catch (error) {
				setFailure(error as string);
				setLoading(false);
			} finally {
				setLoading(false);
			}
		} else {
			setLoading(false);
		}
	};

	const deleteKey = () => {
		setClientSecret(null);
	};

	const getUserRoles = async () => {
		const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
		const roles = orgRoles.split(',');
		setUserRoles(roles);
	};

	useEffect(() => {
		getClientCredentials();
		getUserRoles();
	}, []);

	return (
		<div className="h-full">
			<div className="page-container relative h-full flex flex-auto flex-col p-3 sm:p-4">
				<div className="w-full mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
					<div className="px-6 py-6">
						{loading ? (
							<div className="flex items-center justify-center mb-4">
								<CustomSpinner />
							</div>
						) : (
							<form action="#">
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
								<div className="form-container">
									<div>
										<h1 className="text-gray-500 text-xl font-medium font-montserrat dark:text-white">
											Client Id :
										</h1>
										<p className="flex my-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal dark:text-white">
											{clentId && (
												<CopyDid
													className="font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white"
													value={clentId}
												/>
											)}
										</p>
									</div>

									<div>
										<div className="flex justify-between items-center py-4">
											<h1 className="text-gray-500 text-xl font-medium font-montserrat dark:text-white">
												Client Secrate
											</h1>
											{(userRoles.includes(Roles.OWNER) ||
												userRoles.includes(Roles.ADMIN)) && (
												<div className="items-center">
													<Button
														onClick={createClientCredentials}
														type="button"
														disabled={Boolean(clientSecret)}
														isProcessing={loading}
														color="bg-primary-800"
														className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="mr-4"
															width="18"
															height="18"
															fill="none"
															viewBox="0 0 18 18"
														>
															<path
																stroke="#fff"
																d="M11.03 4.32a3.82 3.82 0 1 1-7.64 0 3.82 3.82 0 0 1 7.64 0Zm6.473 4.047a2.94 2.94 0 0 1-.486 1.62c-.315.476-.76.838-1.273 1.044l-.691.276.517.535.812.842-1.053 1.091-.335.348.335.347 1.053 1.091-1.619 1.678-.888-.92v-5.241l-.28-.138a2.774 2.774 0 0 1-1.098-.98 2.958 2.958 0 0 1-.168-2.917c.226-.455.566-.838.98-1.109a2.65 2.65 0 0 1 2.775-.081 2.79 2.79 0 0 1 1.038 1.05c.25.443.383.948.38 1.463Zm-1.55-1.761-.42.27.42-.27a1.434 1.434 0 0 0-.638-.542 1.396 1.396 0 0 0-1.566.32 1.491 1.491 0 0 0-.305 1.578c.105.265.286.494.52.656a1.403 1.403 0 0 0 1.813-.183 1.484 1.484 0 0 0 .175-1.83Zm-7.48 3.934c.664 0 1.32.122 1.934.359a5.18 5.18 0 0 0 1.332 1.626v4.213H.5v-1.3c0-1.291.537-2.535 1.5-3.456a5.284 5.284 0 0 1 3.649-1.443h2.824Z"
															/>
														</svg>
														Generate Client Secrate{' '}
													</Button>
												</div>
											)}
										</div>
										{warning && (
											<AlertComponent
												message={warning}
												type={'warning'}
												onAlertClose={() => {
													setWarning(null);
													setFailure(null);
												}}
											/>
										)}
										{/* 
										{clentId && (
											<div
												className="p-4 border rounded-md w-full gap-4 flex justify-between sm:flex-row flex-col"
												style={{ minHeight: '100px' }}
											>
												<div className="flex items-center space-x-4 w-full sm:w-4/5">
													<div className="">SVG</div>
													<div>
														<h1 className="">
															{!hideCopy ? (
																clientSecret && (
																	<CopyDid
																		className="flex font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white"
																		value={clientSecret}
																	/>
																)
															) : (
<div className="flex items-center text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white">
  {clientSecret}
</div>
															)}
														</h1>
													</div>
												</div>
												{(userRoles.includes(Roles.OWNER) ||
													userRoles.includes(Roles.ADMIN)) && (
													<div className="flex justify-center items-center">
														<button
															onClick={deleteKey}
															className="bg-gray-100 border text-red-400 px-2 rounded-md text-center h-8"
														>
															Delete
														</button>
													</div>
												)}
											</div>
										)} */}

										{clentId && (
											<div
												className="p-4 border rounded-md w-full gap-4 flex justify-between sm:flex-row flex-col"
												style={{ minHeight: '100px' }}
											>
												<div className="flex items-center space-x-4 w-full sm:w-4/5 truncate dark:text-white">
													<div>SVG</div>
													<div className='truncate'>
														<h1 className="text-base text-gray-500 dark:text-gray-400 font-semibold truncate dark:text-white">
															{!hideCopy
																? clientSecret && (
																		<CopyDid
																			className="flex font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white"
																			value={clientSecret}
																		/>
																  )
																: <span className='font-courier text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white'>{clientSecret}</span>}
														</h1>
													</div>
												</div>
												{(userRoles.includes(Roles.OWNER) ||
													userRoles.includes(Roles.ADMIN)) && (
													<div className="flex text-start sm:justify-center items-center w-auto sm:w-1/5 ">
														<button
															onClick={deleteKey}
															className="bg-gray-100 border text-red-400 px-2 rounded-md text-center h-8"
														>
															Delete
														</button>
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default index;
