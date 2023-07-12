'use client';

import type { AxiosResponse } from 'axios';
import { Button, Card, Pagination, Table, } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getAllSchemas } from '../../../api/Schema';
import SchemaCard from '../../../commonComponents/schemaCard';
import BreadCrumbs from '../../BreadCrumbs';
import SearchInput from '../../SearchInput';


const SchemaTable = () => {
  const [schemaList, setSchemaList] = useState([])


  useEffect(() => {
    (async () => {
      // const schemaList: any = await getAllSchemas();

      // setSchemaList(schemaList?.data?.data?.data)

       const schemaList: any = [
        {
          name: "Object 1",
          version: 1,
          schemaLedgerId: "abc123",
          issuerId: "xyz456",
          attributes: ["attribute1", "attribute2"]
        },
        {
          name: "Object 2",
          version: 2,
          schemaLedgerId: "def789",
          issuerId: "uvw789",
          attributes: ["attribute3", "attribute4"]
        },
        {
          name: "Object 3",
          version: 3,
          schemaLedgerId: "ghi456",
          issuerId: "jkl012",
          attributes: ["attribute5", "attribute6"]
        },
        {
          name: "Object 4",
          version: 4,
          schemaLedgerId: "mno789",
          issuerId: "pqr345",
          attributes: ["attribute7", "attribute8"]
        },
        {
          name: "Object 5",
          version: 5,
          schemaLedgerId: "stu012",
          issuerId: "vwx678",
          attributes: ["attribute9", "attribute10"]
        }
      ];

      setSchemaList(schemaList)

    })();
  }, []);


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
              onInputChange={''}
            />
            <Button
              onClick={() => {
                window.location.href = '/resources/create'
              }}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
            >
              Create Schema
            </Button>
          </div>
          {/* </div> */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {schemaList && schemaList.length > 0 &&
                schemaList.map((element, key) => (
                  <div className='p-2' key={key}>
                    <SchemaCard schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} />
                  </div>
                ))}
            </div>
            <div className="flex items-center justify-end mb-4">

            <Pagination
              currentPage={10}
              onPageChange={()=>{
                
              }}
              totalPages={20}
            />
          </div>
          </div>
        </div>
      </div>
    </>

  )
}


export default SchemaTable 