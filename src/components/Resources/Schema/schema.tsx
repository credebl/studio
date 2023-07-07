'use client';

import { Card, Table, } from 'flowbite-react';
import SchemaCard from '../../../commonComponents/schemaCard';


const SchemaTable = () => {
  return (
    <>
      <div>
        <h1 className='p-4 font-bold underline'>
          Schema List
        </h1>
        <div className='p-4'>
          <SchemaCard schemaName="Identity Card" version="0.01"/>
        </div>
      </div>
    </>

  )
}


export default SchemaTable 