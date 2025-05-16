'use client'
import * as Yup from 'yup';
import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { apiStatusCodes, CREDENTIAL_CONTEXT_VALUE, itemPerPage, proofPurpose } from '@/config/CommonConstant';
import { IAttributes, ICredentials, IEmailCredentialData, IIssueAttributes, ITransformedData } from '../../connectionIssuance/type/Issuance';
import { CredentialType, DidMethod, Features, ProofType, SchemaTypes, SchemaTypeValue } from '@/common/enums';
import { GetAllSchemaListParameter } from '../../connectionIssuance/type/SchemaCard';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { useAppSelector } from '@/lib/hooks';
import { getOrganizationById } from '@/app/api/organization';
import { getSchemaCredDef } from '@/app/api/BulkIssuance';
import { AxiosResponse } from 'axios';
import { getAllSchemas } from '@/app/api/schema';
import { issueOobEmailCredential } from '@/app/api/Issuance';
import { pathRoutes } from '@/config/pathRoutes';
import { SelectRef } from '../../bulkIssuance/components/BulkIssuance';
import Create from '@/features/schemas/components/Create';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertComponent } from '@/components/AlertComponent';
import RoleViewButton from '@/components/RoleViewButton';
import { Card } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ShadCnSelect';
import Loader from '@/components/Loader';
import { Field, FieldArray, Form, Formik } from 'formik';
import IssuancePopup from '../../bulkIssuance/components/IssuancePopup';
import { EmptyListMessage } from '@/components/EmptyListComponent';
import PageContainer from '@/components/layout/page-container';
// import { pathRoutes } from '../../config/pathRoutes';
// import BreadCrumbs from '../BreadCrumbs';
// import BackButton from '../../commonComponents/backbutton';
// import { Button, Card } from 'flowbite-react';
// import Select, { type SingleValue } from 'react-select';
// import { AlertComponent } from '../AlertComponent';
// import IssuancePopup from './IssuancePopup';
// import type { AxiosResponse } from 'axios';
// import { getFromLocalStorage } from '../../api/Auth';
// import { getSchemaCredDef } from '../../api/BulkIssuance';
// import { storageKeys, apiStatusCodes, CREDENTIAL_CONTEXT_VALUE, proofPurpose, itemPerPage } from '../../config/CommonConstant';
// import type { IAttributes, ICredentials, IEmailCredentialData, IIssueAttributes, ITransformedData } from './interface';
// import { Field, FieldArray, Form, Formik } from 'formik';
// import CustomSpinner from '../CustomSpinner';
// import { issueOobEmailCredential } from '../../api/issuance';
// import { EmptyListMessage } from '../EmptyListComponent';
// import ResetPopup from './ResetPopup';
// import type { SelectRef } from './BulkIssuance';
// import RoleViewButton from '../RoleViewButton';
// import { Features } from '../../utils/enums/features';
// import { Create } from './Constant';
// import { DidMethod, SchemaTypes, CredentialType, SchemaTypeValue, ProofType, SchemaType, DataType } from '../../common/enums';
// import { getAllSchemas } from '../../api/Schema';
// import type { GetAllSchemaListParameter } from '../Resources/Schema/interfaces';

const EmailIssuance = () => {
	const [formData, setFormData] = useState();
	const [userData, setUserData] = useState();
	const [loading, setLoading] = useState<boolean>(true);
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [credentialSelected, setCredentialSelected] = useState<ICredentials | null>(

	);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [batchName, setBatchName] = useState('');
	const [openResetModal, setOpenResetModal] = useState<boolean>(false);
	const [attributes, setAttributes] = useState<IAttributes[]>([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [issueLoader, setIssueLoader] = useState(false);
	const inputRef = useRef(null);
	const [mounted, setMounted] = useState<boolean>(false)
	const [schemaType, setSchemaType] = useState<SchemaTypes>();
	const [credentialType, setCredentialType] = useState<CredentialType>();
	const [credDefId, setCredDefId] = useState<string>();
	const [schemasIdentifier, setSchemasIdentifier] = useState<string>();
	const [schemaTypeValue, setSchemaTypeValue] = useState<SchemaTypeValue>();
	const [isAllSchemaFlagSelected, setIsAllSchemaFlagSelected] = useState<boolean>();
	const [searchValue, setSearchValue] = useState('');
	const router = useRouter()
	const orgId = useAppSelector((state: RootState) => state.organization.orgId)

	const handleInputChange = (inputValue: string) => {
		setSearchValue(inputValue);
		setSchemaListAPIParameter(prevParams => {
			const updatedParams = {
				...prevParams,
				allSearch: inputValue,
			};
			getSchemaCredentials(updatedParams);
			return updatedParams;
		});
	};

	const getSchemaCredentials = async (schemaListAPIParameter: GetAllSchemaListParameter) => {

		try {
			let orgDid = ''
			let ledgerId = ''

			const response = await getOrganizationById(orgId)

			console.log("response", response)

			if (typeof response === 'string') {
				// handle the error message
				console.error('Error fetching organization:', response);
			} else {
				const { data } = response;
				orgDid = data?.data?.org_agents[0]?.orgDid
				ledgerId = data.data.org_agents[0].ledgers.id
				// proceed with data
			}

			const allSchemaSelectedFlag = `false`
			if (allSchemaSelectedFlag === `false` || !allSchemaSelectedFlag) {
				setIsAllSchemaFlagSelected(false)
			}
			else if (allSchemaSelectedFlag === 'true') {
				setIsAllSchemaFlagSelected(true)
			}
			let currentSchemaType = schemaType;
			if (orgDid?.includes(DidMethod.POLYGON)) {
				currentSchemaType = SchemaTypes.schema_W3C;
				setSchemaTypeValue(SchemaTypeValue.POLYGON)
				setCredentialType(CredentialType.JSONLD)

			} else if (orgDid?.includes(DidMethod.KEY) || orgDid?.includes(DidMethod.WEB)) {
				currentSchemaType = SchemaTypes.schema_W3C;
				setSchemaTypeValue(SchemaTypeValue.NO_LEDGER)

				setCredentialType(CredentialType.JSONLD)
			}
			else if (orgDid?.includes(DidMethod.INDY)) {
				setCredentialType(CredentialType.INDY)
				currentSchemaType = SchemaTypes.schema_INDY;
			}
			setSchemaType(currentSchemaType);

			let options;

			//FIXME:  Logic of API call as per schema selection
			if ((currentSchemaType === SchemaTypes.schema_INDY && orgId
			) || (currentSchemaType === SchemaTypes.schema_W3C && isAllSchemaFlagSelected === false)) {
				const response = await getSchemaCredDef(currentSchemaType, orgId);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefs = data.data;

					options = credentialDefs.map(({
						schemaName,
						schemaVersion,
						credentialDefinition,
						credentialDefinitionId,
						schemaIdentifier,
						schemaAttributes
					}: ICredentials, id: number) => ({
						value: schemaType === SchemaTypes.schema_INDY ? credentialDefinitionId : schemaVersion,
						label: `${schemaName} [${schemaVersion}]${currentSchemaType === SchemaTypes.schema_INDY ? ` - (${credentialDefinition})` : ''}`,
						schemaName: schemaName,
						schemaVersion: schemaVersion,
						credentialDefinition: credentialDefinition,
						schemaIdentifier: schemaIdentifier,
						credentialDefinitionId: credentialDefinitionId,
						id: id,
						schemaAttributes:
							schemaAttributes &&
							typeof schemaAttributes === 'string' &&
							JSON.parse(schemaAttributes),
					}));

					setCredentialOptions(options);
				} else {
					setSuccess(null);
					setFailure(null);
				}
				setLoading(false);
			}

			//FIXME:  Logic of API call as per schema selection
			else if ((currentSchemaType === SchemaTypes.schema_W3C) && (orgId) && (allSchemaSelectedFlag)) {
				const response = await getAllSchemas(schemaListAPIParameter, currentSchemaType, orgId);
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefs = data.data.data;
					options = credentialDefs.map(({
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
					setCredentialOptions(options);
				} else {
					setSuccess(null);
					setFailure(null);
				}
				setLoading(false);
			}


			setCredentialOptions(options);
		} catch (error) {
			setSuccess(null);
			setFailure(null);
		}
	};


	const handleSelectChange = (newValue: SingleValue<ICredentials> | null) => {
		const value = newValue as ICredentials | null;
		setBatchName(value?.label ?? '');
		if (schemaType === SchemaTypes.schema_INDY) {
			setCredDefId(value?.credentialDefinitionId);
			setCredentialSelected(value ?? null);
		} else if (schemaType === SchemaTypes.schema_W3C) {
			setCredentialSelected(value ?? null);
			setSchemasIdentifier(value?.schemaIdentifier);
		}
		setAttributes(value?.schemaAttributes ?? value?.attributes ?? []);
	};


	useEffect(() => {

		setMounted(true);
	}, []);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	useEffect(() => {
		getSchemaCredentials(schemaListAPIParameter);
	}, [isAllSchemaFlagSelected]);

	const confirmOOBCredentialIssuance = async () => {
		setIssueLoader(true);

		const existingData = userData;


		let transformedData: ITransformedData = { credentialOffer: [] };

		if (existingData && existingData.formData) {
			if (schemaType === SchemaTypes.schema_INDY) {
				existingData.formData.forEach((entry: { email: string; attributes: IIssueAttributes[] }) => {

					const transformedEntry = { emailId: entry.email, attributes: [] };
					entry.attributes.forEach((attribute) => {
						const transformedAttribute = {
							value: String(attribute.value || ''),
							name: attribute.name || '',
							isRequired: attribute.isRequired,
						};
						transformedEntry.attributes.push(transformedAttribute);
					});
					transformedData.credentialOffer.push(transformedEntry);
				});
				transformedData.credentialDefinitionId = credDefId;
				transformedData.isReuseConnection = true;

			} else if (schemaType === SchemaTypes.schema_W3C) {

				existingData.formData.forEach((entry: { email: string; credentialData: IEmailCredentialData; attributes: IIssueAttributes[] }) => {
					const credentialOffer = {
						emailId: entry.email,
						credential: {
							"@context": [
								CREDENTIAL_CONTEXT_VALUE,
								schemasIdentifier
							],
							"type": [
								"VerifiableCredential",
								credentialSelected?.schemaName
							],
							"issuer": {
								"id": orgId
							},
							"issuanceDate": new Date().toISOString(),

							//FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
							credentialSubject: entry?.attributes?.reduce((acc, attr) => {
								if (attr.schemaDataType === 'number' && (attr.value === '' || attr.value === null)) {
									acc[attr.name] = 0;
								} else if (attr.schemaDataType === 'string' && attr.value === '') {
									acc[attr.name] = '';
								} else if (attr.value !== null) {
									acc[attr.name] = attr.value;
								}
								return acc;
							}, {}),
						},
						options: {
							proofType: schemaTypeValue === SchemaTypeValue.POLYGON ? ProofType.polygon : ProofType.no_ledger,
							proofPurpose: proofPurpose
						}
					};

					transformedData.credentialOffer.push(credentialOffer);
				});

				transformedData.protocolVersion = "v2";
				transformedData.isReuseConnection = true;
				transformedData.credentialType = CredentialType.JSONLD;
			}


			const transformedJson = JSON.stringify(transformedData, null, 2);
			const response = await issueOobEmailCredential(transformedJson, credentialType, orgId);
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
					setFailure(data?.message);
					setLoading(false);
					setIssueLoader(false);
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
			attributes: attributes?.map((item: IAttributes) => {
				return {
					...item,
					value: '',
					name: item?.attributeName,
					isRequired: item?.isRequired,
				};
			}),
		};

		console.log("init form data", initFormData)
		setFormData({ formData: [initFormData] });
	}, [attributes]);

	const isCredSelected = Boolean(credentialSelected);

	const selectInputRef = React.useRef<SelectRef | null>(null);

	const handleReset = () => {
		setCredentialSelected(null);
		setBatchName('');
		setOpenResetModal(false);
		if (selectInputRef.current) {
			selectInputRef.current.clearValue();
		}
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

	const handleSelect = (value) => {
		console.log("value")
		handleSelectChange(value)
	}

	const createSchemaTitle = { title: 'Create Schema', svg: <Create /> };

	return (
		<PageContainer>
			<div className="px-4 pt-2">
				<div className="col-span-full mb-3">
					<div className="flex justify-end items-center">
						<Button onClick={() => router.push(pathRoutes.organizations.Issuance.issue)}>
							<ArrowLeft /> Back
						</Button>
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
						<RoleViewButton
							buttonTitle={createSchemaTitle.title}
							feature={Features.CRETAE_SCHEMA}
							svgComponent={<Plus />}
							onClickEvent={() => {
								window.location.href = `${pathRoutes.organizations.createSchema}`;
							}}
						/>
					</div>
					<div className="flex flex-col justify-between gap-4 email-bulk-issuance">
						<Card className='p-5 py-10'>
							<div className="md:min-h-[10rem]">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-[980px]">
									<div className="flex flex-col justify-between">
										<div className="text-primary-900">
											{
												// mounted ?
												<SearchableSelect className='max-w-lg border-2 border-primary'
													options={credentialOptions}
													value={''}
													onValueChange={handleSelect}
													placeholder="Select Schema Credential Definition" />
												// <Select
												// 	placeholder="Select Schema-Credential definition"
												// 	className="basic-single"
												// 	classNamePrefix="select"
												// 	isDisabled={false}
												// 	isClearable={true}
												// 	isRtl={false}
												// 	isSearchable={true}
												// 	id="long-value-select"
												// 	instanceId="long-value-select"
												// 	name="color"
												// 	options={credentialOptions?.map((option) => ({
												// 		...option,
												// 		isDisabled: (option.schemaAttributes || option.attributes || []).some(attr => attr.schemaDataType === DataType.ARRAY || attr.schemaDataType === DataType.OBJECT)
												// 	}))}
												// 	onInputChange={handleInputChange}
												// 	onChange={handleSelectChange}
												// 	value={credentialOptions?.find((option) => option.value === searchValue)}
												// 	ref={selectInputRef}
												// 	styles={{
												// 		control: (base, state) => ({
												// 			...base,
												// 			border: state.isFocused ? '2px solid #CE9200' : '1px solid #9CA3AF',
												// 			boxShadow: state.isFocused ? '0 0 2px rgba(79, 70, 229, 0.5)' : 'none',
												// 			'&:hover': {
												// 				border: '2px solid #CE9200'
												// 			}
												// 		}),
												// 		menu: (base) => ({
												// 			...base,
												// 			backgroundColor: '#FEEFCC'
												// 		}),
												// 		option: (base, { isFocused, isSelected, isDisabled }) => ({
												// 			...base,
												// 			backgroundColor: isDisabled ? '#E5E7EB' : isSelected ? 'white' : isFocused ? '#FEEFCC' : 'white',
												// 			color: isDisabled ? '#9CA3AF' : isSelected ? '#CE9200' : 'black',
												// 			cursor: isDisabled ? 'not-allowed' : 'pointer',
												// 			'&:hover': {
												// 				backgroundColor: isDisabled ? '#E5E7EB' : '#FEEFCC'
												// 			}
												// 		})
												// 	}}
												// />

												// :
												// null
											}
										</div>

										<div className="mt-4">
											{credentialSelected &&

												(
													<Card className="max-w-[30rem] p-5 ">
														<div>
															<p className="text-black dark:text-white pb-2">
																<span className="font-semibold">Schema: </span>
																{credentialSelected?.schemaName || ''}{' '}
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
															<span className="text-black dark:text-white font-semibold">
																Attributes:
															</span>

															<div className="flex flex-wrap overflow-hidden">
																{
																	attributes?.map((element: IAttributes) => (
																		<div key={element.attributeName} className="truncate">
																			<span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
																				{element.attributeName}
																			</span>
																		</div>
																	))
																}
															</div>
														</div>
													</Card>
												)}


										</div>
									</div>
								</div>
							</div>
						</Card>
						<div>
							<Card className='py-10 p-5'>
								<div>
									<div className="flex justify-between mb-4 items-center ml-1">
										<div>
											<p className="text-xl font-semibold dark:text-white">
												Issue Credential(s) to the email
											</p>
											<span className="text-sm text-gray-400">
												Please enter an email address to issue the credential to
											</span>
										</div>
									</div>
									{isCredSelected ? (
										<div>
											<div className="flex flex-col justify-between">
												{loading ? (
													<div className="flex items-center justify-center mb-4">
														<Loader />
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
																					Yup.lazy((value) =>
																						Yup.object().shape({
																							value: value.isRequired
																								? Yup.string().required(
																									'This field is required',
																								)
																								: Yup.string(),
																						}),
																					),
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
																		<Form
																			onSubmit={formikHandlers.handleSubmit}
																		>
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
																																Email ID{' '}
																																<span className="text-red-500">
																																	*
																																</span>
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
																																{formikHandlers
																																	?.touched
																																	?.formData &&
																																	formikHandlers
																																		?.touched
																																		?.formData[
																																		index
																																	]?.email &&
																																	formikHandlers
																																		?.errors
																																		?.formData &&
																																	formikHandlers
																																		?.errors
																																		?.formData[
																																		index
																																	]?.email && (
																																		<label
																																			style={{
																																				color:
																																					'red',
																																			}}
																																			className="text-sm"
																																		>
																																			{
																																				formikHandlers
																																					?.errors
																																					?.formData[
																																					index
																																				]?.email
																																			}
																																		</label>
																																	)}
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
																														Credential data:
																													</label>
																													<div className="grid md:grid-cols-2 grid-cols-1 gap-8 w-full gap-2">
																														{formData1.attributes &&
																															formData1
																																?.attributes
																																.length > 0 &&
																															formData1?.attributes.map(
																																(
																																	item: {
																																		isRequired: boolean;
																																		displayName:
																																		| ReactNode
																																		| string;
																																		attributeName:
																																		| ReactNode
																																		| string;
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
																																	attIndex: number,
																																) => (
																																	<div
																																		className="mt-3"
																																		key={
																																			attIndex
																																		}
																																	>
																																		<div className="relative flex items-center w-full gap-2">
																																			<label className="text-base dark:text-white text-gray-800 w-[300px] word-break-word">
																																				{
																																					item?.displayName
																																				}
																																				{item.isRequired && (
																																					<span className="text-red-500">
																																						*
																																					</span>
																																				)}
																																			</label>
																																			<div className="w-8/12">
																																				<Field
																																					type={
																																						item.schemaDataType
																																					}
																																					placeholder={
																																						item.name
																																					}
																																					name={`formData[${index}].attributes.${attIndex}.value`}
																																					className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-md rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																																				/>
																																				{formikHandlers
																																					?.touched
																																					?.formData &&
																																					formikHandlers
																																						?.touched
																																						?.formData[
																																						index
																																					]
																																						?.attributes &&
																																					formikHandlers
																																						?.touched
																																						?.formData[
																																						index
																																					]
																																						?.attributes[
																																						attIndex
																																					]
																																						?.value &&
																																					formikHandlers
																																						?.errors
																																						?.formData &&
																																					formikHandlers
																																						?.errors
																																						?.formData[
																																						index
																																					]
																																						?.attributes &&
																																					formikHandlers
																																						?.errors
																																						?.formData[
																																						index
																																					]
																																						?.attributes[
																																						attIndex
																																					]
																																						?.value && (
																																						<label className="text-xs text-red-500 absolute">
																																							{
																																								formikHandlers
																																									?.errors
																																									?.formData[
																																									index
																																								]
																																									?.attributes[
																																									attIndex
																																								]
																																									?.value
																																							}
																																						</label>
																																					)}
																																			</div>
																																		</div>
																																	</div>
																																),
																															)}
																													</div>
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
																												(item: IAttributes) => {
																													return {
																														attributeName:
																															item.attributeName,
																														schemaDataType:
																															item.schemaDataType,
																														displayName:
																															item.displayName,
																														value: '',
																														name: item.attributeName,
																														isRequired:
																															item.isRequired,
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


																									className='border-ring hover:bg-primary flex items-center rounded-xl border px-4 py-2 transition-colors disabled:cursor-not-allowed'
																									variant={'ghost'}
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
																										strokeWidth="1.5"
																										stroke="currentColor"
																										className="w-6 h-6"
																									>
																										<path
																											strokeLinecap="round"
																											strokeLinejoin="round"
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
																			{/*<ResetPopup
																			openModal={openResetModal}
																			closeModal={handleResetCloseConfirmation}
																			isProcessing={issueLoader}
																			onSuccess={handleReset}
																		/>*/}
																			<div className="flex justify-end gap-4">
																				<Button
																					type="button"
																					disabled={loading}
																					variant={'ghost'}
																					className="border-ring hover:bg-primary flex items-center rounded-xl border px-4 py-2 transition-colors disabled:cursor-not-allowed "
																					onClick={handleResetOpenConfirmation}
																				>
																					<svg
																						xmlns="http://www.w3.org/2000/svg"
																						className="mr-2 dark:text-custom-100 dark:group-hover:text-custom-900"
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
																					className=""
																					disabled={!formikHandlers?.isValid}
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
																					<span className="pl-2 text-custom-900">Issue</span>
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
		</PageContainer>
	);
};

export default EmailIssuance;
