'use client';

import { Button, Card, Spinner } from 'flowbite-react';
import type { Organisation, UserOrgData } from './interfaces'
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CreateOrgFormModal from "./CreateOrgFormModal";
import CustomAvatar from '../Avatar'
import { apiStatusCodes } from '../../config/CommonConstant';
import { getOrganizations } from '../../api/organization';

const OrganizationsList = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')
  const [organizationsList, setOrganizationList] = useState<Array<Organisation> | null>(null)
  const props = { openModal, setOpenModal };

  const createOrganizationModel = () => {
    props.setOpenModal(true)
  }

  const getAllOrganizations = async () => {
    const response = await getOrganizations();
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      console.log(`OrgList::`, data?.data);

      const orgList = data?.data.map((userOrg: UserOrgData) => ({ ...userOrg.organisation }))

      setOrganizationList(orgList)
    } else {
      setMessage(response as string)
    }

    setLoading(false)
  }

  useEffect(() => {
    console.log(`ORG::FETCHED`);
    
    getAllOrganizations()

  }, [openModal])


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
          <div className="flex items-center justify-end mb-4">
            <Button
              onClick={createOrganizationModel}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
            >
              Create Organization
            </Button>
          </div>

          {
            props.openModal &&
            <CreateOrgFormModal
              openModal={props.openModal}
              setOpenModal={
                props.setOpenModal
              } />
          }

          {loading
            ? <Spinner
              color="info"
            />
            : <div className="mt-1 grid grid-cols-2 gap-4">
              {
                organizationsList && organizationsList.map((org) => (
                  <Card className='cursor-pointer'>
                    <div className='flex items-center'>
                      {(org.logoUrl) ? <CustomAvatar size='100' src={org.logoUrl} /> : <CustomAvatar size='100' name={org.name} />}

                      {/* <img className='mr-4' width={100} src={org.logoUrl} alt="org-mage" /> */}
                      <div className='ml-4'>

                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                          <p>
                            {org.name}
                          </p>
                        </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          <p>
                            {org.description}
                          </p>
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              }

            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default OrganizationsList;