import { Button, Modal } from 'flowbite-react';
import { editOrganizationUserRole, getOrganizationRoles } from "../../../api/organization";
import { useEffect, useState } from "react";

import type { AxiosResponse } from 'axios';
import { TextTittlecase } from '../../../utils/TextTransform';
import type { User } from "../interfaces/users";
import { apiStatusCodes } from "../../../config/CommonConstant";

interface RoleI {
    id: number
    name: string,
    checked: boolean
    disabled: boolean
}


const EditUserRoleModal = (props: { openModal: boolean; user: User; setMessage: (message: string) => void; setOpenModal: (flag: boolean) => void }) => {

    const [loading, setLoading] = useState<boolean>(false)

    const [roles, setRoles] = useState<RoleI[] | null>(null)

    const [erroMsg, setErrMsg] = useState<string | null>(null)

    const getRoles = async () => {

        const resRoles = await getOrganizationRoles()

        const { data } = resRoles as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            const roles: Array<RoleI> = data?.data.response
            const filterRole = roles.filter(role => {
                if (props?.user?.roles.includes(role.name)) {
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

        getRoles()

    }, [props.openModal])


    const editUserRole = async () => {

        setLoading(true)

        const roleIds = roles?.filter(role => role.checked).map(role => role.id)

        const response = await editOrganizationUserRole(props.user.id, roleIds as number[])

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            props.setMessage(data?.message)
            props.setOpenModal(false)

        } else {
            setErrMsg(response as string)
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

                <div
                    className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >

                    <div className="space-y-6">
                        <div>
                            <div className="w-full">

                                <p
                                    className="text-base font-semibold text-gray-700 leading-none truncate mb-0.5 dark:text-white"
                                >
                                    {props?.user?.firstName} {props?.user?.lastName}
                                </p>

                                <span className='flex items-center'>
                                    {
                                        props?.user?.email
                                    }
                                </span>

                            </div>

                            <div className="mt-8 w-full">
                                <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Roles
                                    <span className="text-red-500 text-xs">*</span>
                                </div>
                                {

                                    roles && <div className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-2">

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
                                            ))
                                        }
                                    </div>
                                }


                            </div>

                        </div>

                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={editUserRole}
                        color="bg-primary-800"
                        isProcessing={loading}
                        className="text-white px-6 py-1 items-center justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                        Save
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default EditUserRoleModal;