'use client';

import { Button, Card, Pagination, Spinner } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { OrgRole, Organisation } from '../interfaces'

import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import CreateOrgFormModal from "../CreateOrgFormModal";
import CustomAvatar from '../../Avatar'
import type { Invitation } from '../interfaces/invitations';
import SearchInput from '../../SearchInput';
import SendInvitationModal from './SendInvitationModal';
import { TextTittlecase } from '../../../utils/TextTransform';
import { apiStatusCodes } from '../../../config/CommonConstant';
import { getOrganizationInvitations } from '../../../api/invitations';
import { getOrganizations } from '../../../api/organization';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Invitations = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(initialPageState);
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

    const createOrganizationModel = () => {
        props.setOpenModal(true)
    }

    //Fetch the user organization list
    const getAllInvitations = async () => {
        setLoading(true)
        const response = await getOrganizationInvitations(currentPage.pageNumber, currentPage.pageSize, searchText);
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            const totalPages = data?.data?.totalPages;

            const invitationList = data?.data?.invitations
            setInvitationsList(invitationList)
            setCurrentPage({
                ...currentPage,
                total: totalPages
            })
        } else {
            setMessage(response as string)
        }

        setLoading(false)
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
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">

                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Invitations
                </h1>
            </div>
            <div>
                <div
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <SearchInput
                            onInputChange={searchInputChange}
                        />
                        <Button
                            onClick={createInvitationsModel}
                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                        >
                            Send Invitations
                        </Button>
                    </div>

                    <SendInvitationModal
                        openModal={props.openModal}
                        setMessage = {(data) => setMessage(data) }
                        setOpenModal={
                            props.setOpenModal
                        } />

                    <AlertComponent
                    message={message}
                    type={'success'}
                    onAlertClose = {() => {
                        setMessage(null)
                    }}
                    />
                    {loading
                        ? <div className="flex items-center justify-center mb-4">
                            <Spinner
                                color="info"
                            />
                        </div>
                        : <div
                            className="p-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-3 dark:bg-gray-800"
                        >
                            <div className="flow-root">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {
                                        invitationsList && invitationsList.map((invitation) => (

                                            <li className="p-4">
                                                <div
                                                    className="flex flex-wrap justify-between xl:block 2xl:flex align-center 2xl:space-x-4"
                                                >
                                                    <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                                                        <div>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="70px" height="70px">
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
                                                                                Roles:
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
                                                                ? <p className='text-lg font-normal text-red-500'>
                                                                    {TextTittlecase(invitation.status)}
                                                                </p>
                                                                : invitation.status === 'accepted'
                                                                    ? <p className='text-lg font-normal text-red-500'>
                                                                        {TextTittlecase(invitation.status)}
                                                                    </p>
                                                                    : <p className='text-lg font-normal text-red-500'>
                                                                        {TextTittlecase(invitation.status)}
                                                                    </p>

                                                        }
                                                    </span>


                                                    <p
                                                        className="mr-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                                    >
                                                        Invited On: {invitation.createDateTime.split('T')[0]}
                                                    </p>

                                                    {/* <div className="inline-flex items-center w-auto xl:w-full 2xl:w-auto">
                                                <a
                                                    href="#"
                                                    className="w-full px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                                >Disconnect</a
                                                >
                                            </div> */}
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>
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
        </div>
    )
}

export default Invitations;