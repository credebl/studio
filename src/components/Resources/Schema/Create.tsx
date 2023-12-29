'use client';

import * as yup from 'yup';

import { Button, Card, Label } from 'flowbite-react';
import { Field, FieldArray, Form, Formik, FormikConfig, FormikErrors, FormikHandlers, FormikHelpers, FormikProps } from 'formik';
import {
	apiStatusCodes,
	schemaVersionRegex,
	storageKeys,
} from '../../../config/CommonConstant';
import React, { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import type { FieldName, IFormData, IAttributes } from './interfaces';
import { createSchemas } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import {
	ICheckEcosystem,
	checkEcosystem,
	getEcosystemId,
} from '../../../config/ecosystem';
import { createSchemaRequest } from '../../../api/ecosystem';
import EcosystemProfileCard from '../../../commonComponents/EcosystemProfileCard';
import ConfirmationModal from '../../../commonComponents/ConfirmationModal'

const options = [
	{
		value: 'string',
		label: 'String',
	},
	{
		value: 'number',
		label: 'Number',
	},
	{
		value: 'time',
		label: 'Time',
	},
	{
		value: 'datetime-local',
		label: 'Date & Time',
	},
];

interface IPopup {
	show: boolean,
	type: "reset" | "create"
}

const CreateSchema = () => {
	const [failure, setFailure] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [orgId, setOrgId] = useState<string>('');
	const [createLoader, setCreateLoader] = useState<boolean>(false);
	const [showPopup, setShowPopup] = useState<IPopup>({ show: false, type: "reset" });
	const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();
	const [btnState, setBtnState] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	
	const initFormData: IFormData = {
		schemaName: '',
		schemaVersion: '',
		attribute: [
			{
				attributeName: '',
				schemaDataType: 'string',
				displayName: '',
			},
		],
	};
	const [formData, setFormData] = useState(initFormData);
	useEffect(() => {
		const fetchData = async () => {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgId(orgId);
		};

		fetchData();

		const checkEcosystemData = async () => {
			const data: ICheckEcosystem = await checkEcosystem();
			setIsEcosystemData(data);
		};

		checkEcosystemData();
	}, []);

	const submit = async (values: IFormData) => {
		setCreateLoader(true);
		const schemaFieldName: FieldName = {
			schemaName: values.schemaName,
			schemaVersion: values.schemaVersion,
			attributes: values.attribute,
			orgId: orgId,
		};

		const createSchema = await createSchemas(schemaFieldName, orgId);
		const { data } = createSchema as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {		
			if (data) {
				setSuccess(data?.message);
				setCreateLoader(false);
				setLoading(true)
				setTimeout(() => {
					setSuccess(null);
				}, 2000);
				setTimeout(() => {
					setShowPopup({
						type: "create",
						show: false
					});
					window.location.href = pathRoutes?.organizations?.schemas;
				}, 2000);
			} else {
				setFailure(createSchema as string);
				setCreateLoader(false);
			}
		} else {
			setCreateLoader(false);
			setFailure(createSchema as string);
			setTimeout(() => {
				setFailure(null);
			}, 2000);
		}
		setTimeout(() => {
			setShowPopup({
				type: "create",
				show: false
			});
		}, 2000);
	};

	const submitSchemaCreationRequest = async (values: IFormData) => {
		setCreateLoader(true);
		const schemaFieldName = {
			endorse: true,
			attributes: values.attribute,
			version: values.schemaVersion,
			name: values.schemaName,
		};

		const id = await getEcosystemId();

		const createSchema = await createSchemaRequest(schemaFieldName, id, orgId);
		const { data } = createSchema as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			setSuccess(data?.message);
			setCreateLoader(false);
			window.location.href = pathRoutes.ecosystem.endorsements;
			setTimeout(() => {
				setSuccess(null);
			}, 2000);
		} else {
			setCreateLoader(false);
			setFailure(createSchema as string);
			setTimeout(() => {
				setFailure(null);
			}, 2000);
		}
		setTimeout(() => {
			setShowPopup({
				type: "create",
				show: false
			});
		}, 2000);
	};

	const formTitle = isEcosystemData?.isEcosystemMember
		? 'Schema Endorsement'
		: 'Create Schema';
	const submitButtonTitle = isEcosystemData?.isEcosystemMember
		? {
			title: 'Request Endorsement',
			svg: (
				<svg
					className="mr-2 mt-1"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					fill="none"
					viewBox="0 0 25 25"
				>
					<path
						fill="currentColor"
						d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"
					/>
				</svg>
			),
		}
		: {
			title: 'Create',
			svg: (
				<div className="pr-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="15"
						height="15"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
						/>
					</svg>
				</div>
			),
		};

	const confirmCreateSchema = () => {
		if (
			isEcosystemData?.isEnabledEcosystem &&
			isEcosystemData?.isEcosystemMember
		) {
			submitSchemaCreationRequest(formData);
		} else {
			formData.attribute.forEach((element: any) => {
				if (!element.schemaDataType) {
					element.schemaDataType = 'string';
				}
			});
			const updatedAttribute: Array<Number> = [];
			formData.attribute.forEach((element) => {
				updatedAttribute.push(Number(element));
			});
			submit(formData);
		}
	};

	const validSameAttribute = (formikHandlers: FormikProps<IFormData>, index: number, field: "attributeName" | "displayName") => {
		const attributeError: string | string[] | FormikErrors<IAttributes>[] | undefined = formikHandlers?.errors?.attribute
		const attributeTouched = formikHandlers?.touched?.attribute
		const attributeValue = formikHandlers?.values?.attribute
		const isErrorAttribute = attributeError && attributeError.length > 0 && attributeError[index] && attributeError[index][field]
		const isTouchedAttribute = attributeTouched && attributeTouched.length > 0 && attributeTouched[index] && attributeTouched[index][field]
		const isValueAttribute = attributeValue && attributeValue.length > 0 && attributeValue[index] && attributeValue[index][field]

		if (!(isTouchedAttribute && isErrorAttribute) && isValueAttribute) {
			const isValid = attributeValue.filter((item: IAttributes, i: number) => {
				const itemAttribute = item[field]?.trim()?.toLocaleLowerCase()
				const enteredAttribute = attributeValue[index][field]?.trim()?.toLocaleLowerCase()
				if ((itemAttribute && enteredAttribute) && itemAttribute === enteredAttribute) {
					return {
						...item,
						index: i
					}
				}
			}).length > 1
			return isValid
		} else {
			return false
		}
	}

	const inValidAttributes = (formikHandlers: FormikProps<IFormData>, propertyName: "attributeName" | "displayName") => {
		const attributeValue: IAttributes[] = formikHandlers?.values?.attribute
		const isValueAttribute = attributeValue && attributeValue.length > 0

		if (isValueAttribute) {
			const seen: {[key: string]: boolean} = {};

			for (const obj of attributeValue) {
				const propertyValue = obj[propertyName];
				if (seen[propertyValue]) {
					return true
				}
				seen[propertyValue] = true;
			}

			// No duplicates found
			return false;
		} else {
			return true
		}
	}

	return (
		<div className="pt-2">
			<div className="pl-6 mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			{isEcosystemData?.isEnabledEcosystem && (
				<div className="mx-6 mb-4">
					<EcosystemProfileCard />
				</div>
			)}

			<div>
				<Card className="m-0 md:m-6" id="createSchemaCard">
					<h1 className="mb-4 col-span-full xl:mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						{formTitle}
					</h1>
					<div>
						<Formik
							initialValues={formData}
							validationSchema={yup.object().shape({
								schemaName: yup.string().trim().required('Schema is required'),
								schemaVersion: yup
									.string()
									.matches(
										schemaVersionRegex,
										'Enter valid schema version (eg. 0.1 or 0.0.1)',
									)
									.required('Schema version is required'),
								attribute: yup.array().of(
									yup.object().shape({
										attributeName: yup
											.string()
											.trim()
											.required('Attribute name is required'),
										displayName: yup
											.string()
											.trim()
											.required('Display name is required'),
									}),
								),
							})}
							validateOnBlur
							validateOnChange
							enableReinitialize
							onSubmit={async (values): Promise<void> => {
								setFormData(values);
								setShowPopup({
									type: "create",
									show: true
								});
							}}
						>
							{(formikHandlers): JSX.Element => (
								<Form onSubmit={formikHandlers.handleSubmit}>
									<div className=" md:flex items-center space-x-4 ">
										<div className="md:w-1/3 sm:w-full md:w-96 flex-col md:flex pr-0 md:pr-4">
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

									<div className="pt-4 pb-10 mt-6 rounded-lg border border-gray-200">
										<FieldArray name="attribute">
											{(fieldArrayProps: any): JSX.Element => {
												const { form, remove, push } = fieldArrayProps;
												const { values } = form;
												const { attribute } = values;

												const areFirstInputsSelected =
													values.schemaName && values.schemaVersion;
												setBtnState(Boolean(areFirstInputsSelected));
												return (
													<div className="relative flex flex-col dark:bg-gray-800">
														{attribute?.map(
															(element: IAttributes, index: number) => (
																<div
																	key={`attribute-${index}`}
																	className="mt-5 relative"
																>
																	<div
																		key={`attribute-${index}`}
																		className="relative flex flex-col sm:flex-row dark:bg-gray-800 md:flex-row justify-between bg-white px-4 cursor-pointer"
																	>
																		<div
																			key={`attribute-${index}`}
																			style={{
																				overflow: 'auto',
																				width: '95%',
																			}}
																			className="grid min-[320]:grid-cols-1 sm:grid-cols-3 md:grid-cols-3"
																		>
																			<div className="relative flex max-w-[411px] flex-col items-start p-2 gap-x-4">
																				<Field
																					id={`attribute[${index}]`}
																					name={`attribute.${index}.attributeName`}
																					placeholder="Attribute eg. NAME, ID"
																					disabled={!areFirstInputsSelected}
																					onChange={(e: any) => {
																						formikHandlers.handleChange(e)
																						formikHandlers.setFieldValue(`attribute[${index}].displayName`, e.target.value, true)
																					}}
																					className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																				/>
																				{
																					validSameAttribute(formikHandlers, index, 'attributeName') && <label className="pt-1 text-red-500 text-xs h-5">Attribute name already exists</label>
																				}
																				{formikHandlers.touched.attribute &&
																					attribute[index] &&
																					formikHandlers?.errors?.attribute &&
																					formikHandlers?.errors?.attribute[
																					index
																					] &&
																					formikHandlers?.touched?.attribute[
																						index
																					]?.attributeName &&
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

																			<div className="relative flex max-w-[411px] flex-col items-start p-2 gap-x-4">
																				<Field
																					component="select"
																					id={`attribute[${index}]`}
																					name={`attribute.${index}.schemaDataType`}
																					placeholder="Select"
																					disabled={!areFirstInputsSelected}
																					className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																				>
																					{options.map((opt) => {
																						return (
																							<option
																								key={opt.value}
																								className="py-2"
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
																					formikHandlers?.touched?.attribute[
																						index
																					]?.schemaDataType &&
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
																			<div className="relative flex max-w-[411px] flex-col items-start p-2 gap-x-4">
																				<Field
																					id={`attribute[${index}]`}
																					name={`attribute.${index}.displayName`}
																					placeholder="Display Name"
																					disabled={!areFirstInputsSelected}
																					className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																				/>
																				{
																					validSameAttribute(formikHandlers, index, 'displayName') && <label className="pt-1 text-red-500 text-xs h-5">Display name of attribute already exists</label>
																				}
																				{formikHandlers?.touched?.attribute &&
																					attribute[index] &&
																					formikHandlers?.errors?.attribute &&
																					formikHandlers?.errors?.attribute[
																					index
																					] &&
																					formikHandlers?.touched?.attribute[
																						index
																					]?.displayName &&
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
																		</div>

																		<div
																			className="max-w-[50px]"
																			style={{ width: '5%' }}
																		>
																			{index === 0 &&
																				values.attribute.length === 1 ? (
																				<div
																					key={element.id}
																					className="sm:w-0.5/3 text-red-600"
																				></div>
																			) : (
																				<div
																					key={element.id}
																					className="sm:w-0.5/3 text-red-600"
																				>
																					<Button
																						data-testid="deleteBtn"
																						type="button"
																						color="danger"
																						onClick={() => remove(index)}
																						className={`${index === 0 &&
																							values.attribute.length === 1
																							? 'hidden'
																							: 'block'
																							} flex justify-end focus:ring-0`}
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
																	</div>
																	<div>
																		{index === values.attribute.length - 1 && (
																			<Button
																				key={element.id}
																				className={`
																				text-primary-700 hover:text-white dark:disabled:text-secondary-disabled disabled:text-primary-disabled bg-white hover:enabled:bg-primary-700 dark:text-white dark:bg-gray-700 dark:hover:enabled:!bg-gray-500 dark:hover:enabled:!text-gray-50 border border-primary-700 disabled:border-primary-disabled dark:border-gray-600 absolute bottom-[-62px] w-max left-[50%] translate-x-[-50%] m-auto flex flex-row items-center gap-2 rounded-full  
																				 disabled:opacity-100 group py-0`}
																				type="button"
																				onClick={() =>
																					push({
																						attributeName: '',
																						schemaDataType: 'string',
																						displayName: '',
																					})
																				}
																				disabled={
																					!formikHandlers.isValid || !btnState
																				}
																			>
																				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
																					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
																				</svg>

																				<span className="ml-1 my-0.5">
																					Add attribute
																				</span>
																			</Button>
																		)}
																	</div>
																</div>
															),
														)}
													</div>
												);
											}}
										</FieldArray>
									</div>
									<div className="flex gap-4 float-right mt-16 ml-4">
										<Button
											type="button"
											color="bg-primary-800"
											disabled={createLoader || !(formikHandlers.values.schemaName || formikHandlers.values.schemaVersion)}
											className="dark:text-white bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-base px-4 lg:px-5 py-2 lg:py-2.5 ml-auto dark:hover:text-black"
											style={{
												height: '2.6rem',
												width: '6rem',
												minWidth: '2rem',
											}}
											onClick={() => setShowPopup({ show: true, type: "reset" })}
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
											color="bg-primary-700"
											disabled={!formikHandlers.isValid || !btnState || inValidAttributes(formikHandlers, "attributeName") || inValidAttributes(formikHandlers, "displayName")}
											className="text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 ring-2 ring-primary-700 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-600 py-2 lg:py-2.5 ml-auto"
											style={{
												height: '2.6rem',
												width: 'auto',
												minWidth: '2rem',
											}}
										>
											{submitButtonTitle.svg}
											{submitButtonTitle.title}
										</Button>
									</div>
									<ConfirmationModal
										success={success}
										failure={failure}
										openModal={showPopup.show}
										closeModal={() => setShowPopup({
											...showPopup,
											show: false
										})}
										onSuccess={() => {
											if (showPopup.type === "create") {
												// TODO document why this block is empty
												confirmCreateSchema()
											} else {
												formikHandlers.resetForm()
												setFormData(initFormData)
												setShowPopup({ show: false, type: "reset" })
											}
										}}
										message={
											showPopup.type === "create" ?
												'Would you like to proceed? Keep in mind that this action cannot be undone.' :
												<div>This will reset all the entries you entered. <br />Do you want to proceed?</div>
										}
										buttonTitles={["No, cancel", "Yes, I'm sure"]}
										isProcessing={createLoader}
										setFailure={setFailure}
										setSuccess={setSuccess}
										loading={loading}
									/>
								</Form>
							)}
						</Formik>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default CreateSchema;
