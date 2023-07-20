'use client';

import { Button, Card, Pagination, Spinner } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomAvatar from '../Avatar'
import type { Organisation } from './interfaces'
import SearchInput from '../SearchInput';
import { asset } from '../../lib/data';

const Users = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')


  const [searchText, setSearchText] = useState("");
  

  //onCHnage of Search input text
  const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }

    


  return (
    <div className='px-4 pt-6'>
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
              onInputChange={searchInputChange} />
            <Button              
              color='bg-primary-800'
              disabled
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
              onClick={()=>setOpenModal(true)}
            >
              Send Invitation
            </Button>          
          </div>
          
          <div
            className=" mt-4 p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
          >
            
              <h3 className="text-xl font-semibold dark:text-white"></h3>
              <ul className="mb-6 divide-y divide-gray-200 dark:divide-gray-700">
                <li className="py-4">
                  <div
                    className="flex justify-between xl:block 2xl:flex align-center 2xl:space-x-4"
                  >
                    <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                      <div>
                        <img
                          className="w-6 h-6 rounded-full"
                          src={asset('images/users/bonnie-green.png')}
                          alt="Bonnie image" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white"
                        >
                          Bonnie Green
                        </p>
                        <p
                          className="mb-1 text-sm font-normal truncate text-primary-700 dark:text-primary-500"
                        >
                          Bonnie@mail.com
                        </p>
                        <p
                          className="text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                          Role:
                          <span className='m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'>owner</span>
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex items-center w-auto xl:w-full 2xl:w-auto">
                    <button type="button" className="text-white w-full inline-flex items-center justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
            Role
        </button> 
                    </div>
                  </div>
                </li>
                <li className="py-4">
                  <div
                    className="flex justify-between xl:block 2xl:flex align-center 2xl:space-x-4"
                  >
                    <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
                      <div>
                        <img
                          className="w-6 h-6 rounded-full"
                          src={asset('images/users/jese-leos.png')}
                          alt="Jese image" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white"
                        >
                          Jese Leos
                        </p>
                        <p
                          className="mb-1 text-sm font-normal truncate text-primary-700 dark:text-primary-500"
                        >
                          Jese@mail.com
                        </p>
                        <p
                          className="text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                          Role:
                          <span className='m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'>owner</span>
                       
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex items-center w-auto xl:w-full 2xl:w-auto">
                    <button type="button" className="text-white w-full inline-flex items-center justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
            Role
        </button> 
                    </div>
                  </div>
                </li>
                
              </ul>          
            
          </div>
        </div>
      </div>
    </div>

  )
}

export default Users;