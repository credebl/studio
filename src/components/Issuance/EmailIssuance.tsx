import * as Yup from 'yup';
import React, { useEffect, useRef, useState } from 'react';
import { pathRoutes } from '../../config/pathRoutes';
import BreadCrumbs from '../BreadCrumbs';
import BackButton from '../../commonComponents/backbutton';
import { Button, Card } from 'flowbite-react';
import Select from 'react-select';
import { AlertComponent } from '../AlertComponent';
import IssuancePopup from './IssuancePopup';
import type { AxiosResponse } from 'axios';
import { getFromLocalStorage } from '../../api/Auth';
import { getSchemaCredDef } from '../../api/BulkIssuance';
import { storageKeys, apiStatusCodes } from '../../config/CommonConstant';
import type { IAttributes, ICredentials, IValues } from './interface';
import { Field, FieldArray, Form, Formik } from 'formik';
import CustomSpinner from '../CustomSpinner';
import { issueOobEmailCredential } from '../../api/issuance';
import { EmptyListMessage } from '../EmptyListComponent';
import ResetPopup from './ResetPopup';

const EmailIssuance = () => {
	const [formData, setFormData] = useState();
	const [userData, setUserData] = useState();
	const [loading, setLoading] = useState<boolean>(true);
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [credentialSelected, setCredentialSelected] = useState<string>('');
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [batchName, setBatchName] = useState('');
	const [openResetModal, setOpenResetModal] = useState<boolean>(false);
	const [attributes, setAttributes] = useState([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [issueLoader, setIssueLoader] = useState(false);
	const inputRef = useRef(null);

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

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const confirmOOBCredentialIssuance = async () => {
		setIssueLoader(true);
		const existingData = userData;

		let transformedData = { credentialOffer: [] };
		if (existingData && existingData.formData) {
			existingData.formData.forEach((entry) => {
				const transformedEntry = { emailId: entry.email, attributes: [] };
				entry.attributes.forEach((attribute) => {
					const transformedAttribute = {
						value: String(attribute.value || ''),
						name: attribute.name || '',
					};
					transformedEntry.attributes.push(transformedAttribute);
				});

				transformedData.credentialOffer.push(transformedEntry);
			});
			transformedData.credentialDefinitionId = credentialSelected;
			const transformedJson = JSON.stringify(transformedData, null, 2);
			const response = await issueOobEmailCredential(transformedJson);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				if (data?.data) {
					setLoading(false);
					setIssueLoader(false);
					setSuccess(data?.message);
					setOpenModal(false);
					setTimeout(() => {
						setSuccess(null);
					}, 3000);
					handleReset();
					setTimeout(() => {
						window.location.href = pathRoutes?.organizations?.issuedCredentials;
					}, 500);
				} else {
					setFailure(response as string);
					setLoading(false);
					setOpenModal(false);
				}
			} else {
				setLoading(false);
				setFailure(response as string);
				setOpenModal(false);
				setIssueLoader(false);
				setTimeout(() => {
					setFailure(null);
				}, 4000);
			}
		}
	};

	useEffect(() => {
		const initFormData = {
			email: '',
			attributes: attributes?.map((item) => {
				return {
					...item,
					value: '',
					name: item?.attributeName,
				};
			}),
		};

		setFormData({ formData: [initFormData] });
	}, [attributes]);
	const isCredSelected = Boolean(credentialSelected);

	const selectedCred: ICredentials | boolean | undefined =
		credentialOptions &&
		credentialOptions.length > 0 &&
		credentialOptions.find(
			(item: { value: string }) =>
				item.value && item.value === credentialSelected,
		);

	const handleEditClick = () => {
		if (isCredSelected) {
			setIsEditing(!isEditing);
		}
	};

	const handleInputChange = (e: {
		target: { value: React.SetStateAction<string> };
	}) => {
		setBatchName(e.target.value);
	};

	const handleBlur = () => {
		setIsEditing(false);
	};

	const handleReset = () => {
		setCredentialSelected(null);
		setBatchName('');
		setOpenResetModal(false);
	};

	const handleCloseConfirmation = () => {
		setOpenModal(false);
	};

	const handleOpenConfirmation = () => {
		setOpenModal(true);
	};
	const handleResetCloseConfirmation = () => {
		setOpenResetModal(false);
	};

	const handleResetOpenConfirmation = () => {
		setOpenResetModal(true);
	};
	
	const MailError = ({
		handler,
		formindex,
		error,
	}: {
		handler: { touched: boolean; errors: string; formData: Array<T>[] };
		formindex: Number;
		error: string;
	}) => {
		if (error === 'email') {
			return (
				<>
					{handler?.touched?.formData &&
						handler?.touched?.formData[formindex]?.email &&
						handler?.errors?.formData &&
						handler?.errors?.formData[formindex]?.email && (
							<label style={{ color: 'red' }} className="text-sm">
								{handler?.errors?.formData[formindex]?.email}
							</label>
						)}
				</>
			);
		} else if (error === 'attribute') {
			return (
				<>
					{handler?.touched?.formData &&
						handler?.touched?.formData[formindex]?.attributes &&
						handler?.errors?.formData &&
						handler?.errors?.formData[formindex]?.attributes && (
							<label style={{ color: 'red' }} className="text-sm font-light">
								All attributes are required{' '}
							</label>
						)}
				</>
			);
		}
		return null;
	};

	return (
		<div className="px-4 pt-2">
			<div className="col-span-full xl:mb-2">
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
				<div className="flex justify-between mb-3 items-center ml-1">
					<div>
						<p className="text-2xl font-semibold dark:text-white">Email</p>
					</div>
				</div>
				<div className="flex flex-col justify-between gap-4">
					<Card>
						<div className="md:h-72">
							<p className="text-xl pb-6 font-normal dark:text-white">
								Select Schema and credential definition
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<div className="flex flex-col justify-between">
									<div className="search-dropdown text-primary-700 drak:text-primary-700">
										<Select
											placeholder="Select Schema-Credential definition"
											className="basic-single "
											classNamePrefix="select"
											isDisabled={false}
											isClearable={true}
											isRtl={false}
											isSearchable={true}
											name="color"
											options={credentialOptions}
											onChange={(value: IValues | null) => {
												setBatchName(value?.label ?? '');
												setCredentialSelected(value?.value ?? '');
												setAttributes(value?.schemaAttributes);
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
																<div
																	key={element.attributeName}
																	className="truncate"
																>
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
								{/* required for batch application */}
								{/* <div className="flex justify-between h-10">
									<input
										ref={inputRef}
										disabled={!isEditing}
										value={batchName}
										type="text"
										id="batch"
										onBlur={handleBlur}
										onChange={handleInputChange}
										className="w-[92%] gap-x-2 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 sm:text-md rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										placeholder="You can specify batch here"
									/>
									<Button
										disabled={!isCredSelected}
										color="none"
										onClick={handleEditClick}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 18 18"
											fill="none"
										>
											<path
												d="M16.4013 11.1954V14.396C16.4013 14.8204 16.2327 15.2274 15.9326 15.5275C15.6325 15.8277 15.2255 15.9963 14.8011 15.9963H3.60014C3.17576 15.9963 2.76875 15.8277 2.46867 15.5275C2.16859 15.2274 2 14.8204 2 14.396V3.19403C2 2.76961 2.16859 2.36257 2.46867 2.06246C2.76875 1.76235 3.17576 1.59375 3.60014 1.59375H6.80042"
												stroke="#1F4EAD"
												stroke-width="2.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M10.4011 11.0419L18.0018 3.36058L14.6415 0L7.0408 7.60132L6.80078 11.2019L10.4011 11.0419Z"
												fill="#1F4EAD"
											/>
										</svg>
									</Button>
								</div> */}
							</div>
						</div>
					</Card>
					<div
						className={`${
							isCredSelected ? '' : 'md:h-[300px] '
						} flex flex-col justify-between w-full`}
					>
						<Card>
							<div
								className={`${isCredSelected ? '' : 'md:h-[300px] '} w-full`}
							>
								<div className="flex justify-between mb-4 items-center ml-1">
									<div>
										<p className="text-2xl font-semibold dark:text-white">
											Issue Credential(s) to the email
										</p>
										<span className="text-sm text-gray-400">
											Please enter an email address to issue the credential to
										</span>
									</div>
									{/* rquired for history details  */}
									{/* <Button
										color="bg-primary-800"
										className="flex float-right bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-primary-600 font-medium rounded-md text-lg px-2 lg:px-3 py-2 lg:py-2.5 mr-2 ml-auto border-blue-600 hover:text-primary-600 dark:text-white dark:border-blue-500 dark:hover:text-primary-700 dark:hover:bg-secondary-700"
										style={{ height: '2.4rem', minWidth: '2rem' }}
										onClick={() => {
											window.location.href =
												pathRoutes.organizations.Issuance.emailHistory;
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
									</Button> */}
								</div>
								{isCredSelected ? (
									<div>
										<div className="flex flex-col justify-between">
											{loading ? (
												<div className="flex items-center justify-center mb-4">
													<CustomSpinner />
												</div>
											) : (
												<div className="relative">
													<div className="m-0" id="createSchemaCard">
														<div>
															<Formik
																initialValues={formData}
																validationSchema={Yup.object().shape({
																	formData: Yup.array().of(
																		Yup.object().shape({
																			email: Yup.string()
																				.email('Invalid email address')
																				.required('Email is required'),
																			attributes: Yup.array().of(
																				Yup.object().shape({
																					value: Yup.string().required(
																						'All attribute are required',
																					),
																				}),
																			),
																		}),
																	),
																})}
																validateOnBlur
																validateOnChange
																enableReinitialize
																onSubmit={async (values): Promise<void> => {
																	setUserData(values);
																	handleOpenConfirmation();
																}}
															>
																{(formikHandlers): JSX.Element => (
																	<Form onSubmit={formikHandlers.handleSubmit}>
																		<FieldArray
																			name="formData"
																			render={(arrayHelpers: {
																				form: { values: { formData: any[] } };
																				remove: (arg0: any) => any;
																				values: { attribute: string | any[] };
																				push: (arg0: {
																					email: string;
																					attributes: {
																						value: string;
																						name: any;
																					}[];
																				}) => void;
																			}) => {
																				return (
																					<div className="pb-4">
																						<div className="">
																							{arrayHelpers.form.values
																								.formData &&
																								arrayHelpers.form.values
																									.formData.length > 0 &&
																								arrayHelpers.form.values.formData.map(
																									(formData1, index) => {
																										return (
																											<div
																												key={index}
																												className="px-4 pt-8 pb-10 mb-4 rounded-lg border border-gray-200"
																											>
																												<div className="flex justify-between">
																													<div className="relative flex gap-2 items-center mb-4 w-10/12">
																														<label
																															className="font-semibold text-base dark:text-white"
																															style={{
																																minWidth:
																																	'80px',
																															}}
																														>
																															Email ID
																														</label>
																														<Field
																															name={`formData[${index}].email`}
																															placeholder={
																																'email'
																															}
																															type="email"
																															className="w-full md:w-5/12 bg-gray-50 border border-gray-300 text-gray-900 sm:text-md rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																														/>
																														<div className="absolute top-11 left-24">
																															<MailError
																																handler={
																																	formikHandlers
																																}
																																formindex={
																																	index
																																}
																																error={'email'}
																															/>
																														</div>
																													</div>

																													{arrayHelpers.form
																														.values.formData
																														.length > 1 && (
																														<div
																															key={index}
																															className="sm:w-2/12 text-red-600 flex justify-end"
																														>
																															<Button
																																data-testid="deleteBtn"
																																type="button"
																																color="danger"
																																onClick={() =>
																																	arrayHelpers.remove(
																																		index,
																																	)
																																}
																																disabled={
																																	arrayHelpers
																																		.form.values
																																		.formData
																																		.length ===
																																	1
																																}
																																className={` dark:bg-gray-700 flex justify-end focus:ring-0`}
																															>
																																<svg
																																	xmlns="http://www.w3.org/2000/svg"
																																	fill="none"
																																	viewBox="0 0 24 24"
																																	strokeWidth={
																																		1.5
																																	}
																																	stroke="currentColor"
																																	className="w-6 h-6"
																																>
																																	<path
																																		strokeLinecap="round"
																																		strokeLinejoin="round"
																																		d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
																																	/>
																																</svg>
																															</Button>
																														</div>
																													)}
																												</div>

																												<label className="w-20 font-semibold text-base dark:text-white">
																													Credential data
																												</label>
																												<div className="grid md:grid-cols-2 grid-cols-1 gap-8 w-full gap-2">
																													{formData1.attributes &&
																														formData1
																															?.attributes
																															.length > 0 &&
																														formData1?.attributes.map(
																															(
																																item: {
																																	displayName: ReactNode | string;
																																	attributeName: ReactNode | string;
																																	name:
																																		| string
																																		| number
																																		| boolean
																																		| React.ReactElement<
																																				any,
																																				| string
																																				| React.JSXElementConstructor<any>
																																		  >
																																		| Iterable<React.ReactNode>
																																		| React.ReactPortal
																																		| null
																																		| undefined;
																																	schemaDataType: any;
																																},
																																attIndex: any,
																															) => (
																																<>
																																	<div className="mt-3">
																																		<div className="relative flex items-center w-full gap-2">
																																			<label
																																				className="text-base dark:text-white text-gray-800"
																																				style={{
																																					minWidth:
																																						Math.max(
																																							...formData1.attributes.map(
																																								(
																																									item,
																																								) =>
																																									item?.displayName?.toString()?.length,
																																							),
																																						) *
																																						10,
																																				}}
																																			>
																																				{item?.displayName}
																																			</label>
																																			<Field
																																				type={
																																					item.schemaDataType
																																				}
																																				placeholder={
																																					item.name
																																				}
																																				name={`formData[${index}].attributes.${attIndex}.value`}
																																				className="w-8/12 bg-gray-50 border border-gray-300 text-gray-900 sm:text-md rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																																			/>
																																		</div>
																																	</div>
																																	<>
																																		<div
																																			className="absolute bottom-24"
																																			style={{
																																				left:
																																					Math.max(
																																						...formData1.attributes.map(
																																							(
																																								item,
																																							) =>
																																								item?.name?.toString().length,
																																						),
																																					) *
																																						10 +
																																					28,
																																			}}
																																		>
																																			<MailError
																																				handler={
																																					formikHandlers
																																				}
																																				formindex={
																																					index
																																				}
																																				error={
																																					'attribute'
																																				}
																																				attrIndex={
																																					attIndex
																																				}
																																				length={
																																					formData1
																																						?.attributes
																																						?.length
																																				}
																																			/>
																																		</div>
																																	</>
																																</>
																															),
																														)}
																												</div>
																												{/* // required for validation of only one attribute is required */}
																												{/* {!formData1.attributes.some(
																													(item) => item?.value,
																												) && (
																													<div className="text-red-700">
																														Atleast one
																														attribute should
																														have a value
																													</div>
																												)} */}
																											</div>
																										);
																									},
																								)}
																						</div>
																						<div className="absolute flex justify-center w-full">
																							<Button
																								onClick={() =>
																									arrayHelpers.push({
																										email: '',
																										attributes: attributes?.map(
																											
																											(item) => {
																												return {
																													attributeName:
																														item.attributeName,
																													schemaDataType:
																														item.schemaDataType,
																													displayName:
																														item.displayName,
																													value: '',
																													name: item.attributeName,
																												};
																											},
																										),
																									})
																								}
																								disabled={
																									arrayHelpers.form.values
																										.formData.length >= 10 ||
																									!formikHandlers?.isValid
																								}
																								className={`bottom-0 focus:ring-primary-700 focus:ring-2 dark:focus:ring-gray-500
																				text-primary-700 hover:text-white dark:disabled:text-secondary-disabled disabled:text-primary-disabled bg-white hover:enabled:bg-primary-700 dark:text-white dark:bg-gray-700 dark:hover:enabled:!bg-gray-500 dark:hover:enabled:!text-gray-50 border border-primary-700 disabled:border-primary-disabled dark:border-gray-600 absolute w-max left-[50%] translate-x-[-50%] m-auto flex flex-row items-center rounded-full  
																				 disabled:opacity-100 group`}
																								type="button"
																								style={{
																									height: '2rem',
																									width: '10rem',
																									minWidth: '2rem',
																								}}
																							>
																								<svg
																									xmlns="http://www.w3.org/2000/svg"
																									fill="none"
																									viewBox="0 0 24 24"
																									stroke-width="1.5"
																									stroke="currentColor"
																									className="w-6 h-6"
																								>
																									<path
																										stroke-linecap="round"
																										stroke-linejoin="round"
																										d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
																									/>
																								</svg>
																								<span className="ml-1 my-0.5">
																									Add another
																								</span>
																							</Button>
																						</div>
																					</div>
																				);
																			}}
																		/>
																		<IssuancePopup
																			openModal={openModal}
																			closeModal={handleCloseConfirmation}
																			isProcessing={issueLoader}
																			onSuccess={confirmOOBCredentialIssuance}
																		/>
																		<ResetPopup
																			openModal={openResetModal}
																			closeModal={handleResetCloseConfirmation}
																			isProcessing={issueLoader}
																			onSuccess={handleReset}
																		/>
																		<div className="flex justify-end gap-4">
																			<Button
																				type="button"
																				color="bg-primary-800"
																				disabled={loading}
																				className="dark:text-white bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-base px-4 lg:px-5 py-2 lg:py-2.5 ml-auto dark:hover:text-black"
																				style={{
																					height: '2.6rem',
																					width: '6rem',
																					minWidth: '2rem',
																				}}
																				onClick={handleResetOpenConfirmation}
																			>
																				<svg
																					xmlns="http://www.w3.org/2000/svg"
																					className="mr-2 dark:text-white dark:group-hover:text-primary-700"
																					width="18"
																					height="18"
																					fill="none"
																					viewBox="0 0 20 20"
																				>
																					<path
																						fill="currentColor"
																						d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z"
																					/>
																				</svg>
																				Reset
																			</Button>
																			<Button
																				type="submit"
																				color="bg-primary-800"
																				className="text-white px-6 py-1 items-center justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
																				disabled={!formikHandlers?.isValid}
																			>
																				<svg
																					xmlns="http://www.w3.org/2000/svg"
																					width="25"
																					height="18"
																					viewBox="0 0 25 18"
																					fill="none"
																				>
																					<path
																						d="M0.702317 10.6546C1.0896 10.6546 1.40463 10.3396 1.40463 9.95232C1.40463 9.56503 1.0896 9.25 0.702317 9.25C0.315031 9.25 0 9.56503 0 9.95232C0 10.3396 0.315031 10.6546 0.702317 10.6546Z"
																						fill="white"
																					/>
																					<path
																						d="M17.6474 5.42232C17.428 5.20298 17.0722 5.20298 16.8528 5.42232L15.145 7.13013C14.9256 7.34954 14.9256 7.7053 15.145 7.92476C15.2548 8.03444 15.3985 8.08933 15.5423 8.08933C15.6861 8.08933 15.8299 8.03444 15.9396 7.92476L17.6474 6.21695C17.8668 5.99755 17.8668 5.64178 17.6474 5.42232Z"
																						fill="white"
																					/>
																					<path
																						d="M16.7349 9.50763C16.8446 9.6173 16.9884 9.6722 17.1322 9.6722C17.2759 9.6722 17.4198 9.6173 17.5294 9.50763L20.9451 6.09195C21.1645 5.87255 21.1645 5.51678 20.9451 5.29732C20.7257 5.07798 20.3699 5.07798 20.1505 5.29732L16.7349 8.713C16.5155 8.9324 16.5155 9.28817 16.7349 9.50763Z"
																						fill="white"
																					/>
																					<path
																						d="M24.4939 5.96492L18.6935 0.164511C18.4741 -0.0548369 18.1183 -0.0548369 17.8989 0.164511L15.8385 2.22488H8.8847C7.28269 2.22488 5.75731 2.95484 4.74766 4.19137H3.65205V3.34859C3.65205 3.03834 3.40051 2.78674 3.09019 2.78674H0.561854C0.251542 2.78674 0 3.03834 0 3.34859C0 3.65885 0.251542 3.91044 0.561854 3.91044H2.52834V11.7764H0.561854C0.251542 11.7764 0 12.028 0 12.3382C0 12.6485 0.251542 12.9001 0.561854 12.9001H3.09019C3.40051 12.9001 3.65205 12.6485 3.65205 12.3382V10.9336H4.74766C5.75731 12.1701 7.28275 12.9001 8.8847 12.9001H9.53836L13.5485 16.9103C13.6583 17.0199 13.802 17.0748 13.9458 17.0748C14.0896 17.0748 14.2334 17.0199 14.3431 16.9103L24.4939 6.75955C24.5992 6.65414 24.6585 6.51127 24.6585 6.36226C24.6585 6.21326 24.5992 6.07032 24.4939 5.96492ZM5.47751 10.0408C5.37177 9.8957 5.20299 9.80991 5.02342 9.80991H3.65205V5.31508H5.02348C5.20304 5.31508 5.37177 5.22928 5.47757 5.08416C6.26961 3.99742 7.54333 3.34859 8.88476 3.34859H14.7148L11.3814 6.68201C10.9127 6.339 10.4949 5.92166 10.1434 5.43852C9.96082 5.18759 9.60949 5.13219 9.35846 5.31474C9.10753 5.49729 9.05213 5.84867 9.23468 6.0996C10.3008 7.56502 11.8738 8.52753 13.6638 8.80981C14.0081 8.86414 14.2441 9.18838 14.1898 9.53269C14.1355 9.87694 13.8117 10.1125 13.467 10.0585C11.9118 9.81328 10.48 9.13096 9.32654 8.08541C9.09663 7.87702 8.74132 7.89444 8.53293 8.12435C8.32454 8.35426 8.34195 8.70957 8.57186 8.91796C8.67255 9.00921 8.77565 9.0972 8.87993 9.18355L7.74819 10.3152C7.64284 10.4206 7.58362 10.5635 7.58362 10.7125C7.58362 10.8615 7.64284 11.0044 7.74819 11.1098L8.3846 11.7462C7.23167 11.6069 6.17033 10.9914 5.47751 10.0408ZM13.9458 15.7184L8.93993 10.7125L9.80002 9.8525C10.8523 10.5212 12.0366 10.9705 13.2918 11.1685C13.3841 11.183 13.4757 11.1901 13.5663 11.1901C14.4149 11.19 15.1634 10.5717 15.2997 9.70765C15.4505 8.75132 14.7952 7.85061 13.8388 7.69975C13.3301 7.61952 12.8425 7.47333 12.3853 7.26724L18.2962 1.35643L23.302 6.36226L13.9458 15.7184Z"
																						fill="white"
																					/>
																					<path
																						d="M0.702317 10.6546C1.0896 10.6546 1.40463 10.3396 1.40463 9.95232C1.40463 9.56503 1.0896 9.25 0.702317 9.25C0.315031 9.25 0 9.56503 0 9.95232C0 10.3396 0.315031 10.6546 0.702317 10.6546Z"
																						fill="white"
																					/>
																					<path
																						d="M17.6474 5.42232C17.428 5.20298 17.0722 5.20298 16.8528 5.42232L15.145 7.13013C14.9256 7.34954 14.9256 7.7053 15.145 7.92476C15.2548 8.03444 15.3985 8.08933 15.5423 8.08933C15.6861 8.08933 15.8299 8.03444 15.9396 7.92476L17.6474 6.21695C17.8668 5.99755 17.8668 5.64178 17.6474 5.42232Z"
																						fill="white"
																					/>
																					<path
																						d="M16.7349 9.50763C16.8446 9.6173 16.9884 9.6722 17.1322 9.6722C17.2759 9.6722 17.4198 9.6173 17.5294 9.50763L20.9451 6.09195C21.1645 5.87255 21.1645 5.51678 20.9451 5.29732C20.7257 5.07798 20.3699 5.07798 20.1505 5.29732L16.7349 8.713C16.5155 8.9324 16.5155 9.28817 16.7349 9.50763Z"
																						fill="white"
																					/>
																					<path
																						d="M24.4939 5.96492L18.6935 0.164511C18.4741 -0.0548369 18.1183 -0.0548369 17.8989 0.164511L15.8385 2.22488H8.8847C7.28269 2.22488 5.75731 2.95484 4.74766 4.19137H3.65205V3.34859C3.65205 3.03834 3.40051 2.78674 3.09019 2.78674H0.561854C0.251542 2.78674 0 3.03834 0 3.34859C0 3.65885 0.251542 3.91044 0.561854 3.91044H2.52834V11.7764H0.561854C0.251542 11.7764 0 12.028 0 12.3382C0 12.6485 0.251542 12.9001 0.561854 12.9001H3.09019C3.40051 12.9001 3.65205 12.6485 3.65205 12.3382V10.9336H4.74766C5.75731 12.1701 7.28275 12.9001 8.8847 12.9001H9.53836L13.5485 16.9103C13.6583 17.0199 13.802 17.0748 13.9458 17.0748C14.0896 17.0748 14.2334 17.0199 14.3431 16.9103L24.4939 6.75955C24.5992 6.65414 24.6585 6.51127 24.6585 6.36226C24.6585 6.21326 24.5992 6.07032 24.4939 5.96492ZM5.47751 10.0408C5.37177 9.8957 5.20299 9.80991 5.02342 9.80991H3.65205V5.31508H5.02348C5.20304 5.31508 5.37177 5.22928 5.47757 5.08416C6.26961 3.99742 7.54333 3.34859 8.88476 3.34859H14.7148L11.3814 6.68201C10.9127 6.339 10.4949 5.92166 10.1434 5.43852C9.96082 5.18759 9.60949 5.13219 9.35846 5.31474C9.10753 5.49729 9.05213 5.84867 9.23468 6.0996C10.3008 7.56502 11.8738 8.52753 13.6638 8.80981C14.0081 8.86414 14.2441 9.18838 14.1898 9.53269C14.1355 9.87694 13.8117 10.1125 13.467 10.0585C11.9118 9.81328 10.48 9.13096 9.32654 8.08541C9.09663 7.87702 8.74132 7.89444 8.53293 8.12435C8.32454 8.35426 8.34195 8.70957 8.57186 8.91796C8.67255 9.00921 8.77565 9.0972 8.87993 9.18355L7.74819 10.3152C7.64284 10.4206 7.58362 10.5635 7.58362 10.7125C7.58362 10.8615 7.64284 11.0044 7.74819 11.1098L8.3846 11.7462C7.23167 11.6069 6.17033 10.9914 5.47751 10.0408ZM13.9458 15.7184L8.93993 10.7125L9.80002 9.8525C10.8523 10.5212 12.0366 10.9705 13.2918 11.1685C13.3841 11.183 13.4757 11.1901 13.5663 11.1901C14.4149 11.19 15.1634 10.5717 15.2997 9.70765C15.4505 8.75132 14.7952 7.85061 13.8388 7.69975C13.3301 7.61952 12.8425 7.47333 12.3853 7.26724L18.2962 1.35643L23.302 6.36226L13.9458 15.7184Z"
																						fill="white"
																					/>
																				</svg>
																				<span className="pl-2">Issue</span>
																			</Button>
																		</div>
																	</Form>
																)}
															</Formik>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="flex justify-center items-center">
										<EmptyListMessage
											message="Select Schema and Credential Definition"
											description="Get started by selecting schema and credential definition"
										/>
									</div>
								)}
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailIssuance;
