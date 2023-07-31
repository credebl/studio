'use client';

import { Alert, Button, Card, Pagination, Spinner, Table, } from 'flowbite-react';
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
  const [schemaListErr, setSchemaListErr] = useState<string|null>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [orgId, setOrgId] = useState<string>('')
  const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
    itemPerPage: 9,
    page: 1,
    search: "",
    sortBy: "id",
    sortingOrder: "DESC"
  })

  const getSchemaList = async (schemaListAPIParameter: GetAllSchemaListParameter) => {
    try {
      const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
      setOrgId(organizationId);
      setLoading(true);
  
      const schemaList = await getAllSchemas(schemaListAPIParameter, organizationId);
      const { data } = schemaList as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data?.data?.data?.length === 0) {
          setSchemaListErr('No Data Found');
        }
        if (data?.data?.data) {
          setSchemaList(data?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
          setSchemaListErr(schemaList as string)
        }
      } else {
        setLoading(false);
        setSchemaListErr(schemaList as string)
      }
    } catch (error) {
      console.error('Error while fetching schema list:', error);
      setLoading(false);
     
    }
  };
  


  useEffect(() => {
    getSchemaList(schemaListAPIParameter)
  }, []);

  useEffect(() => {
    getSchemaList(schemaListAPIParameter)

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
    <div className="px-4 pt-6">
      <div className="mb-4 col-span-full xl:mb-2">
        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Schemas
        </h1>
      </div>
      <div>
        <div
          className=""
        >
          <div className="flex items-center justify-between mb-4 pr-4">
            <div id='schemasSearchInput'>
              <SearchInput
                onInputChange={onSearch}
              />
            </div>
            <Button
              id='createSchemaButton'
              onClick={() => {
                window.location.href = `/organizations/schemas/create?OrgId=${orgId}`
              }}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
            >
              Create Schema
            </Button>
          </div>
          {
            schemaListErr &&
            <Alert
              color="failure"
              onDismiss={() => setSchemaListErr(null)}
            >
              <span>
                <p>
                  {schemaListErr}
                </p>
              </span>
            </Alert>
          }
          {loading
            ? <div className="flex items-center justify-center mb-4">
              <Spinner
                color="info"
              />
            </div>
            :
            <div className='Flex-wrap' style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
                {schemaList && schemaList.length > 0 &&
                  schemaList.map((element, key) => (
                    <div className='p-2' key={key}>
                      <SchemaCard schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} created={element['createDateTime']} />
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-end mb-4" id="schemasPagination">

                <Pagination
                  currentPage={1}
                  onPageChange={(page) => {
                    setSchemaListAPIParameter(prevState => ({
                      ...prevState,
                      page: page
                    }));
                  }}
                  totalPages={0}
                />
              </div>
            </div>
          }
        </div>
      </div>
    </div>

  )
}


export default SchemaList