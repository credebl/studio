'use client';

import * as yup from 'yup';

import { Alert, Button, Card, Label, Table } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import {
	apiStatusCodes,
	schemaVersionRegex,
	storageKeys,
} from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import type { FieldName, Values } from './interfaces';
import SchemaCard from '../../../commonComponents/SchemaCard';
import { addSchema } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';

const options = [
	{ value: 'string', label: 'String' },
	{ value: 'number', label: 'Number' },
	{ value: 'date', label: 'Date' },
];

const CreateSchema = () => {
	const [failure, setFailure] = useState<string | null>(null);
	const [orgId, setOrgId] = useState<number>(0);
	const [orgDid, setOrgDid] = useState<string>('');
	const [createloader, setCreateLoader] = useState<boolean>(false);

	useEffect(() => {
		const fetchData = async () => {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgId(Number(organizationId));
		};

		fetchData();
	}, []);

	const submit = async (values: Values) => {
		setCreateLoader(true);
		const schemaFieldName: FieldName = {
			schemaName: values.schemaName,
			schemaVersion: values.schemaVersion,
			attributes: values.attribute,
			orgId: orgId,
		};

		const createSchema = await addSchema(schemaFieldName);
		const { data } = createSchema as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			if (data?.data) {
				setCreateLoader(false);
				window.location.href = pathRoutes.organizations.schemas;
			} else {
				setFailure(createSchema as string);
				setCreateLoader(false);
			}
		} else {
			setCreateLoader(false);
			setFailure(createSchema as string);
			setTimeout(() => {
				setFailure(null);
			}, 4000);
		}
	};

	return (
		<>
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-6 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Create Schema
				</h1>
			</div>
			<div>
				<Card className="p-6 m-6" id="createSchemaCard">
					<div>
						<Formik
							initialValues={{
								schemaName: '',
								schemaVersion: '',
								attribute: [
									{
										attributeName: '',
										schemaDataType: 'string',
										displayName: '',
									},
								],
							}}
							validationSchema={yup.object().shape({
								schemaName: yup.string().trim().required('Schema is required'),
								schemaVersion: yup
									.string()
									.matches(schemaVersionRegex, 'Enter valid schema version')
									.required('Schema version is required'),
								attribute: yup.array().of(
									yup.object().shape({
										attributeName: yup
											.mixed()
											.required('Attribute name is required'),
										displayName: yup
											.mixed()
											.required('Display name is required'),
									}),
								),
							})}
							validateOnBlur
							validateOnChange
							enableReinitialize
							onSubmit={async (values): Promise<void> => {
								values.attribute.forEach((element: any) => {
									if (!element.schemaDataType) {
										element.schemaDataType = 'string';
									}
								});
								const updatedAttribute: Array<Number> = [];
								values.attribute.forEach((element) => {
									updatedAttribute.push(Number(element));
								});
								submit(values);
							}}
						>
							{(formikHandlers): JSX.Element => (
								<Form onSubmit={formikHandlers.handleSubmit}>
									<div className=" md:flex items-center space-x-4 ">
										<div className="md:w-1/3 sm:w-full md:w-96  flex-col md:flex">
											<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
												<Label htmlFor="schema" value="Schema" />
												<span className="text-red-600">*</span>
											</div>
											<div className="md:flex flex-col lg:mr-4 sm:mr-0">
												{' '}
												<Field
													id="schemaName"
													name="schemaName"
													placeholder="Schema Name eg. PAN CARD"
													className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
												/>
												{formikHandlers.errors &&
												formikHandlers.touched.schemaName &&
												formikHandlers.errors.schemaName ? (
													<label className="pt-1 text-red-500 text-xs h-5">
														{formikHandlers.errors.schemaName}
													</label>
												) : (
													<label className="pt-1 text-red-500 text-xs h-5"></label>
												)}
											</div>
										</div>
										<div
											className="md:w-1/3 sm:w-full md:w-96  flex-col md:flex"
											style={{ marginLeft: 0 }}
										>
											<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
												<Label htmlFor="schema" value="Version" />
												<span className="text-red-600">*</span>
											</div>
											<div className="md:flex flex-col">
												{' '}
												<Field
													id="schemaVersion"
													name="schemaVersion"
													placeholder="eg. 0.1 or 0.0.1"
													className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
												/>
												{formikHandlers.errors &&
												formikHandlers.touched.schemaVersion &&
												formikHandlers.errors.schemaVersion ? (
													<label className="pt-1 text-red-500 text-xs h-5">
														{formikHandlers.errors.schemaVersion}
													</label>
												) : (
													<label className="pt-1 text-red-500 text-xs h-5"></label>
												)}
											</div>
										</div>
									</div>
									<div className="pt-8">
										<FieldArray name="attribute">
											{(fieldArrayProps: any): JSX.Element => {
												const { form, remove, push } = fieldArrayProps;
												const { values } = form;
												const { attribute } = values;

												const areFirstInputsSelected =
													values.schemaName && values.schemaVersion;

												return (
													<>
														<div className="d-flex justify-content-center align-items-center mb-1">
															Attributes <span className="text-red-600">*</span>
														</div>
														<div className="flex flex-col flex-wrap">
															{attribute.map((element: any, index: number) => (
																<div
																	key={`attributeList-${index}`}
																	className="mt-5"
																>
																	<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white pl-1">
																		Attribute: {index + 1}
																	</label>
																	<div key={index} className="md:flex pl-1">
																		<div className="md:w-3/12 sm:w-full md:w-96  flex-col md:flex m-2">
																			<Field
																				id={`attribute[${index}]`}
																				name={`attribute.${index}.attributeName`}
																				placeholder="Attribute eg. NAME, ID"
																				disabled={!areFirstInputsSelected}
																				className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																			/>
																			{formikHandlers.touched.attribute &&
																			attribute[index] &&
																			formikHandlers?.errors?.attribute &&
																			formikHandlers?.errors?.attribute[
																				index
																			] &&
																			formikHandlers?.touched?.attribute[index]
																				?.attributeName &&
																			formikHandlers?.errors?.attribute[index]
																				?.attributeName ? (
																				<label className="pt-1 text-red-500 text-xs h-5">
																					{
																						formikHandlers?.errors?.attribute[
																							index
																						]?.attributeName
																					}
																				</label>
																			) : (
																				<label className="pt-1 text-red-500 text-xs h-5"></label>
																			)}
																		</div>

																		<div className="md:w-3/12 sm:w-full md:w-96  flex-col md:flex m-2 ">
																			<Field
																				component="select"
																				id={`attribute[${index}]`}
																				name={`attribute.${index}.schemaDataType`}
																				placeholder="Select"
																				disabled={!areFirstInputsSelected}
																				className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 "
																			>
																				{options.map((opt) => {
																					return (
																						<option
																							className=""
																							value={opt.value}
																						>
																							{opt.label}
																						</option>
																					);
																				})}
																			</Field>
																			{formikHandlers?.touched?.attribute &&
																			attribute[index] &&
																			formikHandlers?.errors?.attribute &&
																			formikHandlers?.errors?.attribute[
																				index
																			] &&
																			formikHandlers?.touched?.attribute[index]
																				?.schemaDataType &&
																			formikHandlers?.errors?.attribute[index]
																				?.schemaDataType ? (
																				<label className="pt-1 text-red-500 text-xs h-5">
																					{
																						formikHandlers?.errors?.attribute[
																							index
																						]?.schemaDataType
																					}
																				</label>
																			) : (
																				<label className="pt-1 text-red-500 text-xs h-5"></label>
																			)}
																		</div>
																		<div className="md:w-3/12 sm:w-full flex-col md:flex m-2">
																			<Field
																				id={`attribute[${index}]`}
																				name={`attribute.${index}.displayName`}
																				placeholder="Display Name"
																				disabled={!areFirstInputsSelected}
																				className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 "
																			/>

																			{formikHandlers?.touched?.attribute &&
																			attribute[index] &&
																			formikHandlers?.errors?.attribute &&
																			formikHandlers?.errors?.attribute[
																				index
																			] &&
																			formikHandlers?.touched?.attribute[index]
																				?.displayName &&
																			formikHandlers?.errors?.attribute[index]
																				?.displayName ? (
																				<label className="pt-1 text-red-500 text-xs h-5">
																					{
																						formikHandlers?.errors?.attribute[
																							index
																						]?.displayName
																					}
																				</label>
																			) : (
																				<label className="pt-1 text-red-500 text-xs h-5"></label>
																			)}
																		</div>
																		{index === 0 && attribute.length === 1 ? (
																			''
																		) : (
																			<div key={index} className="text-red-600">
																				<Button
																					data-testid="deleteBtn"
																					type="button"
																					color="danger"
																					className="mt-2"
																					onClick={() => remove(index)}
																					disabled={
																						index === 0 &&
																						attribute.length === 1
																					}
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
																		{index === attribute.length - 1 && (
																			<Button
																				id="addSchemaButton"
																				className="sm:w-full md:w-1/12 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-2"
																				type="button"
																				color="bg-primary-700"
																				onClick={() => push('')}
																				outline
																				disabled={
																					!formikHandlers.isValid ||
																					!formikHandlers.dirty
																				}
																			>
																				<svg
																					xmlns="http://www.w3.org/2000/svg"
																					width="24"
																					height="24"
																					fill="none"
																					viewBox="0 0 24 24"
																					strokeWidth={2.5}
																					stroke="currentColor"
																					className="mr-2"
																				>
																					<path
																						fill="#fff"
																						stroke-linecap="round"
																						stroke-linejoin="round"
																						d="M12 4.5v15m7.5-7.5h-15"
																					/>
																				</svg>
																				Add
																			</Button>
																		)}
																	</div>
																</div>
															))}
														</div>
													</>
												);
											}}
										</FieldArray>
									</div>

									{failure && (
										<div className="pt-1">
											<Alert color="failure" onDismiss={() => setFailure(null)}>
												<span>
													<p>{failure}</p>
												</span>
											</Alert>
										</div>
									)}
									<div className="float-right p-2">
										<Button
											data-modal-target="popup-modal"
											data-modal-toggle="popup-modal"
											type="button"
											color="bg-primary-700"
											disabled={
												!formikHandlers.isValid || !formikHandlers.dirty
											}
											className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
										>
											<svg
												className="pr-2"
												xmlns="http://www.w3.org/2000/svg"
												width="24"
												height="24"
												fill="none"
												viewBox="0 0 24 24"
											>
												<path
													fill="#fff"
													d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
												/>
											</svg>
											Create
										</Button>
									</div>

									<div>
										<div
											id="popup-modal"
											tabindex="-1"
											className="fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
										>
											<div className="relative w-full max-w-md max-h-full">
												<div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
													<button
														type="button"
														className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
														data-modal-hide="popup-modal"
													>
														<svg
															className="w-3 h-3"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 14 14"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
															/>
														</svg>
														<span className="sr-only">Close modal</span>
													</button>
													<div className="p-6 text-center">
														<svg
															className="mx-auto mb-4 text-yellow-300 w-12 h-12 dark:text-gray-200"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
														<h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
															Would you like to proceed? Keep in mind that this
															action cannot be undone.
														</h3>
														<Button
															type="submit"
															isProcessing={createloader}
															disabled={createloader}
															className="text-base bg-primary-700 hover:!bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 font-medium rounded-lg text-sm inline-flex items-center text-center mr-2"
														>
															Yes, I'm sure
														</Button>
														<button
															data-modal-hide="popup-modal"
															type="button"
															className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
														>
															No, cancel
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="float-right p-2">
									<Button
                        type="reset"
                        color='bg-primary-800'
                        onClick={() => {
                          setCredDefAuto('')
                        }}
                        disabled={createloader}
                        className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto'

                        style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className='mr-2' width="18" height="18" fill="none" viewBox="0 0 20 20">
                          <path fill="#1F4EAD" d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z" />
                        </svg>

                        Reset
                      </Button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</Card>
			</div>
		</>
	);
};

export default CreateSchema;
