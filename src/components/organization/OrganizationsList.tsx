'use client';

import { Button, Card, Pagination, Spinner } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CreateOrgFormModal from "./CreateOrgFormModal";
import CustomAvatar from '../Avatar'
import type { Organisation } from './interfaces'
import SearchInput from '../SearchInput';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getOrganizations } from '../../api/organization';

const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  total: 100,
};

const OrganizationsList = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')

  const [currentPage, setCurrentPage] = useState(initialPageState);
  const onPageChange = (page: number) => {
    setCurrentPage({
      ...currentPage,
      pageNumber: page
    })
  };
  const [searchText, setSearchText] = useState("");

  const [organizationsList, setOrganizationList] = useState<Array<Organisation> | null>(null)
  const props = { openModal, setOpenModal };

  const createOrganizationModel = () => {
    props.setOpenModal(true)
  }

  //Fetch the user organization list
  const getAllOrganizations = async () => {
    setLoading(true)
    const response = await getOrganizations(currentPage.pageNumber, currentPage.pageSize, searchText);
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

      const totalPages = data?.data?.totalPages;

      const orgList = data?.data?.organizations.map((userOrg: Organisation) => {
        const roles: string[] = userOrg.userOrgRoles.map(role => role.orgRole.name)
        userOrg.roles = roles
        return userOrg;
      })

      setOrganizationList(orgList)
      setCurrentPage({
        ...currentPage,
        total: totalPages
      })
    } else {
      setMessage(response as string)
    }

    setLoading(false)
  }

  useEffect(() => {

    getAllOrganizations()

  }, [openModal, currentPage.pageNumber])

  //This useEffect is called when the searchText changes 
  useEffect(() => {

    // let getData: string | number | NodeJS.Timeout | undefined;
    let getData: NodeJS.Timeout

    if (searchText.length >= 1) {
      getData = setTimeout(() => {
        getAllOrganizations()

      }, 1000)
    } else {
      getAllOrganizations()
    }

    return () => clearTimeout(getData)
  }, [searchText])

  //onCHnage of Search input text
  const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }

  const redirectOrgDashboard = (orgId: number) => {
          localStorage.setItem('orgId', orgId.toString())
    			window.location.href = '/organizations/dashboard'
  }


  return (
    <div className="px-4 pt-6">
      <div className="mb-4 col-span-full xl:mb-2">

        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Organizations
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
              onClick={createOrganizationModel}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
            >
              Create Organization
            </Button>
          </div>

          <CreateOrgFormModal
              openModal={props.openModal}
              setOpenModal={
                props.setOpenModal
              } />
          {loading
            ? <div className="flex items-center justify-center mb-4">
              <Spinner
                color="info"
              />
            </div>
            : <div className="mt-1 grid grid-cols-3 gap-4">
              {
                organizationsList && organizationsList.map((org) => (
                  <Card onClick={() => redirectOrgDashboard(org.id)} className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer'>
                   
                    <div className='flex items-center'>
                      {(org.logoUrl) ? <CustomAvatar size='100' src={org.logoUrl} /> : <CustomAvatar size='100' name={org.name} />}

                      <div className='ml-4'>                      
                        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                          <p>
                            {org.name}
                          </p>
                        </h5>                      
                        <div className="flow-root h-auto">
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            <li className="py-3 sm:py-4 overflow-auto">
                              <div className="flex items-center space-x-4">
                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                  Roles:
                                  {org.roles &&
                                    org.roles.length > 0 &&
                                    org.roles.map((role: string, index: number) => {
                                      return (
                                        <span
                                          key={index}
                                          className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                        >
                                          {role}
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
                  </Card>
                ))
              }

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

export default OrganizationsList;