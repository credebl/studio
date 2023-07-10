'use client';

import type { AxiosResponse } from 'axios';
import { Card, Table, } from 'flowbite-react';
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
    </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1rem' }}>
          {schemaList && schemaList.length > 0 &&
            schemaList.map((element, key) => (
              <div className='p-4' key={key}>
                <SchemaCard schemaName={element['name']} version={element['version']} schemaId = {element['schemaLedgerId']} issuerDid = {element['issuerId']} attributes = {element['attributes']}/>
              </div>
            ))}
        </div>
      </div>
    </>

  )
}


export default SchemaTable 