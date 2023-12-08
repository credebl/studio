import React, { useEffect, useState } from 'react';
import { pathRoutes } from '../../config/pathRoutes';
import BreadCrumbs from '../BreadCrumbs';
import BackButton from '../../commonComponents/backbutton';
import { Alert, Button, Card } from 'flowbite-react';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import { AlertComponent } from '../AlertComponent';
import IssuancePopup from './IssuancePopup';
import type { AxiosResponse } from 'axios';
import { getFromLocalStorage } from '../../api/Auth';
import { getSchemaCredDef } from '../../api/BulkIssuance';
import { storageKeys, apiStatusCodes } from '../../config/CommonConstant';
import type {
	IAttributes,
	ICredentials,
	IUploadMessage,
	IValues,
} from './interface';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import CustomSpinner from '../CustomSpinner';

interface IFormData {
	emailId: string;
	attributes: Attributes[];
}
interface IssuanceFormPayload {
	emailId: string;
	attributes: Attributes[];
	credentialDefinitionId: string;
	orgId: string;
}
interface Attributes {
	value: string;
	name: string;
}
const EmailIssuance = () => {
	const [formData, setFormData] = useState();
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
	const [issuanceFormPayload, setIssuanceFormPayload] = useState<
		IssuanceFormPayload[]
	>([]);
	const [attributes, setAttributes] = useState([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	console.log('credentialSelected', credentialSelected);
	console.log('credentialSelected1111', attributes);

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
	const handleSubmit = async (values: IssuanceFormPayload) => {
		console.log('values111', values);

		// const convertedAttributes = values.attributes.map((attr) => ({
		// 	...attr,
		// 	value: String(attr.value),
		// }));

		// const convertedAttributesValues = {
		// 	...values,
		// 	attributes: convertedAttributes,
		// };
		// console.log("values1112233",convertedAttributesValues);

		// setIssuanceLoader(true);
		// const issueCredRes = await issueCredential(convertedAttributesValues);
		// const { data } = issueCredRes as AxiosResponse;
		// setIssuanceLoader(false);

		// if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
		// 	// goToIssueCredList();
		// } else {
		// 	setFailure(issueCredRes as string);
		// }
	};

	// const defaultNames = ['John', 'Jane', 'Doe'];

	useEffect(() => {
		const initFormData = {
			email: '',
			attributes: attributes.map((item) => {
				return {
					...item,
					value: '', // Initialize with an empty string
					name: item.attributeName,
				};
			}),
		};

		setFormData({ formData: [initFormData] });
	}, [attributes]);

	console.log(34534534, formData);

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
							value?.schemaAttributes
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
												console.log('value11', value);
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
					<div className="flex flex-col justify-between min-h-100/21rem w-full">
						<Card>
							<div className="min-h-100/21rem w-full">
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
								{/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> */}
								<div>
									<div className="flex flex-col justify-between">
										{loading ? (
											<div className="flex items-center justify-center mb-4">
												<CustomSpinner />
											</div>
										) : (
											<div>
												<Card className="m-0 md:m-6" id="createSchemaCard">
													<h1 className="md:pl-6 mb-4 col-span-full xl:mb-2 ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
														issuance
													</h1>
													<div>
														<Formik
															initialValues={formData}
															// validationSchema={yup.object().shape({
															// 	schemaName: yup
															// 		.string()
															// 		.trim()
															// 		.required('Schema is required'),
															// 	schemaVersion: yup
															// 		.string()
															// 		.matches(
															// 			schemaVersionRegex,
															// 			'Enter valid schema version (eg. 0.1 or 0.0.1)',
															// 		)
															// 		.required('Schema version is required'),
															// 	attribute: yup.array().of(
															// 		yup.object().shape({
															// 			attributeName: yup
															// 				.mixed()
															// 				.required('Attribute name is required'),
															// 			displayName: yup
															// 				.mixed()
															// 				.required('Display name is required'),
															// 		}),
															// 	),
															// })}
															validateOnBlur
															validateOnChange
															enableReinitialize
															onSubmit={async (values): Promise<void> => {
																// setFormData(values);
																// setShowPopup(true);
																console.log('12112values', values);
															}}
														>
															{(formikHandlers): JSX.Element => (
																<Form onSubmit={formikHandlers.handleSubmit}>
																	<FieldArray
																		name="formData"
																		render={(arrayHelpers) => {
																			console.log(
																				32535,
																				arrayHelpers.form.values.formData,
																			);
																			return (
																				<div>
																					{arrayHelpers.form.values.formData &&
																					arrayHelpers.form.values.formData
																						.length > 0 ? (
																						arrayHelpers.form.values.formData.map(
																							(formData1, index) => {
																								console.log(
																									6767887,
																									formData1,
																									formData1.attributes,
																								);
																								return (
																									<div key={index}>
																										<Field
																											name={`formData[${index}].email`}
																										/>
																										{formData1.attributes &&
																											formData1?.attributes
																												.length > 0 &&
																											formData1?.attributes.map(
																												(item, attIndex) => (
																													<Field
																														type={item.schemaDataType}
																														placeholder={
																															item.name
																														}
																														name={`formData[${index}].attributes.${attIndex}.value`}
																													/>
																												),
																											)}
																										<button
																											type="button"
																											onClick={() =>
																												arrayHelpers.remove(
																													index,
																												)
																											} // remove a friend from the list
																										>
																											-
																										</button>
																										<button
																											type="button"
																											onClick={() =>
																												arrayHelpers.insert(
																													index,
																													{
																														email: '',
																														attributes:
																															attributes?.map(
																																(item) => {
																																	return {
																																		value: '', // Initialize with an empty string
																																		name: item.attributeName,
																																	};
																																},
																															),
																													},
																												)
																											} // insert an empty string at a position
																										>
																											+
																										</button>
																									</div>
																								);
																							},
																						)
																					) : (
																						<button
																							type="button"
																							onClick={() =>
																								arrayHelpers.push({
																									email: '',
																									attributes: attributes?.map(
																										(item) => {
																											return {
																												value: '', // Initialize with an empty string
																												name: item.attributeName,
																											};
																										},
																									),
																								})
																							}
																						>
																							{/* show this when user has removed all friends from the list */}
																							Add a friend
																						</button>
																					)}
																					<div>
																						<button type="submit">
																							Submit
																						</button>
																					</div>
																				</div>
																			);
																		}}
																	/>
																</Form>
															)}
														</Formik>
													</div>
												</Card>
											</div>
										)}
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailIssuance;
