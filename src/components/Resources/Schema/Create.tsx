'use client';

import * as yup from 'yup';

import { Alert, Button, Card, Label } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { apiStatusCodes, schemaVersionRegex, storageKeys } from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import type { FieldName } from './interfaces';
import { addSchema } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { ICheckEcosystem, checkEcosystem, getEcosystemId } from '../../../config/ecosystem';
import { createSchemaRequest } from '../../../api/ecosystem';
import ConfirmModal from '../../../commonComponents/ConfirmPopup';
import EcosystemProfileCard from '../../../commonComponents/EcosystemProfileCard'
import React from 'react';

const options = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'time', label: 'Time' },
    { value: 'datetime-local', label: 'Date & Time' },
];

interface IAttributes {
    id?: string
    attributeName: string
    schemaDataType: string
    displayName: string
}
interface IFormData {
    schemaName: string
    schemaVersion: string
    attribute: IAttributes[]
}


const CreateSchema = () => {
    const [failure, setFailure] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string>('');
    const [createLoader, setCreateLoader] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState(false)
    const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();

    const initFormData: IFormData = {
        schemaName: '',
        schemaVersion: '',
        attribute: [
            {
                attributeName: '',
                schemaDataType: 'string',
                displayName: '',
            }
        ]
    }
    const [formData, setFormData] = useState(initFormData)
    useEffect(() => {
        const fetchData = async () => {
            const organizationId = await getFromLocalStorage(
                storageKeys.ORG_ID);
            setOrgId(organizationId);
        };

        fetchData();

        const checkEcosystemData = async () => {
            const data: ICheckEcosystem = await checkEcosystem();
            setIsEcosystemData(data)
        }

        checkEcosystemData();

    }, []);

    const submit = async (values: IFormData) => {
        setCreateLoader(true);
        const schemaFieldName: FieldName = {
            schemaName: values.schemaName,
            schemaVersion: values.schemaVersion,
            attributes: values.attribute,
            orgId,
        };

        const createSchema = await addSchema(schemaFieldName, orgId);
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

    const submitSchemaCreationRequest = async (values: IFormData) => {
        setCreateLoader(true);
        const schemaFieldName = {
            endorse: true,
            attributes: values.attribute,
            version: values.schemaVersion,
            name: values.schemaName,
        }

        const id = await getEcosystemId()

        const createSchema = await createSchemaRequest(schemaFieldName, id, orgId);
        const { data } = createSchema as AxiosResponse;
        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            setCreateLoader(false);
            window.location.href = pathRoutes.ecosystem.endorsements;
        } else {
            setCreateLoader(false);
            setFailure(createSchema as string);
            setTimeout(() => {
                setFailure(null);
            }, 4000);
        }
        setShowPopup(false)
    };

    const formTitle = isEcosystemData?.isEcosystemMember ? "Schema Endorsement" : "Create Schema"
    const submitButtonTitle = isEcosystemData?.isEcosystemMember ? {
        title: "Request Endorsement",
        svg: <svg className='mr-2 mt-1' xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 25 25">
            <path fill="currentColor" d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z" />
        </svg>
    } : {
        title: "Create",
        svg: <div className='pr-3'>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
            </svg>
        </div>
    }

    const confirmCreateSchema = () => {
        if (isEcosystemData?.isEnabledEcosystem && isEcosystemData?.isEcosystemMember) {
            console.log("Submitted for endorsement by ecosystem member")
            submitSchemaCreationRequest(formData)
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
    }

    return (
        <div className="px-4 pt-2">
            <div className="pl-6 mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
            </div>
            {
                isEcosystemData?.isEnabledEcosystem &&
                <div className='pb-3 mx-6 mb-6'>
                    <EcosystemProfileCard />
                </div>
            }
            <h1 className="md:pl-6 mb-4 col-span-full xl:mb-2 ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                {formTitle}
            </h1>
            <div>
                <Card className="m-0 md:m-6" id="createSchemaCard">
                    <div>
                        <Formik
                            initialValues={formData}
                            validationSchema={yup.object().shape({
                                schemaName: yup.string().trim().required('Schema is required'),
                                schemaVersion: yup
                                    .string()
                                    .matches(schemaVersionRegex, 'Enter valid schema version (eg. 0.1 or 0.0.1)')
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
                                setFormData(values)
                                setShowPopup(true)
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
                                                        <div className="dark:text-white d-flex justify-content-center align-items-center mb-1">
                                                            Attributes <span className="text-red-600">*</span>

                                                        </div>
                                                        <div className="flex flex-col">
                                                            {attribute.map((element: IAttributes, index: number) => (
                                                                <div
                                                                    key={`attributeList-${index}`}
                                                                    className="mt-5"
                                                                >
                                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white pl-1">
                                                                        Attribute: {index + 1}
                                                                    </label>
                                                                    <Card className='cursor-pointer overflow-hidden overflow-ellipsis' style={{ overflow: 'auto' }}>
                                                                        <div key={element.id} className="grid min-[320]:grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-4">
                                                                            <div className="">
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

                                                                            <div className="">
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
                                                                                                key={opt.value}
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
                                                                            <div className="">
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



                                                                            <div className='sm:w-full items-center flex flex-wrap min-[320]:justify-between min-[320]:space-x-2 xl:space-x-6'>
                                                                                {index === 0 && attribute.length === 1 ? (
                                                                                    <div key={element.id} className="sm:w-0.5/3 text-red-600 hidden">
                                                                                        <Button
                                                                                            data-testid="deleteBtn"
                                                                                            type="button"
                                                                                            color="danger"
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
                                                                                ) : (

                                                                                    <div key={element.id} className="sm:w-0.5/3 text-red-600">
                                                                                        <Button
                                                                                            data-testid="deleteBtn"
                                                                                            type="button"
                                                                                            color="danger"
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
                                                                                    <div key={element.id} className="justify-end sm:w-2.5/3 text-red-600 sm:ml-0 md:ml-0 lg:ml-0">

                                                                                        <Button
                                                                                            id="addSchemaButton"
                                                                                            className="text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
                                                                                                width="22"
                                                                                                height="22"
                                                                                                fill="none"
                                                                                                viewBox="0 0 24 24"
                                                                                                strokeWidth={2.5}
                                                                                                stroke="currentColor"
                                                                                            >
                                                                                                <path
                                                                                                    fill="#fff"
                                                                                                    stroke-linecap="round"
                                                                                                    stroke-linejoin="round"
                                                                                                    d="M12 4.5v15m7.5-7.5h-15"
                                                                                                />
                                                                                            </svg>
                                                                                            <span className="hidden xl:inline-block ml-2">
                                                                                                Add
                                                                                            </span>
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                );
                                            }}
                                        </FieldArray>
                                    </div>

                                    {failure && (
                                        <div className="pt-4">
                                            <Alert color="failure" onDismiss={() => setFailure(null)}>
                                                <span>
                                                    <p>{failure}</p>
                                                </span>
                                            </Alert>
                                        </div>
                                    )}
                                    <div className="float-right mt-4 ml-4">
                                        <Button
                                            type="submit"
                                            color="bg-primary-700"
                                            disabled={
                                                !formikHandlers.isValid
                                            }
                                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 lg:px-5 py-2 lg:py-2.5 ml-auto min-w-[6rem] h-[2.6rem]'
                                        >
                                            {submitButtonTitle.svg}
                                            {submitButtonTitle.title}
                                        </Button>
                                    </div>
                                    <div className="float-right mt-4">
                                        <Button
                                            type="reset"
                                            color='bg-primary-800'
                                            disabled={createLoader}
                                            className='dark:text-white bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 ml-auto dark:hover:text-black'

                                            style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className='mr-2 dark:text-white dark:group-hover:text-primary-700' width="18" height="18" fill="none" viewBox="0 0 20 20">
                                                <path fill="currentColor" d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z" />
                                            </svg>

                                            Reset
                                        </Button>
                                    </div>

                                    <ConfirmModal openModal={showPopup} closeModal={() => setShowPopup(false)} onSuccess={confirmCreateSchema} message={"Would you like to proceed? Keep in mind that this action cannot be undone."} isProcessing={createLoader} />

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
