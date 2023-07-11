'use client';

import type { AxiosResponse } from 'axios';
import { Button, Card, Table, } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getAllSchemas } from '../../../api/Schema';
import SchemaCard from '../../../commonComponents/schemaCard';


const SchemaTable = () => {
  const [schemaList, setSchemaList] = useState([])


  useEffect(() => {
    (async () => {
      const schemaList: any = await getAllSchemas();
      setSchemaList(schemaList?.data?.data?.data)

    })();
  }, []);


  return (
    <>
      <div>
        <h1 className='p-4 font-bold underline'>Schema List</h1>
        <div className="flex items-center justify-end mb-4 p-2">
            <Button
              onClick={() => {
                window.location.href = '/resources/create'
              }}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
            >
              Create Schema
            </Button>
          </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1rem' }}>
          {schemaList && schemaList.length > 0 &&
            schemaList.map((element, key) => (
              <div className='p-4' key={key}>
                <SchemaCard schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} />
              </div>
            ))}
        </div>
      </div>
    </>

  )
}


export default SchemaTable 