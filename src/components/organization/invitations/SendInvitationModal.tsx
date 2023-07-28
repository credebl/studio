import * as yup from "yup"

import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useEffect, useRef, useState } from "react";

import { AlertComponent } from "../../AlertComponent";
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from "../../../config/CommonConstant";
import { createInvitations } from "../../../api/invitations";
import { getOrganizationRoles } from "../../../api/organization";

interface Values {
    email: string;
}

interface Invitations {
    email: string;
    role: string;
    roleId: number;
}


interface RoleI {
   id: number
   name: string
}


const SendInvitationModal = (props: { openModal: boolean;  setMessage: (message: string)=> void ; setOpenModal: (flag: boolean)=> void }) => {

    const [loading, setLoading] = useState<boolean>(false)

    const [invitations, setInvitations] = useState<Invitations[]>([])

    const [memberRole, setMemberRole] = useState<RoleI | null>(null)

    const [initialInvitationData, setInvitationData] = useState({
        email: '',
    })
    const [erroMsg, setErrMsg] = useState<string | null>(null)

    const getRoles = async () => {

        const resRoles = await getOrganizationRoles()

        const { data } = resRoles as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            
            const roles: Array<RoleI> = data?.data.response

            const memberRole = roles.find(role => role.name === 'member')
            setMemberRole(memberRole as RoleI)
        } else {
            setErrMsg(resRoles as string)
        }
    }

    useEffect(() => {
        setInvitationData({
            email: '',
        })

        setInvitations([])
        getRoles()

    }, [props.openModal])


    const includeInvitation = async (values: Values) => {
        setInvitations([
            ...invitations as Invitations[],
            {
                email: values.email,
                role: memberRole?.name as string,
                roleId: memberRole?.id as number
            }

        ])
    }

    const removeInvitation = (email: string) => {

        const invitationList = invitations.filter(item => email !== item.email)

        setInvitations(invitationList)
    }

    const sendInvitations = async () => {

         setLoading(true)

        const invitationPayload = invitations.map(invitation => {
            return {
                email: invitation.email,
                orgRoleId: [invitation.roleId]
            }
        })

        const resCreateOrg = await createInvitations(invitationPayload)

        const { data } = resCreateOrg as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            props.setMessage(data?.message)
            props.setOpenModal(false)

        } else {
            setErrMsg(resCreateOrg as string)
        }
        setLoading(false)

    }

    return (
        <Modal
            size="2xl"
            show={props.openModal} onClose={() => {
                setInvitations([])
                setInvitationData(initialInvitationData)
                props.setOpenModal(false)
            }
            }>
            <Modal.Header>Sent Invitations</Modal.Header>
            <Modal.Body>
                 <AlertComponent
                    message={erroMsg}
                    type={'error'}
                    onAlertClose = {() => {
                        setErrMsg(null)
                    }}
                    />
                <Formik
                    initialValues={initialInvitationData}
                    validationSchema={
                        yup.object().shape({
                            email: yup
                                .string()
                                .required('Email is required')
                                .email('Email is invalid')
                                .trim(),

                        })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={async (
                        values: Values,
                        { resetForm }: FormikHelpers<Values>
                    ) => {
                        await includeInvitation(values)
                        resetForm({ values: initialInvitationData })
                    }}
                >
                    {(formikHandlers): JSX.Element => (

                        <Form className="mt-2 space-y-6" onSubmit={
                            formikHandlers.handleSubmit
                        }>

                            <div className="flex items-center justify-between">

                                <div className="w-2/3">
                                    <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        <Label htmlFor="email2" value="Email" />
                                        <span className='text-red-500 text-xs'>*</span>
                                    </div>
                                    <Field
                                        id="email"
                                        name="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        type="email"
                                    />
                                    {
                                        (formikHandlers?.errors?.email && formikHandlers?.touched?.email) &&
                                        <span className="text-red-500 text-xs">{formikHandlers?.errors?.email}</span>
                                    }
                                </div>

                                <div className="w-1/3">
                                    <Button type="submit"
                                        color="gray"
                                        className='mt-6 float-right border border-gray-400'
                                    >
                                        ADD +
                                    </Button>
                                </div>


                            </div>

                        </Form>
                    )}

                </Formik>
                {
                    invitations.length > 0 &&
                    <div>
                        <div
                            className="p-2 my-2 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-2 dark:bg-gray-800"
                        >
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {
                                    invitations.map((invitation) => (

                                        <li className="p-2">
                                            <div
                                                className="flex justify-between xl:block 2xl:flex align-center 2xl:space-x-4"
                                            >
                                                <div className="flex flex-wrap space-x-4 xl:mb-4 2xl:mb-0">
                                                    <div>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="40px" height="40px">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white"
                                                        >
                                                            {invitation.email}
                                                        </p>

                                                        <div className="flow-root h-auto">
                                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                <li className="pt-3 sm:pt-3 overflow-auto">
                                                                    <div className="items-center space-x-4">
                                                                        <div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
                                                                            Roles: Member
                                                                        </div>

                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="cursor-pointer" onClick={() => removeInvitation(invitation.email)}>
                                                    <svg className="text-red-400 dark:text-gray-500 w-6 h-8  mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                                                </span>

                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={sendInvitations}
                                isProcessing={loading}
                                className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                            >
                                Send
                            </Button>
                        </div>
                    </div>

                }


            </Modal.Body>

        </Modal>
    )
}

export default SendInvitationModal;