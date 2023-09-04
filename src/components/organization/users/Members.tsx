'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Pagination } from 'flowbite-react';
import { getOrganizationUsers, getOrganizations } from '../../../api/organization';

import { AlertComponent } from '../../AlertComponent';
import type { AxiosResponse } from 'axios';
import EditUserRoleModal from './EditUserRolesModal';
import SearchInput from '../../SearchInput';
import type { User } from '../interfaces/users';
import { apiStatusCodes } from '../../../config/CommonConstant';
import CustomSpinner from '../../CustomSpinner';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Members = () => {
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
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const props = { openModal, setOpenModal };

    const createOrganizationModel = () => {
        props.setOpenModal(true)
    }

    //Fetch the user organization list
    const getAllUsers = async () => {
        setLoading(true)

        const response = await getOrganizationUsers(currentPage.pageNumber, currentPage.pageSize, searchText);
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            const totalPages = data?.data?.totalPages;

            const usersList = data?.data?.users.map((userOrg: User) => {
                const roles: string[] = userOrg.userOrgRoles.map(role => role.orgRole.name)
                userOrg.roles = roles
                return userOrg;
            })

            if (usersList.length === 0) {
                setError('No Data Found')
            }

            setUsersList(usersList)
            setCurrentPage({
                ...currentPage,
                total: totalPages
            })

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
                getAllUsers()

            }, 1000)
        } else {
            getAllUsers()
        }

        return () => clearTimeout(getData)
    }, [searchText, openModal, currentPage.pageNumber])

    //onCHnage of Search input text
    const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    const editUserRole = (user: User) => {
        setSelectedUser(user)
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
                    </div>

                    <EditUserRoleModal
                        openModal={props.openModal}
                        user={selectedUser as User}
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
                                                    <div className="min-w-[40%] flex space-x-4 xl:mb-4 2xl:mb-0">
                                                       
                                                        <div className="flex-1">
                                                            <p
                                                                className="text-base font-semibold text-gray-900 leading-none truncate dark:text-white"
                                                            >
                                                                {user.firstName} {user.lastName}
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

                                                    <span className='min-w-[35%] flex items-center justify-items-start text-gray-900 dark:text-white'>
                                                        {
                                                            user.email
                                                        }
                                                    </span>

                                                    {
                                                        !user.roles.includes('owner')
                                                            ? <p
                                                                onClick={() => editUserRole(user)}
                                                                className="cursor-pointer mr-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                                            >
                                                                <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                            </p>
                                                            : <p
                                                                onClick={() => editUserRole(user)}
                                                                className="invisible cursor-pointer mr-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                                                            >
                                                                <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                            </p>
                                                    }

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
    )
}

export default Members;