import { Button, Card, Pagination } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
	DownloadCsvTemplate, getSchemaCredDef, getCsvFileData,
	issueBulkCredential,
	uploadCsvFile,
} from '../../api/BulkIssuance';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import { pathRoutes } from '../../config/pathRoutes';
import IssuancePopup from './IssuancePopup';
import SOCKET from '../../config/SocketConfig';
import { ToastContainer, toast } from 'react-toastify';
import BreadCrumbs from '../BreadCrumbs';
import BackButton from '../../commonComponents/backbutton'
import type { ICredentials, IValues, IAttributes, IUploadMessage } from './interface';

const BulkIssuance = () => {
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [requestId, setRequestId] = useState("");
	const [process, setProcess] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [credentialSelected, setCredentialSelected] = useState<string>("");	
	const [isFileUploaded, setIsFileUploaded] = useState(false);
	const [uploadedFileName, setUploadedFileName] = useState('');
	const [uploadedFile, setUploadedFile] = useState(null);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [searchText, setSearchText] = useState('');
	const [uploadMessage, setUploadMessage] = useState<IUploadMessage | null>(null)
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};
	const initialPageState = {
		pageNumber: 1,
		pageSize: 10,
		total: 0,
	};
	const [currentPage, setCurrentPage] = useState(initialPageState);

	const getSchemaCredentials = async () => {
		try {
			setLoading(true);
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (orgId) {
				const response = await getSchemaCredDef();
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefs = data.data;

					const options = credentialDefs.map(
						(credDef: ICredentials) => ({
							value: credDef.credentialDefinitionId,
							label: `${credDef.schemaName} [${credDef.schemaVersion}] - (${credDef.credentialDefinition})`,
							schemaName: credDef.schemaName,
							schemaVersion: credDef.schemaVersion,
							credentialDefinition: credDef.credentialDefinition,
							schemaAttributes: credDef.schemaAttributes && typeof credDef.schemaAttributes === "string" && JSON.parse(credDef.schemaAttributes)
						}),
					);
					setCredentialOptions(options);
				} else {
					setUploadMessage({message: response as string, type: "failure"});
					setSuccess(null)
					setFailure(null)
				}
				setLoading(false);
			}
		} catch (error) {
			setUploadMessage({message: error as string, type: "failure"});
			setSuccess(null)
			setFailure(null)
		}
	};

	useEffect(() => {
		getSchemaCredentials();
	}, []);


	const downloadFile = (url: string, fileName: string) => {
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const DownloadSchemaTemplate = async () => {
		setProcess(true);
		if (credentialSelected) {
			try {
				setProcess(true);

				const response = await DownloadCsvTemplate(credentialSelected);
				const { data } = response as AxiosResponse;

				if (data) {
					const fileUrl = data;
					if (fileUrl) {
						downloadFile(fileUrl, 'downloadedFile.csv');
						setSuccess('File downloaded successfully');
						setTimeout(()=>{
							setSuccess(null)
						},5000)
						setProcess(false);
					} else {
						setUploadMessage({message: 'File URL is missing in the response', type: "failure"});
						setTimeout(()=>{
							setUploadMessage(null)
						},5000)
						setSuccess(null)
						setFailure(null)
					}
				} else {
					setUploadMessage({message: 'API request was not successful', type: "failure"});
					setTimeout(()=>{
						setUploadMessage(null)
					},5000)
					setSuccess(null)
					setFailure(null)
				}
			} catch (error) {
				setUploadMessage({message: error as string, type: "failure"});
				setTimeout(()=>{
					setUploadMessage(null)
				},5000)
				setSuccess(null)
				setFailure(null)
			}
		}

		setLoading(false);
	};

	const readFileAsBinary = (file: File): Promise<Uint8Array> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				if (event.target?.result) {
					const binaryData = new Uint8Array(event.target.result as ArrayBuffer);
					resolve(binaryData);
				} else {
					reject(new Error('Failed to read file as binary.'));
				}
			};

			reader.onerror = (error) => {
				reject(error);
			};

			reader.readAsArrayBuffer(file);
		});
	};

	const wait = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));


	useEffect(() => {
		SOCKET.emit('bulk-connection')
		SOCKET.on('bulk-issuance-process-completed', () => {
			setSuccess(null)
			console.log(`bulk-issuance-process-completed`);
			toast.success('Issuance process completed', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'colored',
			});
		});

		SOCKET.on('error-in-bulk-issuance-process', () => {
			setFailure(null)
			console.log(`error-in-bulk-issuance-process-initiated`);
			toast.error('Issuance process failed. Please retry', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'colored',
			});
		});

	}, [])

	const handleFileUpload = async (file: any) => {
		setLoading(true);

		if (file.type !== 'text/csv') {
			setUploadMessage({message:'Invalid file type. Please select only CSV files.', type: "failure"});
			setTimeout(()=>{
				setUploadMessage(null)
			},5000)
			setSuccess(null)
			setFailure(null)
			return;
		}
		try {

			const binaryData = await readFileAsBinary(file);

			const clientId = SOCKET.id || '';

			await setToLocalStorage(storageKeys.SOCKET_ID, clientId)
			const payload = {
				file: binaryData,
				fileName: file?.name || "Not available"
			};

			await wait(500);

			setUploadedFileName(file?.name);
			setUploadedFile(file);

			const response = await uploadCsvFile(payload, credentialSelected);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
				setLoading(false);
				setRequestId(data?.data);
				setIsFileUploaded(true);
				setUploadMessage({message: data?.message, type: "success"});
				setTimeout(()=>{
					setUploadMessage(null)
				},5000)
				await handleCsvFileData(data?.data);
			} else {
				setUploadMessage({message: response as string, type: "failure"});
				setTimeout(()=>{
					setUploadMessage(null)
				},5000)
				setSuccess(null)
				setFailure(null)
			}
			setLoading(false);
		} catch (err) {
			console.log('ERROR - bulk issuance::', err);
		}
	};

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				handleCsvFileData(requestId);
			}, 1000);
		} else {
			handleCsvFileData(requestId);
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	const handleCsvFileData = async (requestId: any) => {
		setLoading(true);
		if (requestId) {
			try {
				const response = await getCsvFileData(
					requestId,
					currentPage.pageNumber,
					currentPage.pageSize,
					searchText,
				);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const totalPages = data?.data?.response?.lastPage;
					setLoading(false);
					setCsvData(data?.data?.response?.data);
					setCurrentPage({
						...currentPage,
						total: totalPages,
					});
				}
			} catch (err) {
				setLoading(false);
			}
		}
		setLoading(false);
	};

	const handleDiscardFile = () => {
		setCsvData([]);
		setIsFileUploaded(false);
		setUploadedFileName('');
		setUploadedFile(null);
		setUploadMessage(null)
	};

	const handleDrop = (e: {
		preventDefault: () => void;
		dataTransfer: { files: any[] };
	}) => {
		e.preventDefault();
		if (isCredSelected) {
			const file = e.dataTransfer.files[0];
			if (file) {
				handleFileUpload(file);
			}
		}
	};

	const handleDragOver = (e: { preventDefault: () => void }) => {
		e.preventDefault();
	};

	const handleInputChange = (e: { target: { files: any[] } }) => {
		const file = e.target.files[0];

		if (file) {
			handleFileUpload(file);
		}
	};
	const clearError = () => {
		setUploadMessage(null);
	};

	const handleOpenConfirmation = () => {
		setOpenModal(true);
	};

	const handleCloseConfirmation = () => {
		setOpenModal(false);
	};

	const handleReset = () => {
		handleDiscardFile();
		setCredentialSelected("");
		setSuccess(null);
	};
	const handleResetForConfirm = () => {
		handleDiscardFile();
		setCredentialSelected("");
	};

	const confirmCredentialIssuance = async () => {
		setLoading(true);
		const response = await issueBulkCredential(requestId, SOCKET.id);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {

			if (data?.data) {
				setLoading(false);
				setOpenModal(false);
				setSuccess(data.message);
				setUploadMessage(null)
				handleResetForConfirm()
			} else {
				setFailure(response as string);
				setTimeout(()=>{
					setFailure(null)
				},5000)
				setLoading(false);
			}
		} else {
			setLoading(false);
			setFailure(response as string);
			setTimeout(() => {
				setFailure(null);
			}, 5000);
		}
	};

	const isCredSelected = Boolean(credentialSelected);

	const selectedCred: ICredentials | boolean | undefined = credentialOptions && credentialOptions.length > 0 && credentialOptions.find(
		(item: { value: string }) =>
			item.value &&
			item.value === credentialSelected,
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
				<ToastContainer />
				<div className="flex justify-between mb-4 items-center ml-1">
					<div>
						<p className="text-2xl font-semibold dark:text-white">
							Bulk Issuance
						</p>
						<span className="text-sm text-gray-400">Upload a .CSV file for bulk issuance</span>
					</div>
					<Button
						color="bg-primary-800"
						className="flex float-right bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-primary-600 font-medium rounded-md text-lg px-2 lg:px-3 py-2 lg:py-2.5 mr-2 ml-auto border-blue-600 hover:text-primary-600 dark:text-white dark:border-blue-500 dark:hover:text-primary-700 dark:hover:bg-secondary-700"
						style={{ height: '2.4rem', minWidth: '2rem' }}
						onClick={() => {
							window.location.href = pathRoutes.organizations.Issuance.history;
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
				{(success || failure) && (
					<AlertComponent
						message={success ?? failure}
						type={success ? 'success' : 'failure'}
						onAlertClose={() => {
							setSuccess(null);
							setFailure(null);
						}}
						viewButton={Boolean((success && success === "Issuance process completed") || (failure && failure === "Issuance process failed, please retry"))}
						path={pathRoutes.organizations.Issuance.history}
					/>
				)}
				<div className="flex flex-col justify-between min-h-100/21rem">
					<Card>
						<div>
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
												setCredentialSelected(value?.value ?? "");
											}}
										/>
									</div>
									<div className="mt-4">
										{credentialSelected && selectedCred && (
											<Card className='max-w-[30rem]'>
												<div>
													<p className="text-black dark:text-white pb-2">
														<span className="font-semibold">Schema: </span>
														{selectedCred?.schemaName || ""}{' '}
														<span>[{selectedCred?.schemaVersion}]</span>
													</p>
													<p className="text-black dark:text-white pb-2">
														{' '}
														<span className="font-semibold">
															Credential Definition:
														</span>{' '}
														{selectedCred?.credentialDefinition}
													</p>
													<span className='text-black dark:text-white font-semibold'>Attributes:</span>
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
									<div className="mt-4">
										<Button
											id="signinsubmit"
											isProcessing={process}
											type="submit"
											color="bg-primary-800"
											className={`py-2 px-4 rounded-md inline-flex items-center border text-2xl ${!isCredSelected
												? 'opacity-50 text-gray-700 dark:text-gray-400 border-gray-700'
												: 'text-primary-700 dark:text-white border-primary-700 bg-white-700 dark:hover:text-primary-700 hover:bg-secondary-700'
												}`}
											style={{ height: '2.4rem', minWidth: '2rem' }}
											disabled={!isCredSelected}
											onClick={DownloadSchemaTemplate}
										>
											<svg
												className={`h-6 w-6 pr-2 ${!isCredSelected
													? 'text-gray-700 dark:text-gray-400'
													: 'text-primary-700'
													}`}
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
												/>
											</svg>
											<span>Download Template</span>
										</Button>
									</div>
								</div>
								{/* ---------------- */}
								<div onDrop={handleDrop} onDragOver={handleDragOver}>
									<div className="lg:flex h-full">
										<div>
											<label
												htmlFor="csv-file"
												className={`flex flex-col items-center justify-center w-40 h-36 border-2  border-dashed rounded-md cursor-pointer bg-white dark:bg-gray-700 dark-border-gray-600 ${!isCredSelected
													? 'border-gray-200'
													: 'border-primary-700 dark:border-white'
													}`}
											>
												<div
													className={`flex flex-col items-center justify-center pt-5 pb-6 ${!isCredSelected
														? 'opacity-50 text-gray-700 dark:text-gray-700 border-gray-700'
														: 'text-primary-700 dark:text-white dark:border-white border-primary-700'
														}`}
												>
													<svg
														className={`h-12 w-12 ${!isCredSelected
															? 'text-gray-700 dark:text-gray-400'
															: 'dark:text-white text-primary-700'
															}`}
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														{' '}
														<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />{' '}
														<polyline points="16 6 12 2 8 6" />{' '}
														<line x1="12" y1="2" x2="12" y2="15" />
													</svg>
													<p
														className={`mb-2 mt-2 text-sm ${!isCredSelected
															? ' text-gray-500 dark:text-gray-400'
															: 'text-primary-700 dark:text-white'
															}`}
													>
														Drag file here
													</p>
												</div>
											</label>
											<div className="lg:flex justify-center">
												<div className="w-fit">
													<label htmlFor="organizationlogo">
														<div
															className={`px-4 py-2 mt-4 rounded-md text-center border text-white ${!isCredSelected
																? 'opacity-50 bg-gray-400 dark:bg-transparent dark:text-gray-400 border-gray-400'
																: 'bg-primary-700 hover:bg-primary-800 dark:border-primary-800  '
																}`}
														>
															Choose file
														</div>
														<input
															disabled={!isCredSelected}
															type="file"
															accept=".csv"
															name="file"
															className="hidden"
															id="organizationlogo"
															onChange={handleInputChange}
															title=""
															onClick={(event) => {
																event.target.value = null
															}} />
													</label>
												</div>
											</div>
										</div>
										<div className="flex flex-col justify-between lg:pb-8 lg:pl-6 lg:pb-12 w-full">
											{uploadedFileName && (
												<div
													className={`${!isCredSelected ? 'opacity-50' : ''
														} flex justify-between items-center bg-gray-100 dark:bg-gray-700 gap-2 p-4 text-sm rounded-lg mb-4`}
												>
													<p className="text-gray-700 dark:text-white px-2 word-break-word">
														{uploadedFileName}
													</p>
													<button
														onClick={handleDiscardFile}
														className="dark:text-white cursor-pointer shrink-0"
													>
														<svg
															className="h-5 w-5"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>
											)}
											{uploadMessage !== null && (
												<AlertComponent
													message={uploadMessage.message}
													type={uploadMessage?.type || "success"}
													onAlertClose={clearError}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>

					{csvData && csvData.length > 0 && (
						<Card className="mt-6">
							<div className="overflow-x-auto rounded-lg">
								<div className="inline-block min-w-full align-middle">
									<div className="overflow-hidden shadow sm:rounded-lg">
										{csvData && csvData.length > 0 && (
											<div className="mt-4 pb-4 mb-2">

												<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
													<thead className="bg-gray-50 dark:bg-gray-700">
														<tr>
															{csvData.length > 0 &&
																Object.keys(csvData[0]).map((header, index) => (
																	<th
																		key={index}
																		className={`p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white`}
																	>
																		{header}
																	</th>
																))}
														</tr>
													</thead>
													<tbody className="bg-white dark:bg-gray-800">
														{csvData &&
															csvData.length > 0 &&
															csvData.map((row, rowIndex) => (
																<tr
																	key={rowIndex}
																	className={`${rowIndex % 2 !== 0
																		? 'bg-gray-50 dark:bg-gray-700'
																		: ''
																		}`}
																>
																	{Object.values(row).map((cell, cellIndex) => (
																		<td
																			key={cellIndex}
																			className={`p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle	`}
																		>
																			{cell}
																		</td>
																	))}
																</tr>
															))}
													</tbody>
												</table>
											</div>
										)}
									</div>
								</div>
							</div>
							{currentPage.total > 1 && (
								<div className="flex items-center justify-end mb-4">
									<Pagination
										currentPage={currentPage.pageNumber}
										onPageChange={onPageChange}
										totalPages={currentPage.total}
									/>
								</div>
							)}
						</Card>
					)}
					<div>
						{!isCredSelected && (
							<>
								<p className="m-6 text-lg dark:text-white">Steps</p>
								<ul className="timelinestatic m-6">
									<li>
										<p className="steps-active-text text-gray-600 dark:text-white text-lg">
											Select and Download
										</p>
										<p className=" dark:text-white text-sm text-gray-500">
											Select credential definition and download .CSV file
										</p>
									</li>
									<li>
										<p className="steps-active-text text-gray-600 dark:text-white text-lg">
											Fill the data
										</p>
										<p className="dark:text-white text-sm text-gray-500">
											Fill issuance data in the downloaded .CSV file
										</p>
									</li>
									<li>
										<p className="steps-active-text text-gray-600 dark:text-white text-lg">
											Upload and Issue
										</p>
										<p className="dark:text-white text-sm text-gray-500">
											Upload .CSV file and click on issue
										</p>
									</li>
								</ul>
							</>
						)}

						<IssuancePopup
							openModal={openModal}
							closeModal={handleCloseConfirmation}
							isProcessing={loading}
							onSuccess={confirmCredentialIssuance}
						/>

						<div className="mt-4">
							<Button
								onClick={handleOpenConfirmation}
								disabled={!isFileUploaded}
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
								onClick={handleReset}
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

export default BulkIssuance;
