import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import BreadCrumbs from '../BreadCrumbs';
import { Button } from 'flowbite-react';
import { Field, Form, Formik } from 'formik';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { createOobProofRequest } from '../../api/verification';
import { AutoAccept, DidMethod, ProtocolVersion, RequestType } from '../../common/enums';
import type { AxiosResponse } from 'axios';
import { getFromLocalStorage, removeFromLocalStorage } from '../../api/Auth';
import type { IEmailValues, IPredicate, IRequestedAttributes, ISelectedAttributes } from './interface';
import { getOrganizationById } from '../../api/organization';
import { pathRoutes } from '../../config/pathRoutes';
import { AlertComponent } from '../AlertComponent';
import React from 'react';

const EmailVerification = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [emailInputs, setEmailInputs] = useState([{ value: '' }]);
    const [w3cSchema, setW3cSchema] = useState<boolean>(false);

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newEmailInputs = [...emailInputs];
        newEmailInputs[index].value = event.target.value;
        setEmailInputs(newEmailInputs);
    };

    const handleAddInput = () => {
        setEmailInputs([...emailInputs, { value: '' }]);
    };

    const handleDeleteInput = (index: number) => {
        if (emailInputs.length > 1) {
            const newEmailInputs = emailInputs.filter((_, i) => i !== index);
            setEmailInputs(newEmailInputs);
        }
    };

    const getOrganizationDetails = async () => {
        setLoading(true);
        const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
        const response = await getOrganizationById(orgId);
        const { data } = response as AxiosResponse;
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            const did = data?.data?.org_agents?.[0]?.orgDid;

            if (did.includes(DidMethod.POLYGON) || did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
                setW3cSchema(true);
            }
            if (did.includes(DidMethod.INDY)) {
                setW3cSchema(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        getOrganizationDetails();
    }, []);

    const handleSubmit = async (values: IEmailValues) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            let payload;

            if (w3cSchema) {
                const getSelectedW3CSchemaDetails = await getFromLocalStorage(storageKeys.ATTRIBUTE_DATA);

                const parsedW3CSchemaDetails = JSON.parse(getSelectedW3CSchemaDetails);
                const groupedAttributes = parsedW3CSchemaDetails
                    .filter(attribute => attribute.isChecked)
                    .reduce((acc, attribute) => {
                        const schemaUri = attribute.schemaId;
                        if (!acc[schemaUri]) {
                            acc[schemaUri] = {
                                id: attribute.schemaId.split('/').pop(),
                                name: attribute.schemaName,
                                schema: [{ uri: schemaUri }],
                                constraints: {
                                    fields: []
                                },
                                purpose: "Verify proof"
                            };
                        }
                        acc[schemaUri].constraints.fields.push({
                            path: `$.credentialSubject['${attribute.attributeName}']`
                        });
                        return acc;
                    }, {});

                const inputDescriptors = Object.values(groupedAttributes).map((descriptor) => ({
                    ...descriptor,
                    constraints: {
                        fields: [{
                            path: descriptor.constraints.fields.map(field => field.path)
                        }]
                    }
                }));

                payload = {
                    goalCode: "verification",
                    willConfirm: true,
                    protocolVersion: ProtocolVersion.V2,
                    presentationDefinition: {
                        id: "32f54163-7166-48f1-93d8-ff217bdb0653",
                        input_descriptors: inputDescriptors
                    },
                    comment: "proof request",
                    autoAcceptProof: AutoAccept.NEVER,
                    emailId: values.emailData.map(input => input.email),
                    reuseConnection: true
                };
            } else {

                const selectedAttributes = await getFromLocalStorage(storageKeys.ATTRIBUTE_DATA);
                const parsedSelectedAttributes = JSON.parse(selectedAttributes) || [];

                const selectedAttributesDetails = parsedSelectedAttributes.filter((attr: ISelectedAttributes) => attr.isChecked && attr.dataType !== 'number') || [];
                const selectedPredicatesDetails = parsedSelectedAttributes.filter(attr => attr.isChecked && attr.dataType === 'number') || [];

                const requestedAttributes: Record<string, IRequestedAttributes> = {};
                const requestedPredicates: Record<string, IPredicate> = {};

                const attributeGroups = selectedAttributesDetails.reduce((acc, attr) => {
                    const key = `${attr.attributeName}:${attr.schemaId}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(attr.credDefId);
                    return acc;
                }, {} as Record<string, string[]>);

                Object.keys(attributeGroups).forEach(key => {

                    const parts = key.split(':');
                    const attributeName = parts[0];
                    const schemaId = parts.slice(1).join(':');

                    if (!requestedAttributes[attributeName]) {
                        requestedAttributes[attributeName] = {
                            name: attributeName,
                            restrictions: [],
                        };
                    }
                    requestedAttributes[attributeName].restrictions.push(...attributeGroups[key].map(credDefId => ({
                        schema_id: schemaId,
                        cred_def_id: credDefId,
                    })));
                });

                selectedPredicatesDetails.forEach(attr => {
                    if (attr.isChecked && attr.dataType === 'number') {
                        requestedPredicates[attr.attributeName] = {
                            name: attr.attributeName,
                            p_type: attr.selectedOption,
                            p_value: Number(attr.value),
                            restrictions: [
                                {
                                    schema_id: attr.schemaId,
                                    cred_def_id: attr.credDefId,
                                },
                            ],
                        };
                    }
                });

                const proofFormats = {
                    indy: {
                        name: "proof-request",
                        version: "1.0",
                        requested_attributes: requestedAttributes,
                        requested_predicates: requestedPredicates,
                    },
                };

                payload = {
                    goalCode: "verification",
                    reuseConnection: true,
                    protocolVersion: ProtocolVersion.V1,
                    isShortenUrl: true,
                    autoAcceptProof: AutoAccept.NEVER,
                    emailId: values.emailData.map(input => input.email),
                    proofFormats,
                };
            }

            const requestType = w3cSchema ? RequestType.PRESENTATION_EXCHANGE : RequestType.INDY;
            const response = await createOobProofRequest(payload, requestType);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
                await removeFromLocalStorage(storageKeys.ATTRIBUTE_DATA);
                window.location.href = pathRoutes.organizations.credentials;

            } else {
                setErrorMessage('Failed to create proof request');
                console.error('API response data:', data);
            }
        } catch (error) {
            console.error('Error during handleSubmit:', error);
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 pt-2">
            <div className="mb-4 col-span-full xl:mb-2">
                <div className="flex justify-between items-center">
                    <BreadCrumbs />
                </div>
                <div>
                    <h1 className="ml-1 mt-4 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                        Request Proof(s) to Email ID
                    </h1>
                    <span className="text-md text-gray-400">
                        Please enter an email address to request a proof to
                    </span>
                </div>
            </div>
            {(errorMessage) && (
                <AlertComponent
                    message={errorMessage}
                    type={errorMessage ? 'failure' : 'success'}
                    onAlertClose={() => {
                        setErrorMessage(null);
                    }}
                />
            )}
            <div>
                <div className="flex flex-col justify-between">
                    <div className="relative">
                        <div className="m-0" id="createSchemaCard">
                            <div>
                                <Formik
                                    initialValues={{
                                        emailData: emailInputs.map(input => ({ email: input.value })),
                                    }}
                                    validationSchema={Yup.object().shape({
                                        emailData: Yup.array().of(
                                            Yup.object().shape({
                                                email: Yup.string()
                                                    .email('Invalid email address')
                                                    .required('Email is required'),
                                            }),
                                        ),
                                    })}
                                    validateOnBlur
                                    validateOnChange
                                    enableReinitialize
                                    onSubmit={handleSubmit
                                    }
                                >
                                    {({ values, errors, touched, resetForm }) => (
                                        <Form>
                                            <div className="pb-4">
                                                {values.emailData.map((input, index) => (
                                                    <div key={index} className="">
                                                        <div
                                                            className="px-4 pt-8 pb-10 mb-4 rounded-lg border border-gray-200"
                                                        >
                                                            <div className="flex justify-between">
                                                                <div className="relative flex items-start gap-2 mb-4 w-10/12">
                                                                    <label
                                                                        className="font-semibold text-base dark:text-white mt-2"
                                                                        style={{ minWidth: '80px' }}
                                                                        htmlFor={`email-${index}`}
                                                                    >
                                                                        Email ID<span className="text-red-500">*</span>
                                                                    </label>
                                                                    <div className="flex flex-col w-full md:w-5/12">
                                                                        <Field
                                                                            name={`emailData.${index}.email`}
                                                                            placeholder="email"
                                                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleInputChange(index, event)}
                                                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-md rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                        />
                                                                        {errors.emailData?.[index]?.email && touched.emailData?.[index]?.email && (
                                                                            <span className="text-red-500 text-xs mt-1">
                                                                                {errors.emailData[index].email}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {values.emailData.length > 1 && (
                                                                    <button
                                                                        data-testid="deleteBtn"
                                                                        type="button"
                                                                        color="danger"
                                                                        onClick={() => handleDeleteInput(index)}
                                                                        className="sm:w-2/12 flex text-red-600 justify-end focus:outline-none"
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
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="absolute flex justify-center w-full">
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddInput}
                                                        className={`bottom-0 focus:ring-primary-700 focus:ring-2 dark:focus:ring-gray-500 text-primary-700 hover:text-white dark:disabled:text-secondary-disabled disabled:text-primary-disabled bg-white hover:enabled:bg-primary-700 dark:text-white dark:bg-gray-700 dark:hover:enabled:!bg-gray-500 dark:hover:enabled:!text-gray-50 border border-primary-700 disabled:border-primary-disabled dark:border-gray-600 absolute w-max left-[50%] translate-x-[-50%] m-auto flex flex-row items-center rounded-full disabled:opacity-100 group`}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="w-6 h-6"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span className="ml-1 my-0.5">Add another</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-4">
                                                <Button
                                                    type="button"
                                                    color="bg-primary-800"
                                                    onClick={() => {
                                                        resetForm();
                                                        setEmailInputs([{ value: '' }]);
                                                    }}
                                                    disabled={loading}
                                                    className="dark:text-white bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-base px-4 lg:px-5 py-2 lg:py-2.5 ml-auto dark:hover:text-black"
                                                    style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
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
                                                    color="bg-primary-800"
                                                    className="text-white py-1 items-center justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                    isProcessing={loading}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        fill="none"
                                                        viewBox="0 0 20 20"
                                                        className="mr-2 dark:text-white dark:group-hover:text-primary-700"
                                                    >
                                                        <path
                                                            fill="currentColor"
                                                            d="M8.828 12.171a.75.75 0 0 0 1.06 0l7-7a.75.75 0 0 0-1.06-1.06L9.358 10.44l-3.56-3.56a.75.75 0 0 0-1.06 1.06l4 4Z"
                                                        />
                                                    </svg>
                                                    Request Proof
                                                </Button>
                                            </div>
                                        </Form>

                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
