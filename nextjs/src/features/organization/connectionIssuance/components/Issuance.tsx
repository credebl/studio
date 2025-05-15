'use client'

import * as Yup from 'yup';

import { ArrowLeft, CircleArrowRight } from 'lucide-react';
import { CREDENTIAL_CONTEXT_VALUE, apiStatusCodes, itemPerPage, proofPurpose, storageKeys } from '@/config/CommonConstant';
import { Card, CardContent } from '@/components/ui/card';
import { CredentialType, DidMethod, ProofType, SchemaType, SchemaTypeValue, SchemaTypes } from '@/common/enums';
import type {
	DataTypeAttributes,
	IAttribute,
	ICredentialdata,
	ICredentials,
	IssuanceFormPayload,
	SchemaDetails,
	SelectedUsers,
	W3cSchemaDetails,
} from '../type/Issuance';
import { Field, FieldArray, Form, Formik, FormikErrors, FormikTouched } from 'formik';
import { setSelectedConnection, setSelectedUser } from '@/lib/storageKeys';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { AlertComponent } from '@/components/AlertComponent';
import type { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import { EmptyListMessage } from '@/components/EmptyListComponent';
import Loader from '@/components/Loader';
import { Option } from '../type/Issuance';
import React from 'react';
import { RootState } from '@/lib/store';
import { SearchableSelect } from '@/components/ShadCnSelect';
import SummaryCard from '@/components/SummaryCard';
import SummaryCardW3c from '@/components/SummaryCardW3c';
import { getOrganizationById } from '@/app/api/organization';
import { getSchemaCredDef } from '@/app/api/schema';
import { issueCredential } from '@/app/api/Issuance';
import { pathRoutes } from '@/config/pathRoutes';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';

const IssueCred = () => {
	const [schemaLoader, setSchemaLoader] = useState<boolean>(true);
	const [userLoader, setUserLoader] = useState<boolean>(true);
	const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>({
		schemaName: '',
		version: '',
		schemaId: '',
		credDefId: '',
	});
	const [w3cSchemaDetails, setW3CSchemaDetails] = useState<W3cSchemaDetails>({
		schemaName: '',
		version: '',
		schemaId: '',
		w3cAttributes: [],
		issuerDid: ''
	});
	const [issuanceFormPayload, setIssuanceFormPayload] = useState<
		IssuanceFormPayload
	>({
		credentialData: [],
		orgId: ""
	  });
	const [issuanceLoader, setIssuanceLoader] = useState<boolean>(false);
	const [failure, setFailure] = useState<string | null>(null);
	const [schemaAttributesDetails, setSchemaAttributesDetails] = useState<
		IAttribute[]
	>([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [w3cSchema, setW3CSchema] = useState<boolean>(false);
	const [credentialType, setCredentialType] = useState<CredentialType>();
	const [schemaType, setSchemaType] = useState<SchemaTypeValue>();
	const [orgDid, setOrgDid] = useState<string>('');
	const orgId = useSelector((state: RootState) => state.organization.orgId)
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [searchValue, setSearchValue] = useState('');
	const [selectedValue, setSelectedValue] = useState<string>("")
	const [selectedAttribute, setSelectedAttribute] = useState<string>("")
	const selectedUser = useSelector((state: RootState) => state.storageKeys.SELECTED_USER)
	const router = useRouter()
	const dispatch = useDispatch()

	useEffect(() => {
		if (!w3cSchema && schemaDetails.schemaId && schemaDetails.credDefId) {
			getSchemaAndUsers(w3cSchema)
		}else if(w3cSchema && schemaDetails.schemaName && schemaDetails.schemaAttributes){
			getSchemaAndUsers(w3cSchema)
		}
	}, [schemaDetails])

	useEffect(() => {
		const execute = async () => {
			const response = await fetchOrganizationDetails();
			if (response !== null) {
				const schemaValue = response ? SchemaTypes.schema_W3C : SchemaTypes.schema_INDY
				const credentials = await getSchemaCredDef(schemaValue, orgId) as AxiosResponse;
				setCredentialOptions(credentials.data.data.map((value:ICredentials, index:number) => {
					return { schemaVersion: value.schemaVersion, "value": index, "label": value.schemaCredDefName, "id": value.schemaAttributes, schemaId: response?value.schemaIdentifier:value.schemaLedgerId, credentialId: value.credentialDefinitionId, schemaName: value.schemaName }
				}))
			}
		}
		execute()
		return () => setUserLoader(false);
	}, []);


	const fetchOrganizationDetails = async (): Promise<boolean | null> => {
		try {
			if (!orgId) return null;
			const response = await getOrganizationById(orgId);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const did = data?.data?.org_agents?.[0]?.orgDid;



				if (did?.includes(DidMethod.POLYGON)) {
					setW3CSchema(true);
					setCredentialType(CredentialType.JSONLD);
					setSchemaType(SchemaTypeValue.POLYGON)
					setOrgDid(did);
					return true
				}
				else if (did?.includes(DidMethod.KEY) || did?.includes(DidMethod.WEB)) {
					setW3CSchema(true);
					setSchemaType(SchemaTypeValue.NO_LEDGER)
					setCredentialType(CredentialType.JSONLD);
					setOrgDid(did);
					return true
				}
				else if (did?.includes(DidMethod.INDY)) {
					setW3CSchema(false);
					setSchemaType(SchemaTypeValue.INDY)
					setCredentialType(CredentialType.INDY);
					return false
				}
			}
		} catch (error) {
			console.log('Error in getSchemaAndUsers:', error);
			setFailure('Error fetching schema and users');
		}

		return null
	};
	const getSchemaAndUsers = async (w3cSchema: boolean) => {
		try {
			if (!w3cSchema) {
				const credDefId = schemaDetails.credDefId
				const schemaId = schemaDetails.schemaId

				// createSchemaPayload(schemaId, credDefId);
				setUserLoader(true);
				const selectedUsers = selectedUser || [] 
				const attributes = schemaDetails.schemaAttributes || []
				if (attributes && attributes?.length) {
					createIssuanceForm(selectedUsers, attributes, credDefId, orgId);
				} else {
					setFailure('Attributes are not available');
				}
			}
			if (w3cSchema) {
				const getW3cSchemaDetails = schemaDetails.schemaAttributes || '[]'

				const schemaId = schemaDetails.schemaId

				setUserLoader(true);
				const selectedUsers = selectedUser || []

				const attributes = schemaDetails.schemaAttributes || []

				if (attributes && attributes?.length) {
					createW3cIssuanceForm(selectedUsers, attributes, orgId);
				} else {
					setFailure('Attributes are not available');
				}
			}
		} catch (error) {
			console.error('Error in getSchemaAndUsers:', error);
			setFailure('Error fetching schema and users');
		}
	};

	const createIssuanceForm = (
		selectedUsers: SelectedUsers[],
		attributes: DataTypeAttributes[],
		credDefId: string,
		orgId: string,
	) => {
		const credentialData = selectedUsers.map((user) => {
			const attributesArray = attributes.map((attr) => ({
				name: attr.attributeName,
				value: '',
				dataType: attr?.schemaDataType,
				isRequired: attr.isRequired,
			}));

			return {
				connectionId: user.connectionId,
				attributes: attributesArray,
			};
		});

		const issuancePayload = {
			credentialData,
			credentialDefinitionId: credDefId,
			orgId,
		};

		setIssuanceFormPayload(issuancePayload);
		setUserLoader(false);
	};

	const createW3cIssuanceForm = (
		selectedUsers: SelectedUsers[],
		attributes: DataTypeAttributes[],
		orgId: string,
	) => {
		const credentialData = selectedUsers.map((user) => {

			const attributesArray =  attributes.length > 0
			? attributes.map((attr) => ({
				name: attr.attributeName,
				value: '',
				dataType: attr?.schemaDataType,
				isRequired: attr.isRequired,
			  }))
			: [];

			return {
				connectionId: user.connectionId,
				attributes: attributesArray,
			};
		});

		const issuancePayload = {
			credentialData,
			orgId,
		};

		setIssuanceFormPayload(issuancePayload);
		setUserLoader(false);
	};

	const createAttributeValidationSchema = (
		name: string,
		value: string,
		isRequired: boolean,
	) => {
		let attributeSchema = Yup.string();
		let requiredData;
		if (name) {
			requiredData = name
				.split('_')
				.map((item) => item.charAt(0).toUpperCase() + item.slice(1))
				.join(' ');
		}

		if (isRequired) {
			if (!value) {
				attributeSchema = Yup.string().required(`${requiredData} is required`);
			}
		}

		return Yup.object().shape({
			value: attributeSchema,
		});
	};

	const validationSchema = Yup.object().shape({
		credentialData: Yup.array().of(
			Yup.object().shape({
				attributes: Yup.array().of(
					Yup.lazy((attr) => {
						return createAttributeValidationSchema(
							attr?.name,
							attr?.value,
							attr?.isRequired,
						);
					}),
				),
			}),
		),
	});


	const handleSubmit = async (values: IssuanceFormPayload) => {

		let issuancePayload;

		if (!w3cSchema) {
			issuancePayload = {
				credentialData: values.credentialData.map((item) => {
					return {
						...item,
						attributes: item?.attributes?.map((attr) => ({
							name: attr.name,
							value: attr.value.toString(),
						})),
					};
				}),

				credentialDefinitionId: values.credentialDefinitionId,
				orgId: values.orgId,
			};
		}
		if (w3cSchema) {
			issuancePayload = {
				credentialData: values?.credentialData.map((item) => {
					return {
						connectionId: item.connectionId,
						credential: {
							"@context": [
								CREDENTIAL_CONTEXT_VALUE,
								schemaDetails.schemaId
							],
							"type": [
								"VerifiableCredential",
								schemaDetails.schemaName
							],
							issuer: {
								"id": orgDid
							},
							issuanceDate: new Date().toISOString(),
							//FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
							credentialSubject: item?.attributes?.reduce((acc, attr) => {
								if (attr.dataType === 'number' && (attr.value === '' || attr.value === null)) {
								  return { ...acc, [attr.name]: 0 };
								} else if (attr.dataType === 'string' && attr.value === '') {
								  return { ...acc, [attr.name]: '' };
								} else if (attr.value !== null) {
								  return { ...acc, [attr.name]: attr.value };
								}
								return acc;
							  }, {} as Record<string, string | number | boolean | null>)
						},

						options: {
							proofType: schemaType === SchemaTypeValue.POLYGON ? ProofType.polygon : ProofType.no_ledger,
							proofPurpose: proofPurpose
						}
					};
				}),
				orgId: values.orgId,
			};

		}

		const convertedAttributesValues = {
			...issuancePayload,
		};

		setIssuanceLoader(true);
		const schemaTypeValue = w3cSchema?CredentialType.JSONLD:CredentialType.INDY
		const issueCredRes = await issueCredential(convertedAttributesValues, schemaTypeValue, orgId);
			

		const { data } = issueCredRes as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setSuccess(data?.message);
			router.push(pathRoutes.organizations.issuedCredentials)
			dispatch(setSelectedConnection([]))
			dispatch(setSelectedUser([]))
		} else {
			setFailure(issueCredRes as string);
			setIssuanceLoader(false);
		}
	};

	const handleSelect = (value:Option) => {
		const data = JSON.parse(value.id)
		setSchemaDetails({
			schemaName: value.schemaName,
			version: value.schemaVersion,
			schemaId: value.schemaId,
			credDefId: value.credentialId,
			schemaAttributes: data
		})
	}

	function showErrors(
		errors: FormikErrors<{
			userName?: string;
			credentialData: ICredentialdata[];
			credentialDefinitionId?: string;
			orgId: string;
		}>,
		touched: FormikTouched<{
			userName?: string;
			credentialData: ICredentialdata[];
			credentialDefinitionId?: string;
			orgId: string;
		}>,
		index: number,
		attrIndex: number
	  ) {
		const attrErrors = errors?.credentialData?.[index];
		const attrTouched = touched?.credentialData?.[index];
	  
		const error = typeof attrErrors === 'object' && Array.isArray(attrErrors.attributes)
		  ? attrErrors.attributes[attrIndex]?.value
		  : undefined;
	  
		const touchedField = typeof attrTouched === 'object' && Array.isArray(attrTouched.attributes)
		  ? attrTouched.attributes[attrIndex]?.value
		  : undefined;
	  
	  
		  if (error && touchedField) {
			return (
			  <div className="text-red-500 absolute text-xs break-words">
				{error}
			  </div>
			);
		  }
	  
		return null;
	  }

	return (
		
		<PageContainer>
			<div className="px-4 pt-2">
				<div className="mb-4 col-span-full xl:mb-2">
					<div className="flex justify-end items-center px-4">
						<Button onClick={() => router.push(pathRoutes.back.issuance.connections)}><ArrowLeft />Back</Button>
					</div>
					<AlertComponent
						message={success ?? error}
						type={success ? 'success' : 'failure'}
						onAlertClose={() => {
							setError(null);
							setSuccess(null);
						}}
					/>
					<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						Issuance
					</h1>
				</div>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-4'>
						<p className="text-xl pb-6 font-semibold dark:text-white">
							Select Schema and credential definition
						</p>
						{/*<CustomSelect credentialOptions={credentialOptions} />*/}
						<SearchableSelect className='max-w-lg border-2 border-primary'
							options={credentialOptions}
							value={selectedValue}
							onValueChange={handleSelect}
							placeholder="Select Schema Credential Definition" />
						{schemaDetails.schemaId &&
							<>
								{w3cSchema ?
									<SummaryCardW3c
										schemaName={schemaDetails.schemaName}
										schemaId={schemaDetails.schemaId}
										version={schemaDetails.version}
										hideCredDefId={false}
										schemaAttributes={schemaDetails.schemaAttributes}
									/>
									:
									<SummaryCard
										schemaName={schemaDetails.schemaName}
										schemaId={schemaDetails.schemaId}
										version={schemaDetails.version}
										credDefId={schemaDetails.credDefId}
										hideCredDefId={false}

									/>
								}
							</>
						}
					</CardContent>
				</Card>

				{schemaDetails.schemaAttributes ?
					<>
						{userLoader ? (
							<div className="flex items-center justify-center mb-4">
								<Loader />
							</div>
						) : (
							
								<div className="mt-6 p-4 bg-white border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 gap-6">
									<Formik
										initialValues={{
											...issuanceFormPayload,
										}}
										validationSchema={validationSchema}
										onSubmit={handleSubmit}
										enableReinitialize={true} // ✅ Add this
									>
										{({ values, errors, touched }) => (
											<Form>
												{failure && (
													<div className="pt-1 pb-1">
														<AlertComponent
															message={failure}
															type={'failure'}
															onAlertClose={() => {
																setError(null);
																setSuccess(null);
																setFailure(null)
															}}
														/>
													</div>
												)}
												<FieldArray name="credentialData">
													{(arrayHelpers) => {

														return <>
															{values?.credentialData?.length > 0 && values?.credentialData?.map((user, index) => {
																const attributes = w3cSchema ? issuanceFormPayload?.credentialData?.[0].attributes : user?.attributes;

																return (
																	<div key={user.connectionId}>
																		<Card
																			className="my-5 px-4 py-8 bg-background"
																			style={{
																				maxWidth: '100%',
																				maxHeight: '100%',
																				overflow: 'auto',
																			}}
																		>
																			<div className="flex justify-between">
																				<div className="flex">
																					<h5 className="text-xl font-bold leading-none dark:text-white flex flex-wrap">
																						Connection Id
																					</h5>
																					<span className="text-xl font-bold leading-none dark:text-white pl-1">
																						:
																					</span>
																					<p className="dark:text-white pl-1">
																						{user?.connectionId}
																					</p>
																				</div>
																				{values.credentialData.length > 1 && (
																					<div
																						key={index}
																						className="sm:w-2/12 text-red-600 flex justify-end"
																					>
																						<Button
																							data-testid="deleteBtn"
																							color="danger"
																							type="button"
																							className={` dark:bg-gray-700 flex justify-end focus:ring-0`}
																							onClick={() => {
																								arrayHelpers.remove(index);
																							}}
																						>
																							<svg
																								xmlns="http://www.w3.org/2000/svg"
																								fill="none"
																								viewBox="0 0 24 24"
																								strokeWidth={1.5}
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

																			<h3 className="dark:text-white">Attributes</h3>
																			<div className="container mx-auto pr-2">
																				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">

																					{attributes?.map((attr, attrIndex) => {

																						return (
																							<div
																								key={`${user.connectionId}-${attr.name}-${attrIndex}`}
																							>
																								<div key={attr?.name} className="flex">
																									<label
																										htmlFor={`credentialData.${index}.attributes.${attrIndex}.value`}
																										className="dark:text-white w-2/5 pr-3 flex justify-end items-center font-light"
																									>
																										<div className="flex items-center word-break-word text-end">
																											<Name
																												attr={attr?.name}
																											/>
																											{attr.isRequired && (
																												<span className="text-red-500">
																													*
																												</span>
																											)}{' '}
																											:
																										</div>
																									</label>
																									<div className="w-3/5">
																										<Field
																											type={
																												attr?.dataType === 'date'
																													? 'date'
																													: attr?.dataType
																											}
																											id={`credentialData.${index}.attributes.${attrIndex}.value`}
																											name={`credentialData.${index}.attributes.${attrIndex}.value`}
																											className="bg-gray-50 relative border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																											validate={(value: any) => {
																												try {
																												  const schema = Yup.reach(
																													validationSchema,
																													`credentialData.${index}.attributes.${attrIndex}.value`
																												  );
																											  
																												  // Check if schema is an actual Yup schema with validateSync
																												  if ('validateSync' in schema && typeof schema.validateSync === 'function') {
																													schema.validateSync(value, { abortEarly: false });
																												  }
																											  
																												  return undefined; // No error
																												} catch (error: any) {
																												  return error.message;
																												}
																											  }}
																										/>
																										{showErrors(errors, touched, index, attrIndex)}{' '}
																									</div>
																								</div>
																							</div>
																						)
																					})}
																				</div>
																			</div>
																		</Card>
																	</div>
																)
															})}
														</>
													}}
												</FieldArray>

												<div className="flex justify-end">
													<Button
														type="submit"
														disabled={issuanceLoader}
														// isProcessing={issuanceLoader}
														className=""
													>
														<CircleArrowRight />
														<span className='text-custom-900'>Issue</span>
													</Button>
												</div>
											</Form>
										)}
									</Formik>
								</div>
						)}
					</> :
					<div className="flex justify-center items-center">
						<EmptyListMessage
							message="Select Schema and Credential Definition"
							description="Get started by selecting schema and credential definition"
						/>
					</div>
				}
			</div>
			</PageContainer>
	);
};

const Name = (attr: { attr: string }) => {
	return (
		<>
			{attr?.attr
				?.split('_')
				.map(
					(item: string | any[]) =>
						item[0].toUpperCase() + item.slice(1, item.length),
				)
				.join(' ')}
		</>
	);
};

export default IssueCred;
