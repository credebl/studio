'use client';

import { Button, Card, Pagination, Spinner, Table, } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { GetAllSchemaListParameter, PaginationData } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import SchemaCard from '../../../commonComponents/SchemaCard';
import SearchInput from '../../SearchInput';
import { getAllSchemas } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';

const SchemaList = () => {
  const [schemaList, setSchemaList] = useState([])
  const [loading, setLoading] = useState<boolean>(true)
  const [orgId, setOrgId] = useState<string>('')
  const [schemaPagination, setSchemaPagination] = useState<PaginationData>({
    hasNextPage: false,
    hasPreviousPage: false,
    lastPage: 0,
    nextPage: 0,
    previousPage: 0,
    totalItems: 0
  });
  const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
    itemPerPage: 9,
    page: 1,
    search: "",
    sortBy: "id",
    sortingOrder: "DESC"
  })

  const getSchemaList = async (schemaListAPIParameter: GetAllSchemaListParameter) => {
     const organizationId = await getFromLocalStorage(storageKeys.ORG_ID)
      setOrgId(organizationId)
      setLoading(true)

      const schemaList = await getAllSchemas(schemaListAPIParameter, organizationId);
      const { data } = schemaList as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data?.data?.data) {
          setSchemaList(data?.data?.data)
          setSchemaPagination(data?.data)
          setLoading(false)
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
  }


  useEffect(() => {
   getSchemaList(schemaListAPIParameter)
  }, []);

  useEffect(() => {

  }, [schemaListAPIParameter])

  const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    event.preventDefault()
    setSchemaListAPIParameter({
      ...schemaListAPIParameter,
      search: event.target.value
    })

    getSchemaList({
      ...schemaListAPIParameter,
      search: event.target.value
    })

  }

  return (
    <>
      <div className="mb-4 col-span-full xl:mb-2">
        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Schemas
        </h1>
      </div>
      <div>
        <div
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              onInputChange={onSearch}
            />
            <Button
              onClick={() => {
                window.location.href = `/schemas/create?OrgId=${orgId}`
              }}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
            >
              Create Schema
            </Button>
          </div>
          {loading
            ? <div className="flex items-center justify-center mb-4">
              <Spinner
                color="info"
              />
            </div>
            :
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {schemaList && schemaList.length > 0 &&
                  schemaList.map((element, key) => (
                    <div className='p-2' key={key}>
                      <SchemaCard schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} created={element['createDateTime']} />
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-end mb-4">

                <Pagination
                  currentPage={1}
                  onPageChange={() => {

                  }}
                  totalPages={schemaPagination.previousPage}
                />
              </div>
            </div>
          }
        </div>
      </div>
    </>

  )
}


export default SchemaList