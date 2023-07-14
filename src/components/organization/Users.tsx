'use client';

import { Button, Card, Pagination, Spinner } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CreateOrgFormModal from "./CreateOrgFormModal";
import CustomAvatar from '../Avatar'
import type { Organisation } from './interfaces'
import SearchInput from '../SearchInput';

const Users = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')

  
  const [searchText, setSearchText] = useState("");
  const props = { openModal, setOpenModal };



  //onCHnage of Search input text
  const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }


  return (
    <div className="px-4 pt-6">
      <div className="mb-4 col-span-full xl:mb-2">

        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Users
        </h1>
      </div>
      <div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              onInputChange={searchInputChange}
            />
            <Button
              color='bg-primary-800'
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
            >
              Invite
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users;