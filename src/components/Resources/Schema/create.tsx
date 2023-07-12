'use client';

import type { AxiosResponse } from 'axios';
import { Alert, Button, Card, Label, Table, } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { addSchema } from '../../../api/Schema';
import SchemaCard from '../../../commonComponents/schemaCard';
import * as yup from 'yup';
import { schemaVersionRegex } from '../../../config/CommonConstant';
import BreadCrumbs from '../../BreadCrumbs';

interface Values {
    schemaName: string;
    schemaVersion: string;
    attribute: string[];
}

const CreateSchema = () => {
    const [erroMsg, setErrMsg] = useState<string | null>(null)

    const submit = async (values: Values) => {
        const fieldName: any = {}
        fieldName['schemaName'] = values.schemaName
        fieldName['schemaVersion'] = values.schemaVersion
        fieldName['attributes'] = values.attribute
        fieldName['orgId'] = 2
        fieldName['orgDid'] = 'did:indy:bcovrin:2XKsaGBrgRoAqNcSycUvKK'
        const createSchema: any = await addSchema(fieldName);
    }

    return (
        <>
            <div className="mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Create Schema
                </h1>
            </div>
            <div>
                <div
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                <Card >
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
                                    submit(values)
                                })

                            }}
                        >
                            {(formikHandlers): JSX.Element => (
                                <Form onSubmit={formikHandlers.handleSubmit}>
                                    <div className=" flex items-center space-x-4">
                                        <div className='w-1/3'>
                                            <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <Label htmlFor="schema" value="Schema" />
                                                <span className='text-red-600'>*</span>
                                            </div>
                                            <Field
                                                id="schemaName"
                                                name="schemaName"
                                                placeholder="Schema Name eg. PAN CARD"
                                                className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            />
                                            {
                                                (formikHandlers?.errors?.schemaName && formikHandlers?.touched?.schemaName) &&
                                                <span className="text-red-500 text-xs">{formikHandlers?.errors?.schemaName}</span>
                                            }
                                        </div>
                                        <div className='w-1/3'>
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
                                                <span className="text-red-500 text-xs">{formikHandlers?.errors?.schemaVersion}</span>
                                            }
                                        </div>
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
                                                        <div className='flex items-end'>
                                                            {attribute.map((element: any, index: any) => (
                                                                <div key={`attributeList-${index}`} className="pl-0">
                                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                        Attribute: {index + 1}
                                                                    </label>
                                                                    <div key={index} className="flex pl-2">
                                                                        {/* <input
                                                                        name={`attribute[${index}]`}
                                                                        className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                        placeholder="Enter attribute"
                                                                    /> */}

                                                                        <Field
                                                                            id={`attribute[${index}]`}
                                                                            name={`attribute[${index}]`}
                                                                            placeholder="Attribute eg. NAME, ID"
                                                                            className="w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                        />
                                                                        {index === 0 && attribute.length === 1 ? (
                                                                            ''
                                                                        ) : (
                                                                            <Button
                                                                                data-testid="deleteBtn"
                                                                                type="button"
                                                                                className=""
                                                                                onClick={() => remove(index)}
                                                                                disabled={index === 0 && attribute.length === 1}
                                                                            >
                                                                                {/* <Icon.Trash2 size={18} /> */}
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                                </svg>

                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    {formikHandlers.errors && formikHandlers.errors.attribute && formikHandlers.touched.attribute && formikHandlers.errors.attribute[index] ? (
                                                                        <span className="text-red-500 text-xs">{formikHandlers.errors.attribute[index]}</span>
                                                                    ) : (
                                                                        <span className="error-message-height"></span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <Button
                                                                className="attributes-btn pl-2"
                                                                type="button"
                                                                color="primary"
                                                                onClick={() => push('')}
                                                                outline
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                </svg>


                                                            </Button>
                                                        </div>
                                                    </>
                                                )
                                            }}
                                        </FieldArray>
                                    </div>

                                    {
                                        erroMsg &&
                                        <Alert
                                            color="failure"
                                            onDismiss={() => setErrMsg(null)}
                                        >
                                            <span>
                                                <p>
                                                    {erroMsg}
                                                </p>
                                            </span>
                                        </Alert>
                                    }
                                    {/* <div > */}
                                    <div className='float-right p-2'>
                                        <Button
                                            type="submit"
                                            color='bg-primary-800'
                                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                                        >
                                            Create
                                        </Button>
                                    </div>
                                    <div className='float-right p-2'>
                                        <Button
                                            type="reset"
                                            className="text-base font-medium text-center text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 sm:w-auto dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-700"
                                        >
                                            Reset
                                        </Button>


                                    </div>
                                    {/* </div> */}
                                </Form>
                            )}
                        </Formik>
                    </div>
                    {/* <>
                    {errorMessage && <CustomErrorComponent
                        title=''
                        message={errorMessage}
                        alertType='danger'
                    />}
                </> */}
                </Card >
            </div>
        </div>
        </>

    )
}


export default CreateSchema 