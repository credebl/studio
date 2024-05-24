import { Button } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import CustomSpinner from '../CustomSpinner';
import { getFromLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import CopyDid from '../../commonComponents/CopyDid';
import { AlertComponent } from '../AlertComponent';
import { Roles } from '../../utils/enums/roles';
import BreadCrumbs from '../BreadCrumbs';
import {
	createCredentials,
	getCredentials,
} from './setting';
import { EmptyListMessage } from '../EmptyListComponent';

const Index = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [clientId, setClientId] = useState<string | null>(null);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [warning, setWarning] = useState<string | null>(null);
	const [hideCopy, setHideCopy] = useState<boolean>(true);
	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [orgnizationId, setOrgnizationId] = useState<string | null>(null);
	const [buttonDisplay, setButtonDisplay] = useState<boolean>(true);
	const [regenerate, setRegenerate] = useState<boolean>(false);

	const createClientCredentials = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId) {
			setLoading(true);
			try {
				const response = await createCredentials();
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
					setButtonDisplay(false);
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
				setLoading(false);
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
				const response = await getCredentials();
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setRegenerate(data?.data?.clientSecret ? true : false);
					setHideCopy(true);
					setClientId(data?.data?.clientId);
					setClientSecret(data?.data?.clientSecret);
					setButtonDisplay(true);
				} else {
					setClientId(null);
					setClientSecret(null);
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

	const getUserRoles = async () => {
		const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
		const roles = orgRoles.split(',');
		setUserRoles(roles);
	};

	useEffect(() => {
		(async () => {
			await getClientCredentials();
			await getUserRoles();
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgnizationId(orgId);
		})();
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
						{loading && (
							<div className="flex items-center justify-center mb-4">
								<CustomSpinner />
							</div>
						) }
						 {!loading && orgnizationId && (
							<>
								{' '}
								<form action="#">
									<div className="form-container">
										<div className="mb-4">
											<h1 className="text-gray-800 text-xl font-medium dark:text-white">
												Client Id
											</h1>
											<p className="flex my-2 text-gray-700 text-sm leading-normal dark:text-white">
												{clientId && (
													<CopyDid
														className="text-base text-gray-500 dark:text-gray-400 text-gray-900 truncate dark:text-white"
														value={clientId}
													/>
												)}
											</p>
										</div>

										<div>
											<div className="sm:flex justify-between sm:space-x-2 items-center py-4">
												<div>
													<h1 className="text-gray-800 text-xl font-medium font-montserrat dark:text-white mb-3">
														Client Secret
													</h1>
													<span className="text-gray-600 dark:text-gray-500 flex flex-wrap">
														You need a client secret to authenticate as the
														organization to the API.
													</span>
												</div>

												{(userRoles.includes(Roles.OWNER)) && (
													<div className="text-start items-center mt-4 sm:mt-0 shrink-0">
														{buttonDisplay && (
															<Button
																onClick={createClientCredentials}
																type="button"
																isProcessing={loading}
																className={
																	'text-base font-medium text-center text-white rounded-md focus:ring-4 focus:ring-primary-300 sm:w-auto dark:focus:ring-primary-800 bg-primary-700 hover:!bg-primary-800 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
																}
															>
																{
											                      loading ? <CustomSpinner message=''/> : ""
										                        }
																{regenerate
																	? 'Regenerate Client Secret'
																	: 'Generate Client Secret'}{' '}
															</Button>
														)}
													</div>
												)}
											</div>

											{clientId && (
												<>
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
													</div>
												</>
											)}
										</div>
									</div>
								</form>{' '}
							</>
						) } 
						
						{!loading && !orgnizationId && (
							<EmptyListMessage
								message={'No Organization'}
								description={'Get started by creating a new Organization'}
								svgComponent={
									<svg
										className="pr-2 mr-1"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="15"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											fill="#fff"
											d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
										/>
									</svg>
								}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Index;
