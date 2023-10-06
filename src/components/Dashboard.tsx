'use client';

import { Button } from 'flowbite-react';
import { useState } from 'react';
import CreateEcosystemOrgModal from './CreateEcosystemOrgModal';

export default function Dashboard() {

    const [openModal, setOpenModal] = useState<boolean>(false);
    const props = { openModal, setOpenModal };

    const createOrganizationModel = () => {
        props.setOpenModal(true)
    }


    return (
        <div className="px-4 pt-6">
            <div>
                <div
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                >
                    <div className="flex items-center justify-center mb-4">
                        <Button
                            onClick={createOrganizationModel}
                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                        >
                            Create Organization
                        </Button>
                    </div>

                    {
                        props.openModal &&
                        <CreateEcosystemOrgModal
                            openModal={props.openModal}
                            setOpenModal={props.setOpenModal}
                            isorgModal={true}
                        />
                    }
                </div>
            </div>
        </div>
    )
}


