'use client';

import { Button, Card, Pagination, Spinner } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { OrgRole, Organisation } from '../interfaces'
import { getOrganizationUsers, getOrganizations } from '../../../api/organization';

import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import CreateOrgFormModal from "../CreateOrgFormModal";
import CustomAvatar from '../../Avatar'
import EditUserRoleModal from './EditUserRolesModal';
import SearchInput from '../../SearchInput';
import { TextTittlecase } from '../../../utils/TextTransform';
import type { User } from '../interfaces/users';
import { apiStatusCodes } from '../../../config/CommonConstant';
import { getOrganizationInvitations } from '../../../api/invitations';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Users = () => {
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

    const [usersList, setUsersList] = useState<Array<User> | null>(null)
    const props = { openModal, setOpenModal };

    const createOrganizationModel = () => {
        props.setOpenModal(true)
    }

    //Fetch the user organization list
    const getAllInvitations = async () => {
        setLoading(true)

        const response = await getOrganizationUsers();
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            console.log(`USERS::`, data?.data);
            

            // const totalPages = data?.data?.totalPages;

               const usersList = data?.data?.map((userOrg: User) => {
        const roles: string[] = userOrg.userOrgRoles.map(role => role.orgRole.name)
        userOrg.roles = roles
        return userOrg;
      })


            setUsersList(usersList)


            // if (invitationList.length === 0) {
            //     setError('No Data Found')
            // }
            // setInvitationsList(invitationList)
            // setCurrentPage({
            //     ...currentPage,
            //     total: totalPages
            // })
        } else {
            setError(response as string)
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

    const editUserRole = () => {
        props.setOpenModal(true)
    }

    return (
        <div className="px-4 pt-6">
            <div className="pl-6 mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />             
            </div>
            
<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
    <ul className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
        <li className="mr-2" role="presentation">
            <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg " id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="true">Users</button>
        </li>
        <li className="mr-2" role="presentation">
            <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Invitations</button>
        </li>      
    </ul>
</div>
<div id="myTabContent">
    <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
        <Members/>
    </div>
    <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
        <Invitations/>
    </div>   
</div>

                    <EditUserRoleModal
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
                            <Spinner
                                color="info"
                            />
                        </div>
                        : usersList && usersList?.length > 0 && <div
                            className="p-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-3 dark:bg-gray-800"
                        >
                            <div className="flow-root">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {
                                        usersList.map((user) => (

                                            <li className="p-4">
                                                <div
                                                    className="flex flex-wrap justify-between xl:block 2xl:flex align-center 2xl:space-x-4"
                                                >
                                                    <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                                                        <div>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="60px" height="60px">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white"
                                                            >
                                                                {user.firstName}{user.lastName}
                                                            </p>

                                                            <div className="flow-root h-auto">
                                                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                    <li className="pt-3 sm:pt-3 overflow-auto">
                                                                        <div className="items-center space-x-4">
                                                                            <div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
                                                                                Roles:
                                                                                {user.roles &&
                                                                                    user.roles.length > 0 &&
                                                                                    user.roles.map((role, index: number) => {
                                                                                        return (
                                                                                            <span
                                                                                                key={index}
                                                                                                className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                                                                            >
                                                                                                {role.charAt(0).toUpperCase() + role.slice(1)}
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
                                                            user.email
                                                        }
                                                    </span>


                                                    <p
                                                        onClick={editUserRole}
                                                        className="mr-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                                    >
                                                        <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                    </p>
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

export default Users;