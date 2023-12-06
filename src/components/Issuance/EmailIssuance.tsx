import React, { useEffect, useState } from 'react';
import { pathRoutes } from '../../config/pathRoutes';
import BreadCrumbs from '../BreadCrumbs';
import BackButton from '../../commonComponents/backbutton';
import { Button, Card } from 'flowbite-react';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import { AlertComponent } from '../AlertComponent';
import IssuancePopup from './IssuancePopup';
import type { AxiosResponse } from 'axios';
import { getFromLocalStorage } from '../../api/Auth';
import { getSchemaCredDef } from '../../api/BulkIssuance';
import { storageKeys, apiStatusCodes } from '../../config/CommonConstant';
import type { ICredentials, IValues } from './interface';

const EmailIssuance = () => {
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [requestId, setRequestId] = useState('');
	const [process, setProcess] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [credentialSelected, setCredentialSelected] = useState<string>('');
	const [isFileUploaded, setIsFileUploaded] = useState(false);
	const [uploadedFileName, setUploadedFileName] = useState('');
	const [uploadedFile, setUploadedFile] = useState(null);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [message, setMessage] = useState('');
	const [searchText, setSearchText] = useState('');
	const [uploadMessage, setUploadMessage] = useState<IUploadMessage | null>(
		null,
	);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	console.log('credentialOptions', credentialOptions);
	console.log('credentialSelected', credentialSelected);

	const getSchemaCredentials = async () => {
		try {
			setLoading(true);
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (orgId) {
				const response = await getSchemaCredDef();
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefs = data.data;

					const options = credentialDefs.map((credDef: ICredentials) => ({
						value: credDef.credentialDefinitionId,
						label: `${credDef.schemaName} [${credDef.schemaVersion}] - (${credDef.credentialDefinition})`,
						schemaName: credDef.schemaName,
						schemaVersion: credDef.schemaVersion,
						credentialDefinition: credDef.credentialDefinition,
						schemaAttributes:
							credDef.schemaAttributes &&
							typeof credDef.schemaAttributes === 'string' &&
							JSON.parse(credDef.schemaAttributes),
					}));
					setCredentialOptions(options);
				} else {
					setSuccess(null);
					setFailure(null);
				}
				setLoading(false);
			}
		} catch (error) {
			setSuccess(null);
			setFailure(null);
		}
	};

	useEffect(() => {
		getSchemaCredentials();
	}, []);

	const isCredSelected = Boolean(credentialSelected);

	const selectedCred: ICredentials | boolean | undefined =
		credentialOptions &&
		credentialOptions.length > 0 &&
		credentialOptions.find(
			(item: { value: string }) =>
				item.value && item.value === credentialSelected,
		);

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.organizations.Issuance.issue} />
				</div>
			</div>
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
				<div className="flex justify-between mb-4 items-center ml-1">
					<div>
						<p className="text-2xl font-semibold dark:text-white">Email</p>
					</div>
				</div>
				<div className="flex flex-col justify-between gap-4">
					<Card>
						<div className="h-72">
							<p className="text-xl pb-6 font-normal">
								Select the schema and credential definition for issuing
								credentials
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<div className="flex flex-col justify-between">
									<div className="search-dropdown text-primary-700 drak:text-primary-700">
										<Select
											placeholder="Select Schema - Credential definition"
											className="basic-single "
											classNamePrefix="select"
											isDisabled={false}
											isClearable={true}
											isRtl={false}
											isSearchable={true}
											name="color"
											options={credentialOptions}
											onChange={(value: IValues | null) => {
												setCredentialSelected(value?.value ?? '');
											}}
										/>
									</div>
									<div className="mt-4">
										{credentialSelected && (
											<Card className="max-w-[30rem]">
												<div>
													<p className="text-black dark:text-white pb-2">
														<span className="font-semibold">Schema: </span>
														{selectedCred?.schemaName || ''}{' '}
														<span>[{selectedCred?.schemaVersion}]</span>
													</p>
													<p className="text-black dark:text-white pb-2">
														{' '}
														<span className="font-semibold">
															Credential Definition:
														</span>{' '}
														{selectedCred?.credentialDefinition}
													</p>
													<span className="text-black dark:text-white font-semibold">
														Attributes:
													</span>
													<div className="flex flex-wrap overflow-hidden">
														{selectedCred?.schemaAttributes.map(
															(element: IAttributes) => (
																<div key={element.attributeName}>
																	<span className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
																		{element.attributeName}
																	</span>
																</div>
															),
														)}
													</div>
												</div>
											</Card>
										)}
									</div>
								</div>
							</div>
						</div>
					</Card>
					<div className="flex flex-col justify-between min-h-100/21rem">
						<Card>
							<div className="h-72">
								<div className="flex justify-between mb-4 items-center ml-1">
									<div>
										<p className="text-2xl font-semibold dark:text-white">
											Issue Credential to email{' '}
										</p>
										<span className="text-sm text-gray-400">
											Please enter an email id to issue credential to{' '}
										</span>
									</div>
									<Button
										color="bg-primary-800"
										className="flex float-right bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-primary-600 font-medium rounded-md text-lg px-2 lg:px-3 py-2 lg:py-2.5 mr-2 ml-auto border-blue-600 hover:text-primary-600 dark:text-white dark:border-blue-500 dark:hover:text-primary-700 dark:hover:bg-secondary-700"
										style={{ height: '2.4rem', minWidth: '2rem' }}
										onClick={() => {
											window.location.href =
												pathRoutes.organizations.Issuance.history;
										}}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="pr-2"
											width="30"
											color="text-white"
											height="20"
											fill="none"
											viewBox="0 0 18 18"
										>
											<path
												fill="#1F4EAD"
												d="M15.483 18H2.518A2.518 2.518 0 0 1 0 15.482V2.518A2.518 2.518 0 0 1 2.518 0h12.965a2.518 2.518 0 0 1 2.518 2.518v12.964A2.518 2.518 0 0 1 15.483 18ZM2.518 1.007a1.51 1.51 0 0 0-1.51 1.51v12.965a1.51 1.51 0 0 0 1.51 1.51h12.965a1.51 1.51 0 0 0 1.51-1.51V2.518a1.51 1.51 0 0 0-1.51-1.51H2.518Z"
											/>
											<path
												fill="#1F4EAD"
												d="M3.507 5.257a.504.504 0 0 1 0-1.007h5.495a.504.504 0 1 1 0 1.007H3.507ZM6.254 9.5a.504.504 0 1 1 0-1.008h5.492a.504.504 0 0 1 0 1.007H6.254ZM9 13.757a.503.503 0 1 1 0-1.007h5.493a.504.504 0 0 1 0 1.007H9Z"
											/>
										</svg>
										View History
									</Button>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="flex flex-col justify-between">
										start from here
									</div>
								</div>
							</div>
						</Card>
					</div>

					<div>
						<div className="mt-4">
							<Button
								// onClick={handleOpenConfirmation}
								// disabled={!isFileUploaded}
								type="reset"
								color="bg-primary-800"
								className="float-right py-2 mb-4 bg-primary-700 ring-primary-700  hover:bg-primary-800 ring-2 text-white font-medium rounded-lg text-sm px-4 lg:px-5 lg:py-2.5 mr-0 ml-auto dark:text-white dark:hover:text-white dark:hover:bg-primary-800"
								style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
							>
								<svg
									className="pr-2"
									xmlns="http://www.w3.org/2000/svg"
									width="30"
									height="25"
									fill="none"
									viewBox="0 0 25 18"
								>
									<path
										fill="#fff"
										d="M.702 10.655a.703.703 0 1 0-.001-1.406.703.703 0 0 0 .001 1.406Z"
									/>
									<path
										fill="#fff"
										d="m24.494 5.965-5.8-5.8a.562.562 0 0 0-.795 0l-2.06 2.06H8.884c-1.602 0-3.128.73-4.137 1.966H3.652V3.35a.562.562 0 0 0-.562-.562H.562a.562.562 0 0 0 0 1.123h1.966v7.866H.562a.562.562 0 0 0 0 1.124H3.09c.31 0 .562-.252.562-.562v-1.404h1.096A5.358 5.358 0 0 0 8.885 12.9h.653l4.01 4.01a.56.56 0 0 0 .795 0l10.15-10.15a.562.562 0 0 0 0-.795ZM5.478 10.04a.562.562 0 0 0-.455-.231h-1.37V5.315h1.37c.18 0 .349-.086.455-.23a4.23 4.23 0 0 1 3.407-1.736h5.83L11.38 6.682a5.675 5.675 0 0 1-1.238-1.243.562.562 0 0 0-.908.66 6.74 6.74 0 0 0 4.429 2.71.633.633 0 0 1-.197 1.25 8 8 0 0 1-4.14-1.974.562.562 0 0 0-.755.833c.1.091.204.18.308.266l-1.132 1.131a.562.562 0 0 0 0 .795l.637.636a4.235 4.235 0 0 1-2.907-1.705Zm8.468 5.677L8.94 10.713l.86-.86a9.16 9.16 0 0 0 3.492 1.316 1.759 1.759 0 0 0 2.008-1.46 1.758 1.758 0 0 0-1.461-2.01 5.69 5.69 0 0 1-1.454-.432l5.911-5.91 5.006 5.005-9.356 9.356Z"
									/>
								</svg>
								Issue
							</Button>
							<Button
								// onClick={handleReset}
								// disabled={!isFileUploaded}
								type="reset"
								color="bg-primary-800"
								className="float-right bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-4 ml-auto dark:text-white dark:hover:text-black dark:hover:bg-primary-50"
								style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="mr-2"
									width="18"
									height="18"
									fill="none"
									viewBox="0 0 20 20"
								>
									<path
										fill="#1F4EAD"
										d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z"
									/>
								</svg>
								Reset
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailIssuance;
