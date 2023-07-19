import * as yup from "yup"

import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, apiStatusCodes, imageSizeAccepted } from '../../config/CommonConstant'
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { useEffect, useRef, useState } from "react";

import type { AxiosResponse } from 'axios';
import { asset } from '../../lib/data.js';
import { createOrganization } from "../../api/organization";

interface Values {
    name: string;
    description: string;
}


const sendUserInvitationsModal = (props: { openModal: boolean; setOpenModal: (flag: boolean) => void }) => {


    const [initialOrgData, setOrgData] = useState({
        name: '',
        description: '',
    })
    


    useEffect(() => {
        setOrgData({
            name: '',
            description: '',
        })
      
    }, [props.openModal])


   


    return (
        <Modal show={props.openModal} onClose={() => {
            
            setOrgData(initialOrgData)
            props.setOpenModal(false)
        }
        }>
            <Modal.Header>Send Invitations</Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialOrgData}
                    validationSchema={
                        yup.object().shape({
                            name: yup
                                .string()
                                .min(2, 'Organization name must be at least 2 characters')
                                .max(50, 'Organization name must be at most 50 characters')
                                .required('Organization name is required')
                                .trim(),
                            description: yup
                                .string()
                                .min(2, 'Organization name must be at least 2 characters')
                                .max(255, 'Organization name must be at most 255 characters')
                                .required('Description is required')
                        })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={async (
                        values: Values,
                        { resetForm }: FormikHelpers<Values>
                    ) => 
                    {

                        // sumitCreateOrganization(values)

                    }}
                >
                    {(formikHandlers): JSX.Element => (

                        <Form className="space-y-6" onSubmit={
                            formikHandlers.handleSubmit
                        }>
                            <div>
                                <Button type="submit"
                                    // isProcessing={loading}

                                    className='float-right text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                                >
                                    Add
                                </Button>
                            </div>

                            
                            {/* <div>
                                <div
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    <Label
                                        htmlFor="email"
                                        value="email"
                                    />
                                    <span className="text-red-500 text-xs">*</span>
                                </div>
                                <Field
                                    id="name"
                                    name="name"
                                    value={formikHandlers.values.name}
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Your organization name" />
                                {
                                    (formikHandlers?.errors?.name && formikHandlers?.touched?.name) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.name}</span>
                                }

                            </div> */}
                            {/* <div>
                                <div
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    <Label
                                        htmlFor="description"
                                        value="Description"
                                    />
                                    <span className="text-red-500 text-xs">*</span>
                                </div>

                                <Field
                                    id="description"
                                    name="description"
                                    value={formikHandlers.values.description}
                                    as='textarea'
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Description of your organization" />
                                {
                                    (formikHandlers?.errors?.description && formikHandlers?.touched?.description) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.description}</span>
                                }

                            </div> */}


                        </Form>
                    )}

                </Formik>
            </Modal.Body>

        </Modal>
    )
}

export default sendUserInvitationsModal;

