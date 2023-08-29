'use client';

import type { AxiosResponse } from 'axios';
import { Alert, Button, Card, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getFromLocalStorage, removeFromLocalStorage } from '../../api/Auth';
import { getCredDeffById, getSchemaById } from '../../api/Schema';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import BreadCrumbs from '../BreadCrumbs';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { issueCredential } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';

interface SchemaDetails {
	schemaName: string;
	version: string;
	schemaId: string;
	credDefId: string;
}

interface SelectedUsers {
	userName: string;
	connectionId: string;
}

interface Attributes {
	name: string;
	value: string;
	dataType: string;
}
interface IssuanceFormPayload {
	userName?: string;
	connectionId: string;
	attributes: Attributes[];
	credentialDefinitionId: string;
	orgId: number;
}

interface DataTypeAttributes {
	schemaDataType: string;
	attributeName:string
}

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

	useEffect(() => {
		getSchemaAndUsers();
	}, []);

	const getSchemaAndUsers = async () => {
		const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

		createSchemaPayload(schemaId, credDefId);
		setUserLoader(true);
		const selectedUsers = await getSelectedUsers();
		const attributes = await getSchemaDetails();
		if (attributes && attributes.length) {
			createIssuanceForm(selectedUsers, attributes, credDefId, Number(orgId));
		} else {
			setFailure('Attributes are not available');
		}
	};

	const createIssuanceForm = (
		selectedUsers: SelectedUsers[],
		attributes: DataTypeAttributes[],
		credDefId: string,
		orgId: number,
	) => {
		const attrObj = attributes.map((attr) => ({
			name: attr?.attributeName,
			value: '',
			dataType: attr?.schemaDataType,
		}));
		const issuancePayload = selectedUsers.map((user) => {
			return {
				connectionId: user?.connectionId,
				attributes: attrObj,
				credentialDefinitionId: credDefId,
				orgId,
			};
		});
		setIssuanceFormPayload(issuancePayload);
		setUserLoader(false);
	};

	const getSchemaDetails = async (): Promise<DataTypeAttributes[] | null> => {
		const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTR);
		const parsedSchemaAttributes = JSON.parse(schemaAttributes) || []; 
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

	const validationSchema = Yup.object().shape({
		attributes: Yup.array().of(
			Yup.object().shape({
				value: Yup.mixed().test(
					'matchDataType',
					'Value must match the specified data type',
					function (value) {
						const dataType = this.parent.dataType;
						if (dataType === 'string') {
							return typeof value === 'string';
						} else if (dataType === 'number') {
							return typeof value === 'number';
						} else if (dataType === 'date') {
							return !isNaN(Date.parse(value));
						}
						return true;
					},
				),
			}),
		),
	});

	const handleSubmit = async (values: IssuanceFormPayload) => {
		const convertedAttributes = values.attributes.map((attr) => ({
			...attr,
			value: String(attr.value),
		}));

		const convertedAttributesValues = {
			...values,
			attributes: convertedAttributes,
		};

		setIssuanceLoader(true);
		const issueCredRes = await issueCredential(convertedAttributesValues);
		const { data } = issueCredRes as AxiosResponse;
		setIssuanceLoader(false);

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			goToIssueCredList();
		} else {
			setFailure(issueCredRes as string);
		}
	};

	const goToIssueCredList = () => {
		removeFromLocalStorage(storageKeys.SELECTED_USER);
		removeFromLocalStorage(storageKeys.SCHEMA_ID);
		removeFromLocalStorage(storageKeys.CRED_DEF_ID);
		window.location.href = `${pathRoutes.organizations.issuedCredentials}`;
	};

	return (
		<div className="px-4 pt-6">
			<div className="pl-6 mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Issuance
				</h1>
			</div>
			{!schemaLoader ? (
				<Card
					style={{
						width: '470px',
						height: '140px',
						maxWidth: '100%',
						maxHeight: '100%',
						overflow: 'auto',
					}}
				>
					<div className="flex justify-between items-start">
						<div>
							<h5 className="text-xl font-bold leading-none text-primary dark:text-white">
								{schemaDetails.schemaName}
							</h5>
							<p className="text-primary dark:text-white">
								Version: {schemaDetails.version}
							</p>
						</div>
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
							<span className="font-semibold text-primary">Schema ID:</span>{' '}
							{schemaDetails.schemaId}
						</p>
						<p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
							<span className="font-semibold text-primary">
								Credential Definition:
							</span>{' '}
							{schemaDetails.credDefId}
						</p>
					</div>
				</Card>
			) : (
				''
			)}
			{userLoader ? (
				<div className="flex items-center justify-center mb-4">
					<Spinner color="info" />
				</div>
			) : (
				<>
					{issuanceFormPayload.length
						? issuanceFormPayload.map((user) => (
								<Formik
									initialValues={user}
									validationSchema={validationSchema}
									onSubmit={handleSubmit}
								>
									{({ values }) => (
										<Form>
											<Card
												className="hover:bg-gray-50 my-5"
												style={{
													maxWidth: '100%',
													maxHeight: '100%',
													overflow: 'auto',
												}}
											>
												<div className="flex justify-between">
													<h5 className="text-xl font-bold leading-none dark:text-white">
														{user.userName}
													</h5>
													{/* Needed for multiple users issuance */}
													{/* <div className="flex justify-end">
												<img src={DeleteIcon}></img>
											</div> */}
												</div>
												<div className="flex">
													<h5 className="text-xl font-bold leading-none dark:text-white">
														Connection Id:
													</h5>
													<span className="pl-1">{user.connectionId}</span>
												</div>
												<h3 className="">Attributes</h3>
												<div className="container mx-auto pr-10">
													<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
														{values.attributes.map((attr, index) => (
															<div>
																<div key={index} className="flex">
																	<label
																		htmlFor={`attributes.${index}.value`}
																		className="w-1/3 pr-2 flex justify-end items-center font-light"
																	>
																		{attr.name.charAt(0).toUpperCase() +
																			attr.name.slice(1).toLowerCase() + " :"}
																	</label>
																	<Field
																		type={
																			attr.dataType === 'date'
																				? 'date'
																				: attr.dataType
																		}
																		id={`attributes.${index}.value`}
																		name={`attributes.${index}.value`}
																		className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 w-2/3"
																	/>
																</div>
																<div className="flex">
																	<div className="w-1/4 pr-2"></div>
																	<ErrorMessage
																		className="text-red-500 text-xs w-3/4 p-1"
																		name={`attributes.${index}.value`}
																		component="div"
																	/>
																</div>
															</div>
														))}
													</div>
												</div>
											</Card>
											{failure && (
												<div className="pt-1 pb-1">
													<Alert
														color="failure"
														onDismiss={() => setFailure(null)}
													>
														<span>
															<p>{failure}</p>
														</span>
													</Alert>
												</div>
											)}
											<div className="flex justify-end">
												<Button
													type="submit"
													disabled={issuanceLoader}
													isProcessing={issuanceLoader}
													className='text-base text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-accent-00 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
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
						  ))
						: ''}
				</>
			)}
		</div>
	);
};

export default IssueCred;