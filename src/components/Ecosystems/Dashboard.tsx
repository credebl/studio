'use client';
import React, { useState } from 'react';
import BreadCrumbs from '../BreadCrumbs';
import CreateEcosystems from './CreateEcosystems';
import { Features } from '../../utils/enums/features';
import RoleViewButton from '../RoleViewButton';
import { EmptyListMessage } from '../EmptyListComponent';
import { pathRoutes } from '../../config/pathRoutes';
import EditEcosystems from './EditEcosystems';



const initialPageState = {
  pageNumber: 1,
  pageSize: 9,
  total: 100,
};

const Dashboard = () => {
    const [openModal, setOpenModal,] = useState<boolean>(false);
    const [editEcosystemModal, setEditEcosystemModal] = useState<boolean>(false);
    const props = { openModal, setOpenModal, editEcosystemModal, setEditEcosystemModal  };
    

    const createEcosystemModel = () => {
      props.setOpenModal(true)
    }

    const EditEcosystemsModel = () => {
      props.setEditEcosystemModal(true); // Open the EditEcosystems modal
    };

  return (
    <div>
        <div className="pl-6 mb-4 col-span-full xl:mb-2">
        <button type="button" onClick={EditEcosystemsModel}> {/* Use EditEcosystemsModel */}
  <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5"
    fill="currentColor" viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg" color='#3558A8'>
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
    <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
  </svg>
</button>
<BreadCrumbs />
<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
  Ecosystems
</h1>
</div>
<div
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >   
          <div className="flex items-center justify-center mb-4">
         
          <EditEcosystems
            openModal={props.editEcosystemModal}
            // setMessage={(data) => setMessage(data)}
            setOpenModal={props.setEditEcosystemModal} setMessage={function (message: string): void {
              throw new Error('Function not implemented.');
            } } EcoData={null} />

            <CreateEcosystems
                      openModal={props.openModal}
                      // setMessage={(data) => setMessage(data)}
                      setOpenModal={props.setOpenModal} setMessage={function (message: string): void {
                          throw new Error('Function not implemented.');
                      } } />

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
