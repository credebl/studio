'use client'

import { ArrowLeft, Download, History, Plus } from "lucide-react";
import { DidMethod, Features, SchemaTypes } from "@/common/enums";
import { IAttributes, ICredentials, IUploadMessage } from "../../connectionIssuance/type/Issuance";
import { ToastContainer, toast } from 'react-toastify';
import { apiStatusCodes, itemPerPage } from "@/config/CommonConstant";
import { getAllSchemas, getSchemaCredDef } from "@/app/api/schema";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";

import { AlertComponent } from "@/components/AlertComponent";
import { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Create from "@/features/schemas/components/Create";
import IssuancePopup from "./IssuancePopup";
import React from "react";
import RoleViewButton from "@/components/RoleViewButton";
import { RootState } from "@/lib/store";
import SOCKET from "@/config/SocketConfig";
import { getOrganizationById } from "@/app/api/organization";
import { pathRoutes } from "@/config/pathRoutes";
import { setSocketId } from "@/lib/socketSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Option, SearchableSelect } from "@/components/ShadCnSelect";
import { DownloadCsvTemplate, getCsvFileData, issueBulkCredential, uploadCsvFile } from "@/app/api/BulkIssuance";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { GetAllSchemaListParameter } from "../type/BulkIssuance";

export interface SelectRef {
	clearValue(): void;
}
const BulkIssuance = () => {
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [requestId, setRequestId] = useState("");
	const [process, setProcess] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [credentialOptionsData, setCredentialOptionsData] = useState([]);
	const [credentialSelected, setCredentialSelected] = useState<ICredentials | null>();
	const [isFileUploaded, setIsFileUploaded] = useState(false);
	const [uploadedFileName, setUploadedFileName] = useState('');
	const [uploadedFile, setUploadedFile] = useState(null);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [searchText, setSearchText] = useState('');
	const [uploadMessage, setUploadMessage] = useState<IUploadMessage | null>(null)
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [mounted, setMounted] = useState<boolean>(false)
	const [schemaType, setSchemaType] = useState<SchemaTypes>();
	const [selectedTemplate, setSelectedTemplate] = useState<any>();
	const [isAllSchema, setIsAllSchema] = useState<boolean>();
	const [attributes, setAttributes] = useState<IAttributes[]>([]);
	const [schemaListAPIParameters, setSchemaListAPIParameters] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});


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

	const [searchValue, setSearchValue] = useState('');

	const orgId = useAppSelector((state: RootState) => state.organization.orgId)

	const dispatch = useAppDispatch()

	const router = useRouter()

	const socketId = useAppSelector((state:RootState)=> state.socket.SOCKET_ID)

	const onInputChange = (inputValue: string) => {
		setSearchValue(inputValue);
		setSchemaListAPIParameters(prevParams => {
			const updatedParams = {
				...prevParams,
				allSearch: inputValue,
			};
			getSchemaCredentials(updatedParams);
			return updatedParams;
		});
	};

	const getSchemaCredentials = async (schemaListAPIParameters: GetAllSchemaListParameter) => {
		try {
			setLoading(true);

			let orgDid = ''
			let ledgerId = ''

			const response = await getOrganizationById(orgId)

			console.log("response",response)

			if (typeof response === 'string') {
				// handle the error message
				console.error('Error fetching organization:', response);
			} else {
				const { data } = response;
				orgDid = data?.data?.org_agents[0]?.orgDid
				ledgerId = data.data.org_agents[0].ledgers.id
				// proceed with data
			}

			const isAllSchemaSelectedFlag = false
			if (isAllSchemaSelectedFlag === false || !isAllSchemaSelectedFlag) {
				setIsAllSchema(false)
			}
			else if (isAllSchemaSelectedFlag === 'true') {
				setIsAllSchema(true)
			}

			let currentSchemaType = schemaType;

			if (orgDid?.includes(DidMethod.POLYGON) || orgDid?.includes(DidMethod.KEY) || orgDid?.includes(DidMethod.WEB)) {
				currentSchemaType = SchemaTypes.schema_W3C;
			} else if (orgDid?.includes(DidMethod.INDY)) {
				currentSchemaType = SchemaTypes.schema_INDY;
			}

			let dropDownOptions;
			setSchemaType(currentSchemaType);
			if ((currentSchemaType === SchemaTypes.schema_INDY && isAllSchema) || (currentSchemaType && orgId && !isAllSchema)) {
				const response = await getSchemaCredDef(currentSchemaType, orgId);
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const { data: credentialDefsData } = data;

					dropDownOptions = credentialDefsData.map(
						({
							schemaName,
							schemaVersion,
							credentialDefinition,
							credentialDefinitionId,
							schemaIdentifier,
							schemaAttributes
						}: ICredentials,index:number) => ({
							value: schemaType === SchemaTypes.schema_INDY ? credentialDefinitionId : schemaVersion,
							label: `${schemaName} [${schemaVersion}]${currentSchemaType === SchemaTypes.schema_INDY ? ` - (${credentialDefinition})` : ''}`,
							id:index,
							schemaName: schemaName,
							schemaVersion: schemaVersion,
							credentialDefinition: credentialDefinition,
							credentialDefinitionId: credentialDefinitionId,
							schemaIdentifier: schemaIdentifier,
							schemaAttributes: schemaAttributes && typeof schemaAttributes === "string" && JSON.parse(schemaAttributes)
						}),
					);

					setCredentialOptionsData(dropDownOptions);
				} else {
					setUploadMessage({ message: response as string, type: "failure" });
					setSuccess(null)
					setFailure(null)
				}
				setLoading(false);
			}
			else if (currentSchemaType === SchemaTypes.schema_W3C && orgId && isAllSchema) {


				const response = await getAllSchemas(schemaListAPIParameters, currentSchemaType,ledgerId);
				const { data } = response as AxiosResponse;


				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefsData = data.data.data;


					dropDownOptions = credentialDefsData.map(({
						name,
						version,
						schemaLedgerId,
						attributes,
						type
					}: ICredentials) => ({
						value: version,
						label: `${name} [${version}]`,
						schemaName: name,
						type: type,
						schemaVersion: version,
						schemaIdentifier: schemaLedgerId,
						attributes: Array.isArray(attributes) ? attributes : (attributes ? JSON.parse(attributes) : []),
					}));
					setCredentialOptionsData(dropDownOptions);
				} else {
					setUploadMessage({ message: response as string, type: "failure" });
					setSuccess(null)
					setFailure(null)
				}
				setLoading(false);
			}
		} catch (error) {
			setUploadMessage({ message: (error as Error).message, type: "failure" });
			setSuccess(null)
			setFailure(null)
		}
	};

	const handleSelect = (value:Option)=>{
		const safeValue = {
			...value,
			schemaIdentifier: value?.schemaIdentifier ?? '',
			schemaName: value.schemaName ?? '',
			schemaVersion: value.schemaVersion ?? '',
		};
		onSelectChange(safeValue);		console.log("value",value)
	}

	const onSelectChange = (newValue: ICredentials | undefined) => {
		const value = newValue as ICredentials | undefined;
		if (schemaType === SchemaTypes.schema_INDY) {
			setSelectedTemplate(value?.credentialDefinitionId);
			setCredentialSelected(value ?? null);
		} else if (schemaType === SchemaTypes.schema_W3C) {
			setCredentialSelected(value ?? null);
			setSelectedTemplate(value?.schemaIdentifier)
		}
		setAttributes(value?.schemaAttributes ?? value?.attributes ?? []);
	};


	useEffect(() => {
		getSchemaCredentials(schemaListAPIParameters);
	}, [isAllSchema]);
	useEffect(() => {
		setMounted(true);
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
		if (credentialSelected ) {
			try {
				setProcess(true);
				if (!schemaType)return
				const response = await DownloadCsvTemplate(selectedTemplate, schemaType, orgId);
				const { data } = response as AxiosResponse;

				if (data) {
					const fileUrl = data;
					if (fileUrl) {
						downloadFile(fileUrl, 'downloadedFile.csv');
						setSuccess('File downloaded successfully');
						setTimeout(() => {
							setSuccess(null)
						}, 5000)
						setProcess(false);
					} else {
						setUploadMessage({ message: 'File URL is missing in the response', type: "failure" });
						setTimeout(() => {
							setUploadMessage(null)
						}, 5000)
						setSuccess(null)
						setFailure(null)
					}
				} else {
					setUploadMessage({ message: 'API request was not successful', type: "failure" });
					setTimeout(() => {
						setUploadMessage(null)
					}, 5000)
					setSuccess(null)
					setFailure(null)
				}
			} catch (error) {
				setUploadMessage({ message: error as string, type: "failure" });
				setTimeout(() => {
					setUploadMessage(null)
				}, 5000)
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
			setUploadMessage({ message: 'Invalid file type. Please select only CSV files.', type: "failure" });
			setTimeout(() => {
				setUploadMessage(null)
			}, 5000)
			setSuccess(null)
			setFailure(null)
			return;
		}
		try {

			const binaryData = await readFileAsBinary(file);

			const clientId = SOCKET.id || '';

			dispatch(setSocketId(clientId))

			const payload = {
				file: binaryData,
				fileName: file?.name || "Not available"
			};

			await wait(500);

			setUploadedFileName(file?.name);
			setUploadedFile(file);
			if (!schemaType)return

			const response = await uploadCsvFile(payload, selectedTemplate, schemaType, orgId);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
				setLoading(false);
				setRequestId(data?.data);
				setIsFileUploaded(true);
				setUploadMessage({ message: data?.message, type: "success" });
				setTimeout(() => {
					setUploadMessage(null)
				}, 5000)
				await handleCsvFileData(data?.data);
			} else {
				setUploadMessage({ message: response as string, type: "failure" });
				setTimeout(() => {
					setUploadMessage(null)
				}, 5000)
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
					orgId
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
				console.error("Error in bulk issuance",err)
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

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const file = files[0];
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
	const selectInputRef = React.useRef<SelectRef | null>(null);

	const onClear = () => {
		if (selectInputRef.current) {
			selectInputRef.current.clearValue();
		}
	};

	const handleReset = () => {
		handleDiscardFile();
		setCredentialSelected(null);
		setSuccess(null);
		onClear()
	};
	const handleResetForConfirm = () => {
		handleDiscardFile();
		setCredentialSelected(null);
	};

	const confirmCredentialIssuance = async () => {
		setLoading(true);
		const response = await issueBulkCredential(requestId, socketId,orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {

			if (data?.data) {
				setLoading(false);
				setOpenModal(false);
				setSuccess(data.message);
				setUploadMessage(null)
				handleResetForConfirm()
				onClear()
			} else {
				setFailure(response as string);
				setTimeout(() => {
					setFailure(null)
				}, 5000)
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

	const selectedCred: ICredentials | boolean | undefined = credentialOptionsData && credentialOptionsData.length > 0 && credentialOptionsData.find(
		(item: { value: string }) =>
			item.value &&
			item.value === credentialSelected?.value
	);

	const createSchemaTitle = { title: 'Create Schema', svg: <Create /> };

	return (
		
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-end items-center">
					<Button onClick={() => router.push(pathRoutes.organizations.Issuance.issue)}>
						<ArrowLeft /> Back
					</Button>
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
					<div className='flex sm:flex-row flex-col sm:space-x-2 sm:space-y-0 space-y-2  sm:items-center'>
						<Button
							color="bg-primary-800"
							className="group flex shrink-0 bg-secondary-700 ring-primary-900 bg-white-700 hover:bg-secondary-700 ring-2 text-primary-600 font-medium rounded-md text-lg px-2 lg:px-3 py-2 lg:py-2.5 ml-auto border-primary-650 hover:text-primary-600 dark:text-custom-100 dark:border-blue-450 dark:hover:text-primary-700 dark:hover:bg-secondary-700"
							style={{ height: '2rem', minWidth: '2rem' }}
							onClick={() => {
								router.push(pathRoutes.organizations.Issuance.history)
							}}
						>
							<History />
							<span className='text-custom-900 dark:text-custom-100 group-hover:text-custom-900'>View History</span>
						</Button>

						<RoleViewButton
							buttonTitle={createSchemaTitle.title}
							feature={Features.CRETAE_SCHEMA}
							svgComponent={<Plus />}
							onClickEvent={() => {
								router.push(`${pathRoutes.organizations.createSchema}`);
							}}
							isPadding={createSchemaTitle.title !== 'Create Schema'}
						/>
					</div>
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
					<Card className="p-5">
						<div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-[980px]">
								<div className="flex flex-col justify-between">
									<div>
										{
											// mounted ?
											<SearchableSelect className='max-w-lg border-2 border-primary'
												options={credentialOptionsData}
												value={''}
												onValueChange={handleSelect}
												placeholder="Select Schema Credential Definition" />
											// 	<Select
											// 		placeholder="Select Schema - Credential definition"
											// 		className="basic-single"
											// 		classNamePrefix="select"
											// 		isDisabled={false}
											// 		isClearable={true}
											// 		isRtl={false}
											// 		isSearchable={true}
											// 		name="color"
											// 		options={credentialOptionsData?.map((option) => ({
											// 			...option,
											// 			isDisabled: (option.schemaAttributes || option.attributes || [])?.some(attr => attr.schemaDataType === DataType.ARRAY || attr.schemaDataType === DataType.OBJECT)
											// 		}))}
											// 		onInputChange={onInputChange}
											// 		onChange={onSelectChange}
											// 		value={credentialOptionsData.find((option) => option.value === searchValue)}
											// 		ref={selectInputRef}
											// 		styles={{
											// 			control: (base, state) => ({
											// 				...base,
											// 				border: state.isFocused ? '2px solid #CE9200' : '1px solid #9CA3AF', // Change border color when focused
											// 				boxShadow: state.isFocused ? '0 0 2px rgba(79, 70, 229, 0.5)' : 'none',
											// 				'&:hover': {
											// 					border: '2px solid #CE9200' // Change border on hover
											// 				}
											// 			}),
											// 			menu: (base) => ({
											// 				...base,
											// 				backgroundColor: '#FEEFCC' // Change background color of dropdown
											// 			}),
											// 			option: (base, { isFocused, isSelected, isDisabled }) => ({
											// 				...base,
											// 				backgroundColor: isDisabled ? '#E5E7EB' : isSelected ? 'white' : isFocused ? '#FEEFCC' : 'white',
											// 				color: isDisabled ? '#9CA3AF' : isSelected ? '#CE9200' : 'black',
											// 				cursor: isDisabled ? 'not-allowed' : 'pointer',
											// 				'&:hover': {
											// 					backgroundColor: isDisabled ? '#E5E7EB' : '#FEEFCC'
											// 				}
											// 			})
											// 		}}
											// 	/> :
											// 	null
										}
									</div>
									<div className="mt-4">
										{credentialSelected && (
											<Card className='max-w-[30rem] p-5'>
												<div>
													<p className="text-black dark:text-white pb-2">
														<span className="font-semibold">Schema: </span>
														{credentialSelected?.schemaName || ""}{' '}
														<span>[{credentialSelected?.schemaVersion}]</span>
													</p>
													{
														schemaType === SchemaTypes.schema_INDY &&
														<p className="text-black dark:text-white pb-2">
															{' '}
															<span className="font-semibold">
																Credential Definition:
															</span>{' '}
															{credentialSelected?.credentialDefinition}
														</p>
													}

													<span className='text-black dark:text-white font-semibold'>Attributes:</span>
													<div className="flex flex-wrap overflow-hidden">
														{attributes?.map(
															(element: IAttributes) => (
																<div key={element.attributeName}>
																	<span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
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
											// isProcessing={process}
											// type="submit"
											variant="ghost"
											className="border-ring hover:bg-primary flex items-center rounded-xl border px-4 py-2 transition-colors"
											style={{ height: '2.4rem', minWidth: '2rem' }}
											disabled={!isCredSelected}
											onClick={DownloadSchemaTemplate}
										>
											<Download />
											<span>Download Template</span>
										</Button>
									</div>
								</div>
								{/* ---------------- */}
										<div
										onDrop={handleDrop}
										onDragOver={handleDragOver}
										role="region"
										tabIndex={0}
										>									<div className="lg:flex h-full">
										<div>
											<label
												htmlFor="csv-file"
												className={`flex flex-col items-center justify-center w-40 h-36 border-2 border-dashed rounded-md cursor-pointer bg-white dark:bg-gray-700 dark-border-gray-600 ${!isCredSelected
													? 'border-gray-200'
													: 'border-primary-900 dark:border-white'
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
															: 'dark:text-white text-primary-900'
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
															: 'text-primary-900 dark:text-white'
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
																? 'opacity-50 bg-black/50 dark:bg-transparent dark:text-gray-400 border-gray-400'
																: 'bg-black dark:bg-transparent dark:hover:bg-primary-500 dark:text-custom-100 dark:hover:text-custom-900'
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
															(event.target as HTMLInputElement).value = '';															}} />
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
									<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious href="#" />
										</PaginationItem>
										 <PaginationItem>
											<PaginationEllipsis />
										</PaginationItem>
										<PaginationItem>
											<PaginationNext href="#" />
										</PaginationItem>
									</PaginationContent>
									</Pagination>
									{/* <Pagination
										currentPage={currentPage.pageNumber}
										onPageChange={onPageChange}
										totalPages={currentPage.total}
									/> */}
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
								className="float-right py-2 mb-4 bg-primary ring-primary hover:bg-primary/90 ring-2 font-medium rounded-lg text-sm px-4 lg:px-5 lg:py-2.5 mr-0 ml-auto dark:text-white dark:hover:text-white dark:hover:bg-primary mx-4"
								style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="27"
									height="18"
									fill="current"
									viewBox="0 0 27 18"
									className="mr-1"
									style={{ height: '20px', width: '30px' }}
								>
									<path
										fill="currentColor"
										d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 5.985-5.48-5.277.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277L15.27 16.57Z"
									/>
								</svg>
								<span className='text-custom-900'>Issue</span>
							</Button>
							<Button
								onClick={handleReset}
								type="reset"
								color="bg-primary-800"
								className="group flex shrink-0 bg-secondary-700 ring-primary-900 bg-white-700 hover:bg-secondary-700 ring-2 text-primary-600 font-medium rounded-md text-lg px-2 lg:px-3 py-2 lg:py-2.5 ml-auto border-primary-650 hover:text-primary-600 dark:text-custom-100 dark:border-blue-450 dark:hover:text-primary-700 dark:hover:bg-secondary-700"
								style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="mr-2 text-custom-900 dark:text-custom-100 group-hover:dark:text-custom-900"
									width="18"
									height="18"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
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
