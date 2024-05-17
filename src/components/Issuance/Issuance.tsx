'use client';

import * as Yup from 'yup';

import { Alert, Button, Card } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import React, { useEffect, useState } from 'react';
import BackButton from '../../commonComponents/backbutton';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { issueCredential } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';
import { AlertComponent } from '../AlertComponent';
import type {
	Attribute,
	DataTypeAttributes,
	IssuanceFormPayload,
	SchemaDetails,
	SelectedUsers,
} from './interface';
import SummaryCard from '../../commonComponents/SummaryCard';

const IssueCred = () => {
	const [schemaLoader, setSchemaLoader] = useState<boolean>(true);
	const [userLoader, setUserLoader] = useState<boolean>(true);
	const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>({
		schemaName: '',
		version: '',
		schemaId: '',
		credDefId: '',
	});
	const [issuanceFormPayload, setIssuanceFormPayload] = useState<
		IssuanceFormPayload[]
	>([]);
	const [issuanceLoader, setIssuanceLoader] = useState<boolean>(false);
	const [failure, setFailure] = useState<string | null>(null);
	const [schemaAttributesDetails, setSchemaAttributesDetails] = useState<
		Attribute[]
	>([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getSchemaAndUsers();
		getSchemaDetails();
		return () => setUserLoader(false);
	}, []);

	const getSchemaAndUsers = async () => {
		const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		createSchemaPayload(schemaId, credDefId);
		setUserLoader(true);
		const selectedUsers = await getSelectedUsers();
		const attributes = await getSchemaDetails();
		if (attributes && attributes?.length) {
			createIssuanceForm(selectedUsers, attributes, credDefId, orgId);
		} else {
			setFailure('Attributes are not available');
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
				isRequired: attr.isRequired
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
	
	const createAttributeValidationSchema = (
		name: string,
		value: string,
		isRequired: boolean
	) => {
		let attributeSchema = Yup.string();;

		if (name) {
			name = name
				.split('_')
				.map(item => item.charAt(0).toUpperCase() + item.slice(1))
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
						return createAttributeValidationSchema(attr?.name, attr?.value, attr?.isRequired)
					}),
                ),
            }),
        ),
    });


	const getSchemaDetails = async (): Promise<DataTypeAttributes[] | null> => {
		const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTR);

		const parsedSchemaAttributes = JSON.parse(schemaAttributes) || [];
		
		setSchemaAttributesDetails(parsedSchemaAttributes?.attribute);

		return parsedSchemaAttributes.attribute;
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

	const getSelectedUsers = async (): Promise<SelectedUsers[]> => {
		const selectedUsers = await getFromLocalStorage(storageKeys.SELECTED_USER);
		return JSON.parse(selectedUsers);
	};

	const handleSubmit = async (values: IssuanceFormPayload) => {
		const issuancePayload = {
            credentialData: values.credentialData.map(item => {
				return {
					...item,
					attributes: item.attributes.map(attr => ({
						name: attr.name,
						value: attr.value.toString()
					}))
				}
			}),
            credentialDefinitionId: values.credentialDefinitionId,
            orgId: values.orgId
        };

		const convertedAttributesValues = {
			...issuancePayload,
		};
	
		setIssuanceLoader(true);
		const issueCredRes = await issueCredential(convertedAttributesValues);
	
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
			{!schemaLoader && (
				<SummaryCard
					schemaId={schemaDetails.schemaId}
					schemaName={schemaDetails.schemaName}
					version={schemaDetails.version}
					credDefId={schemaDetails.credDefId}
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
							{({ values, errors, touched, isValid }) => (
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
									<FieldArray name="issuanceFormPayload">
										{(arrayHelpers) => (
											<>
												{values?.credentialData.map((user, index) => (
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
																			type="button"
																			color="danger"
																			className={` dark:bg-gray-700 flex justify-end focus:ring-0`}
																			onClick={async () => {
																				const data =
																					issuanceFormPayload?.credentialData;
																				const findIndex = data.findIndex(
																					(item) =>
																						item.connectionId ===
																						user.connectionId,
																				);
																				data.splice(findIndex, 1);
																				const issuancePayload = {
																					...issuanceFormPayload,
																					credentialData: data,
																				};
																				setIssuanceFormPayload(issuancePayload);
																				window.location.reload();

																				await setToLocalStorage(storageKeys.SELECTED_USER, data);	
																		  
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
																	{schemaAttributesDetails &&
																		schemaAttributesDetails?.length > 0 &&
																		schemaAttributesDetails?.map(
																			(attr, attrIndex) => (
																				<div key={attr.attributeName}>
																					<div
																						key={attr?.attributeName}
																						className="flex"
																					>
																						<label
																							htmlFor={`values.credentialData.${index}.attributes.${attrIndex}.value`}
																							className="dark:text-white w-2/5 pr-3 flex justify-end items-center font-light"
																						>
																							<div className="flex items-center word-break-word text-end">
																								<Name attr={attr} />
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
																									attr?.schemaDataType ===
																									'date'
																										? 'date'
																										: attr?.schemaDataType
																								}
																								id={`credentialData.${index}.attributes.${attrIndex}.value`}
																								name={`credentialData.${index}.attributes.${attrIndex}.value`}
																								className="bg-gray-50 relative border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																								validate={(value) => {
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
																							{errors?.credentialData?.[index]
																								?.attributes?.[attrIndex]
																								?.value &&
																								touched?.credentialData?.[index]
																									?.attributes?.[attrIndex]
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
																			),
																		)}
																</div>
															</div>
														</Card>
													</div>
												))}
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

const Name = (attr: { attr: any; displayName: string }) => {
	return (
		<>
			{attr?.attr?.displayName
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
