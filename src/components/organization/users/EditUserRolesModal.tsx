import * as yup from "yup"

import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useEffect, useRef, useState } from "react";

import { AlertComponent } from "../../AlertComponent";
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from "../../../config/CommonConstant";
import { createInvitations } from "../../../api/invitations";
import { getOrganizationRoles } from "../../../api/organization";

interface RoleI {
    id: number
    name: string,
    checked: boolean
    disabled: boolean
}


interface RoleI {
   id: number
   name: string
}


const EditUserRoleModal = (props: { openModal: boolean;  setMessage: (message: string)=> void ; setOpenModal: (flag: boolean)=> void }) => {

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
            const filterRole = roles.filter(role => {
                if (props?.user?.roles.includes(role.name) && role.name !== 'member') {
                    role.checked = true
                    role.disabled = false
                } else if (role.name === 'member') {
                    role.checked = true
                    role.disabled = true
                } else {
                    role.checked = false
                    role.disabled = false
                }
                return !role.name.includes("owner") && !role.name.includes("holder");
            })
            setRoles(filterRole)
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

        const roleIds = roles?.filter(role => role.checked).map(role => role.id)

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

    const onRoleChanged = (event: any, id: number) => {

     if (
            (event?.target?.name === 'issuer' && event?.target?.checked === true) || (event?.target?.name === 'verifier' && event?.target?.checked === true)

        ) {
            const updatesRoles: RoleI[] | null = roles && roles?.map(role => {
                if (role.id === id) {
                    role.checked = event?.target?.checked

                } else if (role.name === 'verifier' && role.checked) {
                    role.checked = true
                }else if (role.name === 'issuer' && role.checked) {
                    role.checked = true
                }else if (role.name === 'member' && role.checked) {
                    role.checked = true
                }
                 else {
                    role.checked = false
                }
                return role
            })
            setRoles(updatesRoles)
        } else  if (
            (event?.target?.name === 'admin' && event?.target?.checked === true)
        ) {
            const updatesRoles: RoleI[] | null = roles && roles?.map(role => {
                if (role.id === id) {
                    role.checked = event?.target?.checked

                }
                else if (role.name === 'member' && role.checked) {
                    role.checked = true
                }
                 else {
                    role.checked = false
                }
                return role
            })
            setRoles(updatesRoles)
        } else {
            const updatesRoles: RoleI[] | null = roles && roles?.map(role => {
                if (role.id === id) {
                    role.checked = event?.target?.checked
                }
                return role
            })
            setRoles(updatesRoles)
        }

    }

    return (
        <Modal
            show={props.openModal}
            onClose={() => {
                props.setOpenModal(false);
            }}
        >
            <Modal.Header>Manage User Role</Modal.Header>
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

                    <div className="space-y-6">
                        <div>
                            <div className="w-full">

                                <p
                                    className="text-base font-semibold text-gray-700 leading-none truncate mb-0.5 dark:text-white"
                                >
                                    {props?.user?.firstName} {props?.user?.lastName}
                                </p>

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

                            <div className="mt-8 w-full">
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Roles
                                    <span className="text-red-500 text-xs">*</span>
                                </div>
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

                                        {
                                            roles.map(role => (
                                                <div>
                                                    <label>
                                                        <input type="checkbox"
                                                            id={`checkbox-${role.id}`}
                                                            name={role.name}
                                                            disabled={role.disabled}
                                                            checked={role.checked}
                                                            onChange={(event: any) => onRoleChanged(event, role.id)}
                                                        />
                                                        <span className={`ml-3 ${role.disabled ? 'text-gray-500' : ''}`}>{TextTittlecase(role.name)}</span>
                                                    </label>
                                                </div>
                                                <span className="cursor-pointer" onClick={() => removeInvitation(invitation.email)}>
                                                    <svg className="text-red-400 dark:text-gray-500 w-6 h-8  mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                                                </span>

                                            </div>
                                        </li>
                                    ))
                                }


                            </div>

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

                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={editUserRole}
                        color="bg-primary-800"
                        isProcessing={loading}
                        className="text-white px-6 py-1 items-center justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    ><svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 18 18">
										<path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 1v12l-4-2-4 2V1h8ZM3 17h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/>
									</svg>
                        Save
                    </Button>
                </div>
            </Modal.Body>

        </Modal>
    )
}

export default EditUserRoleModal;
