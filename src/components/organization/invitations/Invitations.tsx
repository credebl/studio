'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes } from '../../../config/CommonConstant';

import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import { EmptyListMessage } from '../../EmptyListComponent';
import { Features } from '../../../utils/enums/features';
import type { Invitation } from '../interfaces/invitations';
import type { OrgRole } from '../interfaces'
import { Pagination } from 'flowbite-react';
import RoleViewButton from '../../RoleViewButton';
import SearchInput from '../../SearchInput';
import SendInvitationModal from './SendInvitationModal';
import { TextTittlecase } from '../../../utils/TextTransform';
import { getOrganizationInvitations } from '../../../api/invitations';
import CustomSpinner from '../../CustomSpinner';
import { dateConversion } from '../../../utils/DateConversion';
import DateTooltip from '../../Tooltip';
import React from 'react';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Invitations = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const [userRoles, setUserRoles] = useState<string[]>([])
    const timestamp = Date.now();

    const onPageChange = (page: number) => {
        setCurrentPage({
            ...currentPage,
            pageNumber: page
        })
    };
    const [searchText, setSearchText] = useState("");

    const [invitationsList, setInvitationsList] = useState<Array<Invitation> | null>(null)
    const props = { openModal, setOpenModal };

    //Fetch the user organization list
    const getAllInvitations = async () => {
        setLoading(true)

        const response = await getOrganizationInvitations(currentPage.pageNumber, currentPage.pageSize, searchText);
        const { data } = response as AxiosResponse

        setLoading(false)

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            const totalPages = data?.data?.totalPages;

            const invitationList = data?.data?.invitations

            setInvitationsList(invitationList)
            setCurrentPage({
                ...currentPage,
                total: totalPages
            })
        }
        else {
            setError(response as string)

        }
    }

    //This useEffect is called when the searchText changes 
    useEffect(() => {

        // let getData: string | number | NodeJS.Timeout | undefined;
        let getData: NodeJS.Timeout

        if (searchText.length >= 1) {
            getData = setTimeout(() => {
                getAllInvitations()

            }, 1000)
        } else {
            getAllInvitations()
        }

        return () => clearTimeout(getData)
    }, [searchText, openModal, currentPage.pageNumber])

    
    //onCHnage of Search input text
    const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    const createInvitationsModel = () => {
        props.setOpenModal(true)
    }


    return (
        <div>
            <div
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
            >
                <div className="flex items-center justify-between mb-4">
                    <SearchInput
                        onInputChange={searchInputChange}
                    />
                    <RoleViewButton
                        buttonTitle='Invite'
                        feature={Features.SEND_INVITATION}
                        svgComponent={
                        <svg className='pr-2' xmlns="http://www.w3.org/2000/svg" width="36" height="18" fill="none" viewBox="0 0 42 24">
                            <path fill="#fff" d="M37.846 0H9.231a3.703 3.703 0 0 0-3.693 3.692v1.385c0 .508.416.923.924.923a.926.926 0 0 0 .923-.923V3.692c0-.184.046-.369.092-.554L17.815 12 7.477 20.861a2.317 2.317 0 0 1-.092-.553v-1.385A.926.926 0 0 0 6.462 18a.926.926 0 0 0-.924.923v1.385A3.703 3.703 0 0 0 9.231 24h28.615a3.703 3.703 0 0 0 3.693-3.692V3.692A3.703 3.703 0 0 0 37.846 0ZM8.862 1.892c.092-.046.23-.046.369-.046h28.615c.139 0 .277 0 .37.046L24.137 13.938a.97.97 0 0 1-1.2 0L8.863 1.893Zm28.984 20.262H9.231c-.139 0-.277 0-.37-.046L19.247 13.2l2.492 2.17a2.67 2.67 0 0 0 1.8.691 2.67 2.67 0 0 0 1.8-.692l2.493-2.169 10.384 8.908c-.092.046-.23.046-.369.046Zm1.846-1.846c0 .184-.046.369-.092.553L29.262 12 39.6 3.138c.046.185.092.37.092.554v16.616ZM2.77 9.692c0-.507.416-.923.923-.923h5.539c.507 0 .923.416.923.923a.926.926 0 0 1-.923.923h-5.54a.926.926 0 0 1-.923-.923Zm6.462 5.539H.923A.926.926 0 0 1 0 14.308c0-.508.415-.923.923-.923h8.308c.507 0 .923.415.923.923a.926.926 0 0 1-.923.923Z" />
                        </svg>}
                        onClickEvent={createInvitationsModel}
                    />                   
                </div>

                <SendInvitationModal
                    openModal={props.openModal}
                    setMessage={(data) => setMessage(data)}
                    setOpenModal={
                        props.setOpenModal
                    } />

                <AlertComponent
                    message={message ? message : error}
                    type={message ? 'success' : 'failure'}
                    onAlertClose={() => {
                        setMessage(null)
                        setError(null)
                    }}
                />

                {loading
                    ? <div className="flex items-center justify-center mb-4">
                       
                        <CustomSpinner/>
                    </div>
                    : invitationsList && invitationsList?.length > 0 ? (<div
                        className="p-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-3 dark:bg-gray-800"
                    >
                        <div className="flow-root">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {
                                    invitationsList.map((invitation) => (

                                        <li className="p-4">
                                            <div
                                                className="flex flex-wrap justify-between align-center"
                                            >
                                                <div className="flex min-w-[40%] space-x-4 xl:mb-4 2xl:mb-0">
                                                    <div className='dark:text-white'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="60px" height="60px">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
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
                                                                            {invitation.orgRoles.length>1 ? 'Roles:' : 'Role:'}
                                                                            {invitation.orgRoles &&
                                                                                invitation.orgRoles.length > 0 &&
                                                                                invitation.orgRoles.map((role: OrgRole, index: number) => {
                                                                                    return (
                                                                                        <span
                                                                                            key={index}
                                                                                            className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                                                                        >
                                                                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                        </div>

                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className='flex items-center'>
                                                    {
                                                        invitation.status === 'pending'
                                                            ? <span
                                                                className="bg-orange-100 text-orange-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-md border border-orange-100 dark:bg-gray-700 dark:border-orange-300 dark:text-orange-300"
                                                            >
                                                                {TextTittlecase(invitation.status)}
                                                            </span>
                                                            : invitation.status === 'accepted'
                                                                ? <span
                                                                    className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500"
                                                                >
                                                                    {TextTittlecase(invitation.status)}
                                                                </span>
                                                                :
                                                                <span
                                                                    className="bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400"
                                                                >
                                                                    {TextTittlecase(invitation.status)}
                                                                </span>

                                                    }
                                                </span>


                                                <p 
                                                className="mr-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                                >
                                                    Invited On: &nbsp;<DateTooltip date={invitation.createDateTime}>{dateConversion(invitation.createDateTime)}</DateTooltip>
                                                </p>          

                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>) 
                    : invitationsList && (<EmptyListMessage
                        message={'No Invitations'}
                        description={'Get started by inviting a users'}
                        buttonContent={'Invite'}
                        feature={Features.SEND_INVITATION}
                        onClick={createInvitationsModel}
                        svgComponent={<svg className='pr-2' xmlns="http://www.w3.org/2000/svg" width="36" height="18" fill="none" viewBox="0 0 42 24">
                            <path fill="#fff" d="M37.846 0H9.231a3.703 3.703 0 0 0-3.693 3.692v1.385c0 .508.416.923.924.923a.926.926 0 0 0 .923-.923V3.692c0-.184.046-.369.092-.554L17.815 12 7.477 20.861a2.317 2.317 0 0 1-.092-.553v-1.385A.926.926 0 0 0 6.462 18a.926.926 0 0 0-.924.923v1.385A3.703 3.703 0 0 0 9.231 24h28.615a3.703 3.703 0 0 0 3.693-3.692V3.692A3.703 3.703 0 0 0 37.846 0ZM8.862 1.892c.092-.046.23-.046.369-.046h28.615c.139 0 .277 0 .37.046L24.137 13.938a.97.97 0 0 1-1.2 0L8.863 1.893Zm28.984 20.262H9.231c-.139 0-.277 0-.37-.046L19.247 13.2l2.492 2.17a2.67 2.67 0 0 0 1.8.691 2.67 2.67 0 0 0 1.8-.692l2.493-2.169 10.384 8.908c-.092.046-.23.046-.369.046Zm1.846-1.846c0 .184-.046.369-.092.553L29.262 12 39.6 3.138c.046.185.092.37.092.554v16.616ZM2.77 9.692c0-.507.416-.923.923-.923h5.539c.507 0 .923.416.923.923a.926.926 0 0 1-.923.923h-5.54a.926.926 0 0 1-.923-.923Zm6.462 5.539H.923A.926.926 0 0 1 0 14.308c0-.508.415-.923.923-.923h8.308c.507 0 .923.415.923.923a.926.926 0 0 1-.923.923Z" />
                        </svg>}
                    />)
                }

                <div className="flex items-center justify-end mb-4">

                    <Pagination
                        currentPage={currentPage.pageNumber}
                        onPageChange={onPageChange}
                        totalPages={currentPage.total}
                    />
                </div>
            </div>
        </div>

    )
}

export default Invitations;
