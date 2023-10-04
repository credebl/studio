'use client';
import  { useState } from 'react';
import BreadCrumbs from '../BreadCrumbs';
import { EmptyListMessage } from '../EmptyListComponent';
import PopupModal from '../PopupModal';
import React from 'react';



const initialPageState = {
  pageNumber: 1,
  pageSize: 9,
  total: 100,
};

const Dashboard = () => {
  const [openModal, setOpenModal,] = useState<boolean>(false);
  const [editEcosystemModal, setEditEcosystemModal] = useState<boolean>(false);
  const props = { openModal, setOpenModal, editEcosystemModal, setEditEcosystemModal };


  const createEcosystemModel = () => {
    props.setOpenModal(true)
  }

  const EditEcosystemsModel = () => {
    props.setEditEcosystemModal(true); 
  };

  return (
    <div>
      <div className="pl-6 mb-4 col-span-full xl:mb-2">
        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Ecosystems
        </h1>
      </div>
      <div
        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
      >
        <div className="flex items-center justify-center mb-4">

          <PopupModal
            openModal={props.openModal}
            setOpenModal={props.setOpenModal} setMessage={function (message: string): void {
              throw new Error('Function not implemented.');
            }} 
            isorgModal={false}
             />
             

          <EmptyListMessage
        
            message={'No Ecosystem found'}
            description={'Get started by creating an ecosystem'}
            buttonContent={'Create Ecosystem'}
            svgComponent={<svg className='pr-2 mr-1' xmlns="http://www.w3.org/2000/svg" width="24" height="15" fill="none" viewBox="0 0 24 24">
              <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
            </svg>}
            onClick={createEcosystemModel}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
