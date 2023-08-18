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
import type { FieldName } from './interfaces';
import SchemaCard from '../../../commonComponents/SchemaCard';
import { addSchema } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';

interface Values {
	schemaName: string;
	schemaVersion: string;
	attribute: [
		{
			attributeName: string;
			schemaDataType: string;
			displayName: string;
		},
	];
}
const options = [
	{ value: 'string', label: 'String' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean' },
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

	const submit = async (values: any) => {
		setCreateLoader(true);
		const schemaFieldName: FieldName = {
			schemaName: values.schemaName,
			schemaVersion: values.schemaVersion,
			attributes: values.attribute,
			orgId: orgId,
			orgDid: 'did:indy:bcovrin:Kgf2mu1cYpboBAotagppwv',
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
										schemaDataType: '',
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
										// schemaDataType: yup
										// 	.mixed()
										// 	.required('Schema data type is required'),
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
												{/* Wrap the field and error message in a flex container */}
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
										<div className="md:w-1/3 sm:w-full md:w-96  flex-col md:flex" style={{marginLeft:0}} >
											<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
												<Label htmlFor="schema" value="Version" />
												<span className="text-red-600">*</span>
											</div>
											<div className="md:flex flex-col" >
												{' '}
												{/* Wrap the field and error message in a flex container */}
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
																		<div className='md:w-1/3 sm:w-full md:w-96  flex-col md:flex m-2'>
																		<Field
																			id={`attribute[${index}]`}
																			// `items.${index}.item1`
																			name={`attribute.${index}.attributeName`}
																			placeholder="Attribute eg. NAME, ID"
																			// value={element.value}
																			className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
																		/>
																		{formikHandlers.touched.attribute &&
																		attribute[index] &&
																		formikHandlers.errors.attribute &&
																		formikHandlers.errors.attribute[index] &&
																		formikHandlers.touched.attribute[index].attributeName &&
																		formikHandlers.errors.attribute[index]
																			.attributeName ? (
																			<label className="pt-1 text-red-500 text-xs h-5">
																				{
																					formikHandlers.errors.attribute[index]
																						.attributeName
																				}
																			</label>
																		) : (
																			<label className="pt-1 text-red-500 text-xs h-5"></label>
																		)}
																		</div>

    return (
        <>
            <div className='px-4 pt-6'>
                <div className="mb-4 col-span-full xl:mb-2">
                    <div className='ml-6'>
                        <BreadCrumbs />
                    </div>
                    <div className='flex items-center content-between'>
                        <h1 className="ml-6 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                            Create Schema
                        </h1>
                        <Button
                            type="submit"
                            color='bg-primary-800'
                            onClick={() => {
                                window.location.href = '/organizations/schemas'
                            }}
                            className='bg-secondary-700 ring-primary-700 bg-transparent ring-2 text-primary-700 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr- ml-auto'
                            style={{ height: '2.5rem', width: '5rem', minWidth: '2rem' }}
                        >
                            <svg className='mr-1' xmlns="http://www.w3.org/2000/svg" width="22" height="12" fill="none" viewBox="0 0 30 20">
                                <path fill="#1F4EAD" d="M.163 9.237a1.867 1.867 0 0 0-.122 1.153c.083.387.287.742.587 1.021l8.572 7.98c.198.19.434.343.696.447a2.279 2.279 0 0 0 1.657.013c.263-.1.503-.248.704-.435.201-.188.36-.41.468-.655a1.877 1.877 0 0 0-.014-1.543 1.999 1.999 0 0 0-.48-.648l-4.917-4.576h20.543c.568 0 1.113-.21 1.515-.584.402-.374.628-.882.628-1.411 0-.53-.226-1.036-.628-1.41a2.226 2.226 0 0 0-1.515-.585H7.314l4.914-4.574c.205-.184.368-.404.48-.648a1.878 1.878 0 0 0 .015-1.542 1.99 1.99 0 0 0-.468-.656A2.161 2.161 0 0 0 11.55.15a2.283 2.283 0 0 0-1.657.013 2.154 2.154 0 0 0-.696.447L.626 8.589a1.991 1.991 0 0 0-.463.648Z" />
                            </svg>

																		{formikHandlers.touched.attribute &&
																		attribute[index] &&
																		formikHandlers.errors.attribute &&
																		formikHandlers.errors.attribute[index] &&
																		formikHandlers.touched.attribute[index].schemaDataType &&
																		formikHandlers.errors.attribute[index]
																			.schemaDataType ? (
																			<label className="pt-1 text-red-500 text-xs h-5">
																				{
																					formikHandlers.errors.attribute[index]
																						.schemaDataType
																				}
																			</label>
																		) : (
																			<label className="pt-1 text-red-500 text-xs h-5"></label>
																		)}
																		</div>
																		<div className='md:w-1/3 sm:w-full flex-col md:flex m-2'>
																		<Field
																			id={`attribute[${index}]`}
																			name={`attribute.${index}.displayName`}
																			placeholder="Display Name"
																			className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 "
																		/>

																	{formikHandlers.errors.attribute &&
																		formikHandlers.touched.attribute &&
																		attribute[index] &&
																		formikHandlers.errors.attribute &&
																		formikHandlers.errors.attribute[index] &&
																		formikHandlers.touched.attribute[index].displayName &&
																		formikHandlers.errors.attribute[index]
																			.displayName ? (
																			<label className="pt-1 text-red-500 text-xs h-5">
																				{
																					formikHandlers.errors.attribute[index]
																						.displayName
																				}
																			</label>
																		) : (
																			<label className="pt-1 text-red-500 text-xs h-5"></label>
																		)}
																		</div>
																		{index === 0 && attribute.length === 1 ? (
																			''
																		) : (
																			<div key={index}>
																				<Button
																					data-testid="deleteBtn"
																					type="button"
																					color="primary"
																					className="mt-2 "
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
																			>
																				<svg
																					xmlns="http://www.w3.org/2000/svg"
																					fill="none"
																					viewBox="0 0 24 24"
																					stroke-width="1.5"
																					stroke="currentColor"
																					className="w-4 h-4 mr-1"
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
											type="submit"
											color="bg-primary-700"
											className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
											isProcessing={createloader}
											disabled={createloader}
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
									<div className="float-right p-2">
										<Button
											type="reset"
											className="text-base font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
										>
											<svg
												className="pr-2"
												xmlns="http://www.w3.org/2000/svg"
												width="24"
												height="24"
												fill="none"
												viewBox="0 0 20 20"
											>
												<path
													fill="#fff"
													d="M20 10.007a9.964 9.964 0 0 1-2.125 6.164 10.002 10.002 0 0 1-5.486 3.54 10.02 10.02 0 0 1-6.506-.596 9.99 9.99 0 0 1-4.749-4.477A9.958 9.958 0 0 1 3.402 2.525a10.012 10.012 0 0 1 12.331-.678l-.122-.355A1.135 1.135 0 0 1 16.34.057a1.143 1.143 0 0 1 1.439.726l1.11 3.326a1.107 1.107 0 0 1-.155.998 1.11 1.11 0 0 1-.955.465h-3.334a1.112 1.112 0 0 1-1.11-1.108 1.107 1.107 0 0 1 .788-1.043 7.792 7.792 0 0 0-9.475.95 7.746 7.746 0 0 0-1.451 9.39 7.771 7.771 0 0 0 3.73 3.37 7.794 7.794 0 0 0 9.221-2.374 7.75 7.75 0 0 0 1.63-4.75 1.107 1.107 0 0 1 1.112-1.109A1.112 1.112 0 0 1 20 10.007Z"
												/>
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

                                }}
                            >
                                {(formikHandlers): JSX.Element => (
                                    <Form onSubmit={formikHandlers.handleSubmit}>
                                        <div className=" flex items-center space-x-4 ">
                                            <div className='w-1/3 flex flex-col'>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label htmlFor="schema" value="Schema" />
                                                    <span className='text-red-600'>*</span>
                                                </div>
                                                <div className="flex flex-col"> {/* Wrap the field and error message in a flex container */}
                                                    <Field
                                                        id="schemaName"
                                                        name="schemaName"
                                                        placeholder="Schema Name eg. PAN CARD"
                                                        className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    />
                                                    {formikHandlers.errors && formikHandlers.touched.schemaName && formikHandlers.errors.schemaName ? (
                                                        <label className="pt-1 text-red-500 text-xs h-5">{formikHandlers.errors.schemaName}</label>
                                                    ) : (
                                                        <label className="pt-1 text-red-500 text-xs h-5"></label>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='w-1/3 flex flex-col'>
                                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Label htmlFor="schema" value="Version" />
                                                    <span className='text-red-600'>*</span>
                                                </div>
                                                <div className="flex flex-col"> {/* Wrap the field and error message in a flex container */}
                                                    <Field
                                                        id="schemaVersion"
                                                        name="schemaVersion"
                                                        placeholder="eg. 0.1 or 0.0.1"
                                                        className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    />
                                                    {formikHandlers.errors && formikHandlers.touched.schemaVersion && formikHandlers.errors.schemaVersion ? (
                                                        <label className="pt-1 text-red-500 text-xs h-5">{formikHandlers.errors.schemaVersion}</label>
                                                    ) : (
                                                        <label className="pt-1 text-red-500 text-xs h-5"></label>
                                                    )}
                                                </div>
                                            </div>
                                            {/* <div className='w-1/3'>
                                            <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Label htmlFor="version" value="Version" />
                                                <span className='text-red-600'>*</span>
                                            </div>
                                            <Field
                                                id="schemaVersion"
                                                name="schemaVersion"
                                                placeholder="eg. 0.1 or 0.0.1"
                                                className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            />
                                            {
                                                (formikHandlers?.errors?.schemaVersion && formikHandlers?.touched?.schemaVersion) &&
                                                <span className="text-red-500 text-xs h-30">{formikHandlers?.errors?.schemaVersion}</span>
                                            }
                                        </div> */}
                                        </div>
                                        <div className='pt-8'>
                                            <FieldArray
                                                name="attribute">
                                                {(fieldArrayProps: any): JSX.Element => {
                                                    const { form, remove, push } = fieldArrayProps
                                                    const { values } = form
                                                    const { attribute } = values
                                                    return (
                                                        <>
                                                            <div className="d-flex justify-content-center align-items-center mb-1">
                                                                Attributes <span className="text-red-600">*</span>
                                                            </div>
                                                            <div className='flex flex-col flex-wrap'>
                                                                {attribute.map((element: any, index: any) => (
                                                                    <div key={`attributeList-${index}`} className="">
                                                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white pl-1">
                                                                            Attribute: {index + 1}
                                                                        </label>
                                                                        <div key={index} className="flex pl-1">

                                                                            <Field
                                                                                id={`attribute[${index}]`}
                                                                                name={`attribute[${index}]`}
                                                                                placeholder="Attribute eg. NAME, ID"
                                                                                className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                            />
                                                                            {index === 0 && attribute.length === 1 ? (
                                                                                ''
                                                                            ) : (
                                                                                <div key={index}>
                                                                                    <Button
                                                                                        data-testid="deleteBtn"
                                                                                        type="button"
                                                                                        color="primary"
                                                                                        className="ml-1 "
                                                                                        onClick={() => remove(index)}
                                                                                        disabled={index === 0 && attribute.length === 1}
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                                        </svg>

                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                            {
                                                                                index === attribute.length - 1 &&
                                                                                <Button
                                                                                    id="addSchemaButton"
                                                                                    className="attributes-btn pl-2 ml-1"
                                                                                    type="button"
                                                                                    color="primary"
                                                                                    onClick={() => push('')}
                                                                                    outline
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                                    </svg>
                                                                                </Button>
                                                                            }
                                                                        </div>
                                                                        {formikHandlers.errors && formikHandlers.errors.attribute && formikHandlers.touched.attribute && formikHandlers.errors.attribute[index] ? (
                                                                            <span className="text-red-500 text-xs">{formikHandlers.errors.attribute[index]}</span>
                                                                        ) : (
                                                                            <span className="error-message-height"></span>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                            </div>
                                                        </>
                                                    )
                                                }}
                                            </FieldArray>
                                        </div>

                                        {
                                            failure &&
                                            <div className='pt-1'>
                                                <Alert
                                                    color="failure"
                                                    onDismiss={() => setFailure(null)}
                                                >
                                                    <span>
                                                        <p>
                                                            {failure}
                                                        </p>
                                                    </span>
                                                </Alert>
                                            </div>
                                        }
                                        <div className='float-right p-2'>
                                            <Button
                                                type="submit"
                                                color='bg-primary-700'
                                                className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                                                isProcessing={createloader}
                                                disabled={createloader}
                                            ><svg className='pr-2' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                                                </svg>

                                                Create
                                            </Button>
                                        </div>
                                        <div className='float-right p-2'>
                                            <Button
                                                type="reset"
                                                color='bg-primary-800'
                                                className='dark:text-white bg-primary-700 bg-transparent ring-primary-700 ring-2 text-primary-700 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto'
                                                style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                                            >
                                                <svg className='pr-2' xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 25 25">
  																						<path fill="#1F4EAD" fill-rule="evenodd" d="M12.5 0v2.778c5.36 0 9.722 4.36 9.722 9.722 0 5.361-4.362 9.722-9.722 9.722-5.36 0-9.722-4.36-9.722-9.722a9.7 9.7 0 0 1 2.778-6.78v3.308h2.777v-7.64H.694v2.779h2.488A12.489 12.489 0 0 0 0 12.5C0 19.392 5.607 25 12.5 25S25 19.392 25 12.5 19.393 0 12.5 0Z" clip-rule="evenodd"/>
																								</svg>



                                                Reset
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </Card >
                </div>
            </div>
        </>

    )
}


export default CreateSchema 
