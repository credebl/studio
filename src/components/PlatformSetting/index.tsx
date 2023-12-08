'use client';

import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Field, Form, Formik } from 'formik'
import { Button, Label } from "flowbite-react"
import Toggle from '../../commonComponents/Toggle'
import { updatePlatformSettings, type IPlatformSetting, getPlatformSettings } from '../../api/users';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent'

interface IForm {
    externalIp: string;
    sgApiKey: string;
    apiEndPoint: string;
    emailFrom: string;
    enableEcosystem: boolean;
    multiEcosystemSupport: boolean;
}

interface IMessage {
    type: "success" | "failure",
    message: string
}

const getConfigKeys = (data: AxiosResponse) => {
    const platformConfig = data?.data?.platform_config && data?.data?.platform_config.length > 0 && data?.data?.platform_config[0]
    const ecosystemConfig = data?.data?.ecosystem_config && data?.data?.ecosystem_config.length > 0 && data?.data?.ecosystem_config
    const enableEcosystem = ecosystemConfig?.find((item: { key: string; }) => item.key === "enableEcosystem").value === "true"
    const multiEcosystemSupport = ecosystemConfig?.find((item: { key: string; }) => item.key === "multiEcosystemSupport").value === "true"
    const { externalIp, lastInternalId, sgApiKey, emailFrom, apiEndpoint } = platformConfig || {}
    return {
        externalIp, lastInternalId, sgApiKey, emailFrom, apiEndPoint: apiEndpoint, enableEcosystem, multiEcosystemSupport
    }
}

const PlatformSetting = ({ data }: any) => {
    const { externalIp, lastInternalId, sgApiKey, emailFrom, apiEndPoint, enableEcosystem, multiEcosystemSupport } = getConfigKeys(data)
    const initFormData: IPlatformSetting = {
        externalIp: externalIp || "",
        sgApiKey: sgApiKey || "",
        apiEndPoint: apiEndPoint || "",
        emailFrom: emailFrom || "",
        lastInternalId: lastInternalId || "",
        enableEcosystem: enableEcosystem || false,
        multiEcosystemSupport: multiEcosystemSupport || false
    }
    const [formData, setFormData] = useState(initFormData)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<IMessage>({
        type: "success",
        message: ""
    })

    const setAlertMessage = ({ message, type }: IMessage) => {
        setMessage({
            message,
            type
        })

        if (type === "success") {
            setTimeout(() => {
                setMessage({
                    message: "",
                    type: "success"
                })
            }, 5000);
        }
    }

    const fetchSettings = async () => {
        try {
            const { data } = await getPlatformSettings() as AxiosResponse
            const { externalIp, lastInternalId, sgApiKey, emailFrom, apiEndPoint, enableEcosystem, multiEcosystemSupport } = getConfigKeys(data)
            setFormData({
                externalIp,
                sgApiKey,
                apiEndPoint,
                emailFrom,
                lastInternalId,
                enableEcosystem,
                multiEcosystemSupport
            })
        } catch (err) {
            setAlertMessage({
                message: err.message,
                type: "failure"
            })
        }
    }

    const updateSettings = async (values: IPlatformSetting) => {
        setLoading(true)
        try {
            const { externalIp, lastInternalId, sgApiKey, emailFrom, apiEndPoint, enableEcosystem, multiEcosystemSupport } = values || {}
            const payload = {
                externalIp,
                lastInternalId,
                sgApiKey,
                emailFrom,
                apiEndPoint,
                enableEcosystem,
                multiEcosystemSupport
            }
            const response = await updatePlatformSettings(payload)
            const { data } = response as AxiosResponse
            setLoading(false)
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setAlertMessage({
                    type: "success",
                    message: data?.message
                })
            } else {
                setAlertMessage({
                    type: "failure",
                    message: response as string
                })
            }
        } catch (err) {
            setLoading(false)
            setAlertMessage({
                type: "failure",
                message: err?.message
            })
            console.error("ERROR-UPDATE-CONFIG", err)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return (
        <div className='py-4 px-4 mx-auto max-w-screen-xl text-start lg:py-8 lg:px-12'>
            <div className='mb-5'>
                <h1 className='class="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white"'>Platform Configuration</h1>
                <p className='text-xs font-normal'>You can configure entire platform settings from here</p>
            </div>
            <hr />
            <h2 className='mt-5 text-lg font-semibold'>
                General
            </h2>
            <Formik
                initialValues={formData}
                validationSchema={yup.object().shape({
                    externalIp: yup
                        .string()
                        .required('External IP is required')
                        .trim(),
                    lastInternalId: yup
                        .string()
                        .required('Last Internal IP is required')
                        .trim(),
                    sgApiKey: yup
                        .string()
                        .required('SendGrid Key is required')
                        .trim(),
                    apiEndPoint: yup
                        .string()
                        .required('Agent Webhook Endpoint is required')
                        .trim(),
                    emailFrom: yup
                        .string()
                        .required('Email is required')
                        .email('Email is invalid')
                        .matches(
                            /(\.[a-zA-Z]{2,})$/,
                            'Email domain is invalid',
                        )
                        .trim(),
                    enableEcosystem: yup
                        .boolean(),
                    multiEcosystemSupport: yup
                        .boolean()

                })}
                validateOnBlur
                validateOnChange
                enableReinitialize
                onSubmit={(values) => {
                    updateSettings(values)
                }
                }
            >

                {(formikHandlers): JSX.Element => (
                    <Form className="mt-5 mb-5 space-y-6" onSubmit={formikHandlers.handleSubmit}>
                        <div>
                            <div className='max-w-[420px] mb-4'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="externalIp" value="External IP" className='text-base' />
                                    <span className='text-red-500 text-xs'>*</span>
                                    <p className='text-xs font-normal'>This IP will be use to access agent services</p>
                                </div>
                                <Field
                                    id="externalIp"
                                    name="externalIp"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    type="text"
                                    placeholder="Ex. 192.168. 1. 0"
                                />
                                {
                                    (formikHandlers?.errors?.externalIp && formikHandlers?.touched?.externalIp) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.externalIp}</span>
                                }
                            </div>
                            <div className='max-w-[420px] mb-4'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="lastInternalId" value="Last Internal IP" className='text-base' />
                                    <span className='text-red-500 text-xs'>*</span>
                                    <p className='text-xs font-normal'>This IP will be use to access agent services</p>
                                </div>
                                <Field
                                    id="lastInternalId"
                                    name="lastInternalId"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    type="text"
                                    placeholder="Ex. 192.168. 1. 0"
                                />
                                {
                                    (formikHandlers?.errors?.lastInternalId && formikHandlers?.touched?.lastInternalId) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.lastInternalId}</span>
                                }
                            </div>
                            <div className='max-w-[420px] mb-4'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="apiEndPoint" value="Agent Webhook Endpoint" className='text-base' />
                                    <span className='text-red-500 text-xs'>*</span>
                                    <p className='text-xs font-normal'>This endpoint is used to access transactions from Webhook (Connection, Issuance, Verifications)</p>
                                </div>
                                <Field
                                    id="apiEndPoint"
                                    name="apiEndPoint"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    type="text"
                                    placeholder="Ex. www.example.com"
                                />
                                {
                                    (formikHandlers?.errors?.apiEndPoint && formikHandlers?.touched?.apiEndPoint) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.apiEndPoint}</span>
                                }
                            </div>
                            <div className='max-w-[420px] mb-4'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="sgApiKey" value="SendGrid Key" className='text-base' />
                                    <span className='text-red-500 text-xs  '>*</span>
                                    <p className='text-xs font-normal'>This keys will be use to authenticate access to SendGrid services</p>
                                </div>
                                <Field
                                    id="sgApiKey"
                                    name="sgApiKey"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    type="text"
                                    placeholder="Ex. SG.SJDLFksjdflkJSDIksjdflkjsdlkjSDFLJ2ia"
                                />
                                {
                                    (formikHandlers?.errors?.sgApiKey && formikHandlers?.touched?.sgApiKey) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.sgApiKey}</span>
                                }
                            </div>
                            <div className='max-w-[420px]'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="emailFrom" value="Email ID" className='text-base' />
                                    <span className='text-red-500 text-xs  '>*</span>
                                    <p className='text-xs font-normal'>This Email ID will be used to send verification emails</p>
                                </div>
                                <Field
                                    id="emailFrom"
                                    name="emailFrom"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    type="text"
                                    placeholder="Ex. info@blockster.global"
                                />
                                {
                                    (formikHandlers?.errors?.emailFrom && formikHandlers?.touched?.emailFrom) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.emailFrom}</span>
                                }
                            </div>
                        </div>
                        <hr />
                        <div>
                            <h2 className='my-4 text-lg font-semibold'>Ecosystem</h2>
                            <div className='flex justify-between items-center'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="enableEcosystem" value="Enable Ecosystem" className='text-base' />
                                    <span className='text-red-500 text-xs'>*</span>
                                    <p className='text-xs font-normal'>This flag is used to enable/disable ecosystem feature</p>
                                </div>
                                <Toggle id="enableEcosystem" name="enableEcosystem" label={""} checked={formikHandlers.values.enableEcosystem} onChangeHandle={(e) => formikHandlers.handleChange(e)} />
                            </div>
                            <div className='flex justify-between items-center mt-4'>
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <Label htmlFor="multiEcosystemSupport" value="Multi Ecosystem support" className='text-base' />
                                    <span className='text-red-500 text-xs'>*</span>
                                    <p className='text-xs font-normal'>This flag is allow you to join multiple ecosystems</p>
                                </div>
                                <Toggle id="multiEcosystemSupport" name="multiEcosystemSupport" label={""} checked={formikHandlers.values.multiEcosystemSupport} onChangeHandle={(e) => formikHandlers.handleChange(e)} />
                            </div>
                        </div>
                        {
                            message.message &&
                            <AlertComponent
                                message={message.message}
                                type={message.type}
                                viewButton={false}
                                onAlertClose={() => {
                                    setMessage({
                                        type: "success",
                                        message: ""
                                    });
                                }}
                            />
                        }

                        <div className="flex justify-end items-center space-x-4 mb-4">
                            <Button
                                type="reset"
                                color='bg-primary-800'
                                className='dark:text-white bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 ml-auto dark:hover:text-black'

                                style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className='mr-2 dark:text-white dark:group-hover:text-primary-700' width="18" height="18" fill="none" viewBox="0 0 20 20">
                                    <path fill="currentColor" d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z" />
                                </svg>

                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="text-base p-0 font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                disabled={loading}
                                isProcessing={loading}
                            >
                                <div className='pr-2'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 27 18" className='text-white'>
                                        <path d="M26.8198 6.28811L20.4686 0.173424C20.2284 -0.0578081 19.8388 -0.0578081 19.5985 0.173424L17.3425 2.34543H9.72838C7.97425 2.34543 6.30402 3.11495 5.19849 4.41847H3.99884V3.53003C3.99884 3.20296 3.72341 2.93773 3.38364 2.93773H0.615206C0.275428 2.93773 0 3.20296 0 3.53003C0 3.85709 0.275428 4.12232 0.615206 4.12232H2.76843V12.4145H0.615206C0.275428 12.4145 0 12.6797 0 13.0068C0 13.3338 0.275428 13.5991 0.615206 13.5991H3.38364C3.72341 13.5991 3.99884 13.3338 3.99884 13.0068V11.526H5.19849C6.30402 12.8295 7.97431 13.5991 9.72838 13.5991H10.4441L14.8351 17.8265C14.9552 17.9421 15.1127 18 15.2701 18C15.4275 18 15.585 17.9421 15.7051 17.8265L26.8198 7.1258C26.9352 7.01468 27 6.86406 27 6.70698C27 6.54991 26.9352 6.39923 26.8198 6.28811ZM5.99765 10.5849C5.88187 10.4319 5.69706 10.3414 5.50044 10.3414H3.99884V5.60306H5.5005C5.69712 5.60306 5.88187 5.51262 5.99771 5.35963C6.86497 4.21401 8.25964 3.53003 9.72845 3.53003H16.1121L12.4622 7.04406C11.949 6.68246 11.4915 6.24251 11.1066 5.73319C10.9067 5.46867 10.522 5.41027 10.2471 5.60271C9.97237 5.79514 9.91171 6.16557 10.1116 6.43009C11.2789 7.97491 13.0013 8.98958 14.9613 9.28714C15.3383 9.34442 15.5967 9.68623 15.5372 10.0492C15.4778 10.4121 15.1232 10.6604 14.7458 10.6035C13.0429 10.345 11.4752 9.6257 10.2122 8.5235C9.96044 8.30381 9.57138 8.32218 9.3432 8.56454C9.11502 8.80691 9.13409 9.18148 9.38584 9.40116C9.49608 9.49735 9.60897 9.5901 9.72315 9.68114L8.48394 10.8741C8.36859 10.9852 8.30375 11.1359 8.30375 11.293C8.30375 11.45 8.36859 11.6007 8.48394 11.7118L9.18079 12.3826C7.91838 12.2358 6.75626 11.5869 5.99765 10.5849ZM15.2701 16.57L9.78886 11.293L10.7306 10.3863C11.8828 11.0912 13.1796 11.5649 14.554 11.7736C14.6551 11.7889 14.7554 11.7964 14.8546 11.7964C15.7837 11.7963 16.6033 11.1445 16.7525 10.2336C16.9176 9.22549 16.2001 8.27598 15.153 8.11695C14.5959 8.03236 14.062 7.87825 13.5614 7.661L20.0336 1.42992L25.5148 6.70698L15.2701 16.57Z" fill="currentColor" />
                                    </svg>
                                </div>
                                Save
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>

        </div >
    )
}

export default PlatformSetting