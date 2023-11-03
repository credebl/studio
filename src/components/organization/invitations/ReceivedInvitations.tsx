import { Button, Card, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { acceptRejectInvitations, getUserInvitations } from '../../../api/invitations';

import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import type { Invitation } from '../interfaces/invitations';
import type { OrgRole } from '../interfaces'
import SearchInput from '../../SearchInput';
import SendInvitationModal from './SendInvitationModal';
import { TextTittlecase } from '../../../utils/TextTransform';
import { apiStatusCodes } from '../../../config/CommonConstant';
import { getOrganizations } from '../../../api/organization';
import { pathRoutes } from '../../../config/pathRoutes';
import { EmptyListMessage } from '../../EmptyListComponent';
import CustomSpinner from '../../CustomSpinner';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const ReceivedInvitations = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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

    //Fetch the user organization list
    const getAllInvitations = async () => {
        setLoading(true)
        const response = await getUserInvitations(currentPage.pageNumber, currentPage.pageSize, searchText);
        const { data } = response as AxiosResponse

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

        setLoading(false)
    }

    //This useEffect is called when the searchText changes 
    useEffect(() => {

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

    //onChange of Search input text
    const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    const respondToInvitations = async (invite: Invitation, status: string) => {
        setLoading(true)
        const response = await acceptRejectInvitations(invite.id, invite.orgId, status);
        const { data } = response as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            setMessage(data?.message)
            setLoading(false)
            window.location.href = pathRoutes.organizations.root
        } else {
            setError(response as string)
            setLoading(false)
        }
    }


    return (
        <div className="px-4 pt-2">
            <div className="pl-6 mb-4 col-span-full xl:mb-2">

                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Received Invitations
                </h1>
            </div>
            <div>
                <div
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        {invitationsList && invitationsList?.length > 0 ?

                            <SearchInput
                                onInputChange={searchInputChange}
                            /> :
                            null}
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
                                                    className="flex flex-wrap justify-between xl:block 2xl:flex align-center 2xl:space-x-4"
                                                >
                                                    <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                                                        <div>
                                                            <svg width="60" height="60" viewBox="0 0 398 398" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <g clip-path="url(#clip0_3892_5729)">
                                                                    <path d="M350.828 117.051V166.651L382.328 143.251L350.828 117.051Z" fill="#6B7280" />
                                                                    <path d="M217.922 6.9502C206.822 -2.2498 190.722 -2.3498 179.622 6.8502L166.922 17.6502H230.822L217.922 6.9502Z" fill="#6B7280" />
                                                                    <path d="M228.629 282.451C220.029 288.851 209.629 292.351 198.929 292.251C188.229 292.251 177.729 288.851 169.129 282.451L9.82869 163.551V367.451C9.72869 383.951 23.0287 397.451 39.5287 397.551H358.029C374.529 397.451 387.829 383.951 387.729 367.451V163.551L228.629 282.451Z" fill="#6B7280" />
                                                                    <path d="M15.3281 143.249L45.8281 165.949V117.949L15.3281 143.249Z" fill="#6B7280" />
                                                                    <path d="M65.8281 37.6484V180.848L180.828 266.448C191.528 274.248 206.228 274.248 216.928 266.448L330.828 181.548V37.6484H65.8281ZM136.828 117.648H190.828C196.328 117.648 200.828 122.148 200.828 127.648C200.828 133.148 196.328 137.648 190.828 137.648H136.828C131.328 137.648 126.828 133.148 126.828 127.648C126.828 122.148 131.328 117.648 136.828 117.648ZM260.828 187.648H136.828C131.328 187.648 126.828 183.148 126.828 177.648C126.828 172.148 131.328 167.648 136.828 167.648H260.828C266.328 167.648 270.828 172.148 270.828 177.648C270.828 183.148 266.328 187.648 260.828 187.648Z" fill="#6B7280" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_3892_5729">
                                                                        <rect width="397.55" height="397.55" fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white"
                                                            >
                                                                {invitation.organisation.name}
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
                                                            {/* <p
                                                                className="mr-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                                            >
                                                                Received On: {dateConversion(invitation.createDateTime)}
                                                            </p> */}
                                                        </div>

                                                    </div>


                                                    <div>

                                                    </div>
                                                    <div className='flex'>
                                                        <Button
                                                            onClick={() => respondToInvitations(invitation, 'rejected')}
                                                            color='bg-white'
                                                            className='m-5 text-base font-medium text-center text-gray-00 bg-secondary-700 hover:!bg-secondary-800 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600  dark:focus:ring-primary-800 dark:bg-gray-800"'
                                                        >
                                                            <svg className="mr-1 h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>

                                                            Reject
                                                        </Button>
                                                        <Button
                                                            onClick={() => respondToInvitations(invitation, 'accepted')}
                                                            className='m-5 text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:!bg-primary-800 dark:focus:ring-primary-800"'
                                                        >
                                                            <svg className="mr-1 h-6 w-6 text-white" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
                                                            Accept
                                                        </Button>

                                                    </div>



                                                </div>

                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>

                        </div>) 
                        : invitationsList && (<EmptyListMessage
                            message={'No Invitations'}
                            description={`You don't have any invitation`} />)
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

export default ReceivedInvitations;
