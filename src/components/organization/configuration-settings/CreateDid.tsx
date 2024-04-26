import * as yup from 'yup';
import { Button, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import {
    apiStatusCodes,
} from '../../../config/CommonConstant';
import { useEffect, useState } from 'react';
import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import { createDid } from '../../../api/organization';
import type { EditOrgdetailsModalProps } from '../interfaces';
import { getLedgerConfig } from '../../../api/Agent'
import { DidMethod } from '../../../common/enums';
import { nanoid } from 'nanoid';

interface IFormikValues {
    ledger: string;
    method: string;
    network: string;
    domain: string;
}

const CreateDIDModal = (props: EditOrgdetailsModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [mappedData, setMappedData] = useState({})
    const [erroMsg, setErrMsg] = useState<string | null>(null);
    const [seed, setSeeds] = useState('')
    const [selectedMethod, setSelectedMethod] = useState('');

    const fetchLedgerConfig = async () => {
        try {
            const { data } = await getLedgerConfig() as AxiosResponse;
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const obj = {};
                data.data.forEach((item) => {
                    obj[item.name.toLowerCase()] = { ...item.details };
                });
                setMappedData(obj);
            }
        } catch (err) {
            console.log('Fetch Network ERROR::::', err);
        }
    };

    const submitUpdateOrganization = async (values: IFormikValues) => {
        setLoading(true);
        console.log(324324, values);

        const didData = {
            "seed": seed,
            "keyType": "ed25519",
            "method": values.method,
            "network": values.method === DidMethod.POLYGON ? `${values.method}:${values.network}` : values.method !== DidMethod.KEY ? `${values.ledger}:${values.network}` : '',
            "domain": values.method === DidMethod.WEB ? values.domain : '',
            "role": values.method === DidMethod.INDY ? "endorser" : "", //endorser
            "privatekey": "",
            "endpoint": "",
            "did": "", //XzFjo1RTZ2h9UVFCnPUyaQ
            "endorserDid": "", //did:indy:bcovrin:testnet:UEeW111G1tYo1nEkPwMcF
            "isPrimaryDid": false
        }

        console.log(2342341212, didData);

        try {
            const response = await createDid(didData);
            console.log(22234234, response);
            
            const { data } = response as AxiosResponse;
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                if (props?.onEditSucess) {
                    props?.onEditSucess();
                }
                props.setOpenModal(false);
                props.setMessage(data?.message);
                setLoading(false);
                window.location.reload()
            } else {
                setErrMsg(response as string);
                setLoading(false);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setLoading(false);
        }
    };

    const showMethod = (method: string, selectedLedger: string, selectedMethod: string, selectedNetwork: string): string => {
        console.log(234234111, mappedData, method, selectedLedger, selectedMethod, selectedNetwork);
        switch (method) {
            case DidMethod.POLYGON: {
                return mappedData && selectedNetwork && method ? mappedData[method][selectedNetwork] || ''
                    : ""
            }
            case DidMethod.INDY: {
                return mappedData &&
                    selectedLedger &&
                    selectedNetwork &&
                    method ?
                    mappedData[method][selectedLedger][selectedNetwork] || ''
                    : ""
            }
            case DidMethod.KEY:
            case DidMethod.WEB: {
                return mappedData && method ? mappedData[method][method] || '' : ""
            }
            default:
                return "";
        }
    };

    useEffect(() => {
        fetchLedgerConfig()
        setSeeds(nanoid(32));
    }, [])

    console.log(234234, mappedData);

    const validations = {
        method: yup
            .string()
            .required('Method is required')
            .trim(),
        ledger: yup
            .string(),
        network: yup
            .string(),
        domain: yup
            .string()
    }

    if (selectedMethod === DidMethod.WEB) {
        validations["domain"] = yup
            .string()
            .required('Domain is required')
            .trim()
    }

    if (selectedMethod === DidMethod.POLYGON) {
        validations["network"] = yup
            .string()
            .required('Network is required')
            .trim()
    }

    if (selectedMethod === DidMethod.INDY) {
        validations["ledger"] = yup
            .string()
            .required('Ledger is required'),
            validations["network"] = yup
                .string()
                .required('Network is required')
    }

    return (
        <Modal
            show={props.openModal}
            onClose={() => {
                props.setOpenModal(false);
                setErrMsg(null);
            }}
        >
            <Modal.Header>Create DID</Modal.Header>
            <Modal.Body>
                <AlertComponent
                    message={erroMsg}
                    type={'failure'}
                    onAlertClose={() => {
                        setErrMsg(null);
                    }}
                />
                <Formik
                    initialValues={{
                        method: '',
                        ledger: '',
                        network: '',
                        domain: ''
                    }}
                    validationSchema={yup.object().shape(validations)}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={async (
                        values: IFormikValues,
                        { resetForm }: FormikHelpers<IFormikValues>,
                    ) => {
                        submitUpdateOrganization(values);
                    }}
                >
                    {(formikHandlers): JSX.Element => {
                        { console.log(324234, formikHandlers?.values?.method, formikHandlers?.values?.ledger) }
                        return (
                            <Form className="" onSubmit={formikHandlers.handleSubmit}>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div className="mb-3 relative">
                                        <label
                                            htmlFor="method"
                                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        >
                                            Method
                                            <span className="text-red-500 text-xs">*</span>
                                        </label>
                                        <select
                                            onChange={(e) => {
                                                formikHandlers.handleChange(e);
                                                formikHandlers.setFieldValue('ledger', '');
                                                formikHandlers.setFieldValue('network', '');
                                                setSelectedMethod(e.target.value);
                                            }}
                                            id="method" name="method" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
                                        >
                                            <option value="">Select Method</option>
                                            {mappedData && Object.keys(mappedData)?.map((method) => (
                                                <option key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</option>
                                            ))}
                                        </select>
                                        {formikHandlers?.errors?.method && formikHandlers?.touched?.method && (
                                            <span className="absolute botton-0 text-red-500 text-xs">{formikHandlers?.errors?.method}</span>
                                        )}
                                    </div>

                                    {formikHandlers.values.method !== DidMethod.POLYGON && formikHandlers.values.method !== DidMethod.KEY && formikHandlers.values.method !== DidMethod.WEB && (

                                        <div className="mb-3 relative">
                                            <label
                                                htmlFor="ledger"
                                                className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                            >
                                                Ledger
                                                <span className="text-red-500 text-xs">*</span>
                                            </label>
                                            <select
                                                onChange={(e) => {
                                                    formikHandlers.handleChange(e);
                                                    formikHandlers.setFieldValue('network', '');
                                                }}
                                                id="ledger" name="ledger" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
                                            >
                                                <option value="">Select Ledger</option>
                                                {mappedData && formikHandlers?.values?.method && mappedData[formikHandlers?.values?.method] &&
                                                    Object.keys(mappedData[formikHandlers?.values?.method])?.map(
                                                        (ledger) => (
                                                            <option key={ledger} value={ledger}>{ledger.charAt(0).toUpperCase() + ledger.slice(1)}</option>
                                                        ),
                                                    )}
                                            </select>
                                            {formikHandlers?.errors?.ledger && formikHandlers?.touched?.ledger && (
                                                <span className="absolute botton-0 text-red-500 text-xs">{formikHandlers?.errors?.ledger}</span>
                                            )}
                                        </div>
                                    )}

                                    {formikHandlers.values.method !== DidMethod.WEB &&
                                        formikHandlers.values.method !== DidMethod.KEY && (
                                            <div className="mb-3 relative">
                                                <label
                                                    htmlFor="network"
                                                    className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Network
                                                    <span className="text-red-500 text-xs">*</span>
                                                </label>
                                                <select
                                                    onChange={formikHandlers.handleChange}
                                                    id="network" name="network" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
                                                >
                                                    <option value="">Select Network</option>
                                                    {mappedData && formikHandlers?.values?.method && mappedData[formikHandlers?.values?.method] &&
                                                        Object.keys(formikHandlers.values.method === DidMethod.INDY && formikHandlers?.values?.ledger ? mappedData[formikHandlers?.values?.method][formikHandlers?.values?.ledger] : mappedData[formikHandlers?.values?.method])?.map(
                                                            (ledger) => (
                                                                <option key={ledger} value={ledger}>{ledger.charAt(0).toUpperCase() + ledger.slice(1)}</option>
                                                            ),
                                                        )}
                                                </select>
                                                {formikHandlers?.errors?.network && formikHandlers?.touched?.network && (
                                                    <span className="absolute botton-0 text-red-500 text-xs">{formikHandlers?.errors?.network}</span>
                                                )}
                                            </div>
                                        )}
                                    {
                                        formikHandlers.values.method === DidMethod.WEB &&
                                        <div>
                                            <div>
                                                <label
                                                    htmlFor="domain"
                                                    className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Domain
                                                    <span className="text-red-500 text-xs">*</span>
                                                </label>
                                                <Field
                                                    id="domain"
                                                    name="domain"
                                                    className="bg-gray-50 min-h-[44px] border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:bg-gray-100"
                                                    placeholder="Enter Domain"
                                                    onChange={formikHandlers.handleChange}
                                                />
                                            </div>
                                            {formikHandlers?.errors?.domain && formikHandlers?.touched?.domain && (
                                                <span className="absolute botton-0 text-red-500 text-xs">{formikHandlers?.errors?.domain}</span>
                                            )}
                                        </div>
                                    }
                                    <div>
                                        <label
                                            htmlFor="did-method"
                                            className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        >
                                            DID Method
                                            <span className="text-red-500 text-xs">*</span>
                                        </label>
                                        <Field
                                            id="did-method"
                                            disabled={true}
                                            name="did-method"
                                            value={showMethod(formikHandlers.values.method, formikHandlers.values.ledger, formikHandlers.values.method, formikHandlers.values.network)}
                                            className="bg-gray-50 min-h-[44px] border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 disabled:bg-gray-100"
                                            placeholder="DID Method"
                                            onChange={formikHandlers.handleChange}
                                        />
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <Button
                                        type="submit"
                                        isProcessing={loading}
                                        className="mb-2 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    >
                                        <svg
                                            className="pr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="22"
                                            height="22"
                                            fill="none"
                                            viewBox="0 0 18 18"
                                        >
                                            <path
                                                stroke="#fff"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 1v12l-4-2-4 2V1h8ZM3 17h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                                            />
                                        </svg>
                                        Save
                                    </Button>
                                </div>
                            </Form>
                        )
                    }}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default CreateDIDModal;
