'use client';

import * as yup from 'yup';

import { Alert, Button, Card, Label, Table, } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { apiStatusCodes, schemaVersionRegex, storageKeys } from '../../../config/CommonConstant';
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
    attribute: string[];
}

const CreateSchema = () => {
    const [failure, setFailure] = useState<string | null>(null)
    const [orgId, setOrgId] = useState<number>(0)
    const [createloader, setCreateLoader] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
            setOrgId(Number(organizationId));
        };

        fetchData();
    }, []);



    const submit = async (values: Values) => {
        setCreateLoader(true)
        const schemaFieldName: FieldName = {
            schemaName: values.schemaName,
            schemaVersion: values.schemaVersion,
            attributes: values.attribute,
            orgId: orgId
        }
        const createSchema = await addSchema(schemaFieldName);
        const { data } = createSchema as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            if (data?.data) {
                setCreateLoader(false)
                window.location.href = pathRoutes.organizations.schemas
            } else {
                setFailure(createSchema as string)
                setCreateLoader(false)
            }
        } else {
            setCreateLoader(false)
            setFailure(createSchema as string)
            setTimeout(() => {
                setFailure(null)
            }, 4000);
        }
    }

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
                            className='bg-secondary-700 ring-primary-700 bg-transparent ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto'
                            style={{ height: '2.5rem', width: '5rem', minWidth: '2rem' }}
                        >
                            <svg className='mr-1' xmlns="http://www.w3.org/2000/svg" width="22" height="12" fill="none" viewBox="0 0 30 20">
                                <path fill="#1F4EAD" d="M.163 9.237a1.867 1.867 0 0 0-.122 1.153c.083.387.287.742.587 1.021l8.572 7.98c.198.19.434.343.696.447a2.279 2.279 0 0 0 1.657.013c.263-.1.503-.248.704-.435.201-.188.36-.41.468-.655a1.877 1.877 0 0 0-.014-1.543 1.999 1.999 0 0 0-.48-.648l-4.917-4.576h20.543c.568 0 1.113-.21 1.515-.584.402-.374.628-.882.628-1.411 0-.53-.226-1.036-.628-1.41a2.226 2.226 0 0 0-1.515-.585H7.314l4.914-4.574c.205-.184.368-.404.48-.648a1.878 1.878 0 0 0 .015-1.542 1.99 1.99 0 0 0-.468-.656A2.161 2.161 0 0 0 11.55.15a2.283 2.283 0 0 0-1.657.013 2.154 2.154 0 0 0-.696.447L.626 8.589a1.991 1.991 0 0 0-.463.648Z" />
                            </svg>

                            Back
                        </Button>
                    </div>

                </div>
                <div>
                    <Card className='p-6 m-6' id='createSchemaCard'>
                        <div>
                            <Formik
                                initialValues={{
                                    schemaName: '',
                                    schemaVersion: '',
                                    attribute: ['']
                                }}
                                validationSchema={yup.object().shape({
                                    schemaName: yup
                                        .string()
                                        .trim()
                                        .required('Schema is required'),
                                    schemaVersion: yup
                                        .string()
                                        .matches(schemaVersionRegex, 'Enter valid schema version')
                                        .required('Schema version is required'),
                                    attribute: yup
                                        .array()
                                        .of(
                                            yup.string()
                                                .trim()
                                                .min(0, 'At least one box must be ticked')
                                                .required("Attribute is required")
                                        )

                                })}
                                validateOnBlur
                                validateOnChange
                                enableReinitialize
                                onSubmit={async (values): Promise<void> => {
                                    const updatedAttribute: Array<number> = []
                                    values.attribute.forEach((element) => {
                                        updatedAttribute.push(Number(element))
                                    })
                                    submit(values)

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
                                                className='dark:text-white bg-primary-700 bg-transparent ring-primary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto'
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
                    </Card >
                </div>
            </div>
        </>

    )
}


export default CreateSchema 