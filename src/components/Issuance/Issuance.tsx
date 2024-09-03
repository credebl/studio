
import * as Yup from 'yup';

import { Alert, Button, Card } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { apiStatusCodes, CREDENTIAL_CONTEXT_VALUE, storageKeys, proofPurpose } from '../../config/CommonConstant';
import { getFromLocalStorage, removeFromLocalStorage } from '../../api/Auth';
import { useEffect, useState } from 'react';
import BackButton from '../../commonComponents/backbutton';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { issueCredential } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';
import { AlertComponent } from '../AlertComponent';
import type {
	IAttribute,
	DataTypeAttributes,
	IssuanceFormPayload,
	SchemaDetails,
	SelectedUsers,
	W3cSchemaDetails,
} from './interface';
import SummaryCard from '../../commonComponents/SummaryCard';
import React from 'react';
import { getOrganizationById } from '../../api/organization';
import { DidMethod, CredentialType, SchemaTypeValue, ProofType } from '../../common/enums';

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
		w3cAttributes:[],
		issuerDid:''
	});
	const [issuanceFormPayload, setIssuanceFormPayload] = useState<
		IssuanceFormPayload[]
	>([]);
	const [issuanceLoader, setIssuanceLoader] = useState<boolean>(false);
	const [failure, setFailure] = useState<string | null>(null);
	const [schemaAttributesDetails, setSchemaAttributesDetails] = useState<
	IAttribute[]
	>([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [w3cSchema, setW3CSchema]= useState<boolean>(false);
	const [credentialType, setCredentialType] = useState<CredentialType>();
	const [schemaType, setSchemaType] = useState<SchemaTypeValue>();
	const [orgDid, setOrgDid]= useState<string>('');

  useEffect(() => {
       fetchOrganizationDetails();
    return () => setUserLoader(false);
  }, []); 

	const fetchOrganizationDetails = async () => {
		try{
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (!orgId) return;
			const response = await getOrganizationById(orgId);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const did = data?.data?.org_agents?.[0]?.orgDid;
				
				if (did?.includes(DidMethod.POLYGON)) {
					setW3CSchema(true);
					setCredentialType(CredentialType.JSONLD);
					setSchemaType(SchemaTypeValue.POLYGON)
					await getSchemaAndUsers(true)
					setOrgDid(did);
				}
				else if (did?.includes(DidMethod.KEY) || did?.includes(DidMethod.WEB)) {
					setW3CSchema(true);
					setSchemaType(SchemaTypeValue.NO_LEDGER)
					setCredentialType(CredentialType.JSONLD);
					await getSchemaAndUsers(true)
					setOrgDid(did);
				}
				else if (did?.includes(DidMethod.INDY)) {
					setW3CSchema(false);
					setCredentialType(CredentialType.INDY);	
					await getSchemaAndUsers(false)
				}
			}
		} catch(error){
			console.log('Error in getSchemaAndUsers:', error);
			setFailure('Error fetching schema and users');
		}
		
	};
	const getSchemaAndUsers = async (w3cSchema: boolean) => {
		try {
			if (!w3cSchema) {
				const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
				const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
				const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	
				createSchemaPayload(schemaId, credDefId);
				setUserLoader(true);
				const selectedUsers = await getSelectedUsers();
				const attributes = await getSchemaDetails(w3cSchema);
				if (attributes && attributes?.length) {
					createIssuanceForm(selectedUsers, attributes, credDefId, orgId);
				} else {
					setFailure('Attributes are not available');
				}
			}
			if (w3cSchema) {
				const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
				const getW3cSchemaDetails = await getFromLocalStorage(storageKeys.W3C_SCHEMA_DETAILS);		
				const parsedW3cSchemaDetails = JSON.parse(getW3cSchemaDetails);

				const schemaId = parsedW3cSchemaDetails?.schemaId;
				createW3cSchemaPayload(schemaId, parsedW3cSchemaDetails);
				
				setUserLoader(true);
				const selectedUsers = await getSelectedUsers();

				const attributes = parsedW3cSchemaDetails?.attributes;
				
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
		const credentialData =  selectedUsers.map((user) => {
			
			const attributesArray = attributes.length > 0 && attributes.map((attr) => ({
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

		if (name) {
			name = name
				.split('_')
				.map((item) => item.charAt(0).toUpperCase() + item.slice(1))
				.join(' ');
		}

		if (isRequired) {
			if (!value) {
				attributeSchema = Yup.string().required(`${name} is required`);
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

	const getSchemaDetails = async (w3cSchema: boolean) => {
		try {
		  if (!w3cSchema) {
			const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTR);
	  
			let parsedSchemaAttributes = [];
			if (schemaAttributes) {
			  try {
				parsedSchemaAttributes = JSON.parse(schemaAttributes);
			  } catch (e) {
			  }
			}
			setSchemaAttributesDetails(parsedSchemaAttributes?.attribute);
			return parsedSchemaAttributes?.attribute || null;
		  }
	  
		} catch (error) {
		  console.error('Error in getSchemaAndUsers:', error);
		  setFailure('Error fetching schema and users');
		}
		return null;
	  };

	const createSchemaPayload = async (schemaId: string, credDefId: string) => {
		if (schemaId) {
			setSchemaLoader(true);
			const parts = schemaId.split(':');
			const schemaName = parts[2];
			const version = parts[3];
			setSchemaDetails({ schemaName, version, schemaId, credDefId });
			setSchemaLoader(false);
		}
	};
	const createW3cSchemaPayload = async (schemaId: string, parsedW3cSchemaDetails: any) => {
		if (schemaId) {

			if (parsedW3cSchemaDetails) {
				setW3CSchemaDetails(parsedW3cSchemaDetails);
				
				setSchemaLoader(false);

			}
		}
	};

const getSelectedUsers = async (): Promise<SelectedUsers[]> => {
		try {
		  const selectedUsers = await getFromLocalStorage(storageKeys.SELECTED_USER);
		  if (!selectedUsers) {
			return [];
		  }
		  return JSON.parse(selectedUsers);
		} catch (error) {
		  console.error("Error parsing selectedUsers:", error);
		  return [];
		}
	  };


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
		if(w3cSchema) { 
			issuancePayload = {
				credentialData: values?.credentialData.map((item) => {
					return {
						connectionId: item.connectionId,
						credential: {
							"@context": [
								CREDENTIAL_CONTEXT_VALUE,
								w3cSchemaDetails.schemaId
							],
							"type": [
								"VerifiableCredential",
								w3cSchemaDetails.schemaName
							],
							issuer: {
								"id": orgDid
							},
							issuanceDate: new Date().toISOString(),
							//FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
							credentialSubject: item?.attributes?.reduce((acc, attr) => {
								
								if (attr.dataType === 'number' && (attr.value === '' || attr.value === null)) {
									
									acc[attr.name] = 0;
								} else if (attr.dataType === 'string' && attr.value === '') {
								
									acc[attr.name] = '';
								} else if (attr.value !== null) {
									
									acc[attr.name] = attr.value;
								}
								return acc;
							}, {}),
						},

						options: {
							proofType: schemaType=== SchemaTypeValue.POLYGON ? ProofType.polygon : ProofType.no_ledger,
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
		const issueCredRes = await issueCredential(convertedAttributesValues, credentialType);
	
		const { data } = issueCredRes as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setSuccess(data?.message);
			window.location.href = `${pathRoutes.organizations.issuedCredentials}`;
			await removeFromLocalStorage(storageKeys.SELECTED_CONNECTIONS);
			await removeFromLocalStorage(storageKeys.SELECTED_USER);
		} else {
			setFailure(issueCredRes as string);
			setIssuanceLoader(false);
		}
	};

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.issuance.connections} />
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
			
  {!schemaLoader && !w3cSchema ? (
                                
								<SummaryCard
                                    schemaName={schemaDetails.schemaName}
                                    schemaId={schemaDetails.schemaId}
                                    version={schemaDetails.version}
                                    credDefId={schemaDetails.credDefId}
					                hideCredDefId={false}

                                />
                            ) : (
                                <SummaryCard
                                    schemaName={w3cSchemaDetails.schemaName}
                                    schemaId={w3cSchemaDetails.schemaId}
                                    version={w3cSchemaDetails.version}
					                hideCredDefId={false}

                                />
                            )}

			{userLoader ? (
				<div className="flex items-center justify-center mb-4">
					<CustomSpinner />
				</div>
			) : (
				<>
					<div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 gap-6">
						<Formik
							initialValues={{
								...issuanceFormPayload,
							}}
							validationSchema={validationSchema}
							onSubmit={handleSubmit}
						>
							{({ values, errors, touched }) => (
								<Form>
									{failure && (
										<div className="pt-1 pb-1">
											<Alert color="failure" onDismiss={() => setFailure(null)}>
												<span>
													<p>{failure}</p>
												</span>
											</Alert>
										</div>
									)}
									<FieldArray name="credentialData">
										{(arrayHelpers) => (
											<>
												{values?.credentialData?.length > 0 && values?.credentialData?.map((user, index) => {
													const attributes = w3cSchema ? issuanceFormPayload?.credentialData?.[0].attributes : user?.attributes;

													return (
														<div key={user.connectionId}>
															<Card
																className="my-5"
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
																									Yup.reach(
																										validationSchema,
																										`credentialData.${index}.attributes.${attrIndex}.value`,
																									).validateSync(value, {
																										abortEarly: false,
																									});
																								} catch (error) {
																									return error.message;
																								}
																							}}
																						/>
																						{errors?.credentialData &&
																							errors?.credentialData?.[index] &&
																							errors?.credentialData[index]
																								?.attributes &&
																							errors?.credentialData[index]
																								?.attributes[attrIndex] &&
																							errors?.credentialData[index]
																								?.attributes[attrIndex]?.value &&
																							touched?.credentialData &&
																							touched?.credentialData[index]
																								?.attributes &&
																							touched?.credentialData[index]
																								?.attributes[attrIndex]
																								?.value && (
																								<div className="text-red-500 absolute text-xs word-break-word">
																									{
																										errors?.credentialData?.[
																											index
																										]?.attributes?.[attrIndex]
																											?.value
																									}
																								</div>
																							)}{' '}
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
										)}
									</FieldArray>

									<div className="flex justify-end">
										<Button
											type="submit"
											disabled={issuanceLoader}
											isProcessing={issuanceLoader}
											className="text-base text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-accent-00 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
										>
											<div className="pr-3">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													fill="none"
													viewBox="0 0 24 24"
												>
													<path
														fill="#fff"
														d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z"
													/>
													<path
														fill="#fff"
														d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z"
													/>
												</svg>
											</div>
											Issue
										</Button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</>
			)}
		</div>
	);
};

const Name = (attr: { attr: string}) => {
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
