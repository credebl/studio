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
import BreadCrumbs from '../BreadCrumbs';

const index = () => {
	const [loading, setLoading] = useState(false);
	const [clentId, setClientId] = useState('');
	const [clientSecret, setClientSecret] = useState('');
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [warning, setWarning] = useState<string | null>(null);
	const [hideCopy, setHideCopy] = useState<boolean>(true);
	const [userRoles, setUserRoles] = useState<string[]>([]);

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
				<div className="mb-4 col-span-full xl:mb-2">
					<BreadCrumbs />
				</div>
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
				<div className="w-full mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
					<div className="px-6 py-6">
						{loading ? (
							<div className="flex items-center justify-center mb-4">
								<CustomSpinner />
							</div>
						) : (
							<form action="#">
								<div className="form-container">
									<div className="mb-4">
										<h1 className="text-gray-800 text-xl font-medium dark:text-white">
											Client Id
										</h1>
										<p className="flex my-2 text-gray-700 text-sm leading-normal dark:text-white">
											{clentId && (
												<CopyDid
													className="text-base text-gray-500 dark:text-gray-400 text-gray-900 truncate dark:text-white"
													value={clentId}
												/>
											)}
										</p>
									</div>

									<div>
										<div className="sm:flex justify-between sm:space-x-2 items-center py-4">
											<div>
												<h1 className="text-gray-800 text-xl font-medium font-montserrat dark:text-white mb-3">
													Client Secrate
												</h1>
												<span className="text-gray-600 dark:text-gray-500 flex flex-wrap">
													You need a client secret to authenticate as the
													organization to the API.
												</span>
											</div>
											{(userRoles.includes(Roles.OWNER) ||
												userRoles.includes(Roles.ADMIN)) && (
												<div className="text-start items-center mt-4 sm:mt-0 shrink-0">
													{/* <Button
														onClick={createClientCredentials}
														type="button"
														disabled={Boolean(clientSecret)}
														isProcessing={loading}
														color="bg-primary-800"
														className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
													> */}
													<Button
														onClick={createClientCredentials}
														type="button"
														disabled={Boolean(clientSecret)}
														isProcessing={loading}
														className={`text-base font-medium text-center text-white rounded-md focus:ring-4 focus:ring-primary-300 sm:w-auto dark:focus:ring-primary-800 ${
															Boolean(clientSecret)
																? 'bg-gray-400 dark:bg-gray-600 dark:text-white cursor-not-allowed'
																: 'bg-primary-700 hover:!bg-primary-800 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
														}`}
														// group flex h-min items-center justify-center p-0.5 focus:z-10 focus:outline-none text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-md hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
													>
														Generate Client Secrate{' '}
													</Button>
												</div>
											)}
										</div>
										<hr />
										<div className="mt-4">
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
										</div>
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
												className="w-full gap-4 flex justify-between truncate sm:flex-row flex-col"
												style={{ minHeight: '100px' }}
											>
												<div className="flex items-center space-x-4 w-full sm:w-4/5 truncate dark:text-white">
													<div>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="36"
															height="35"
															viewBox="0 0 36 35"
															fill="none"
														>
															<path
																d="M20.8 9.36588C21.5543 8.62592 22.4686 8.25594 23.5429 8.25594C24.6171 8.25594 25.5314 8.62592 26.2857 9.36588C27.04 10.1058 27.4171 11.0028 27.4171 12.0566C27.4171 13.1105 27.04 14.0074 26.2857 14.7474C25.5314 15.4874 24.6171 15.8573 23.5429 15.8573C22.4686 15.8573 21.5543 15.4874 20.8 14.7474C20.0457 14.0074 19.6686 13.1105 19.6686 12.0566C19.6686 11.0028 20.0457 10.1058 20.8 9.36588ZM15.3143 3.98436C17.6 1.74207 20.3429 0.620915 23.5429 0.620915C26.7429 0.620916 29.4857 1.74206 31.7714 3.98436C34.0571 6.22666 35.2 8.91742 35.2 12.0566C35.2 15.1959 34.0571 17.8866 31.7714 20.1289C30.24 21.6313 28.4743 22.6235 26.4743 23.1056C24.4743 23.5877 22.4914 23.5821 20.5257 23.0888L8.45714 34.9281H0.228573L0.228572 22.8197L5.02857 22.147L5.71429 17.4382L10.6857 16.5973L12.2971 15.0165C11.7943 13.0881 11.7886 11.1429 12.28 9.18089C12.7714 7.21888 13.7829 5.48671 15.3143 3.98436ZM18.0571 6.67512C16.7771 7.93081 16.04 9.41633 15.8457 11.1317C15.6514 12.8471 15.9886 14.4447 16.8571 15.9246L12.5714 20.1289L9.17714 20.7007L8.45714 25.5104L4.13714 26.0486L4.13715 31.0938H6.88L19.6 18.6154C21.1086 19.4674 22.7371 19.7982 24.4857 19.6076C26.2343 19.417 27.7486 18.6938 29.0286 17.4382C30.5371 15.9582 31.2914 14.1644 31.2914 12.0566C31.2914 9.94888 30.5371 8.15504 29.0286 6.67512C27.52 5.19521 25.6914 4.45525 23.5429 4.45525C21.3943 4.45525 19.5657 5.19521 18.0571 6.67512Z"
																fill="#3A3A3A"
															/>
														</svg>
													</div>
													<div className="truncate">
														<h1 className="flex ml-4 text-base text-gray-500 dark:text-gray-400 truncate dark:text-white">
															{!hideCopy ? (
																clientSecret && (
																	// font-courier font-semibold
																	<CopyDid
																		className="text-base text-gray-500 dark:text-gray-400 text-gray-900 truncate dark:text-white"
																		value={clientSecret}
																	/>
																)
															) : (
																<span className="text-base text-gray-500 dark:text-gray-400 text-gray-900 truncate dark:text-white">
																	{clientSecret}
																</span>
															)}
														</h1>
													</div>
												</div>
												{(userRoles.includes(Roles.OWNER) ||
													userRoles.includes(Roles.ADMIN)) && (
													<div className="flex text-start sm:justify-end items-center w-auto sm:w-1/5 ">
														<button
															onClick={deleteKey}
															className="bg-red-100 border text-red-600 px-2 rounded-md text-center h-8"
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
