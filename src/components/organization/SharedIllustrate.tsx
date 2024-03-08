import React from 'react';
import { PLATFORM_DATA } from '../../app/constants';

const SharedIllustrate = () => {
    // const sharedIcon = PLATFORM_DATA.images.find(item => item.id === "create_wallet")

    return (
         <div className='mt-4 flex flex-row justify-center flex-wrap'>
            {/* <div>
            <img src={sharedIcon?.image} alt="dedicated" width={220} />
            </div> */}
            <div className='ml-8 max-w-xs'>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Your Hassle-Free Multi-Tenant Solution
                </h3>
                <ul className="list-disc dark:text-white">
                    <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Multi-tenant solution enables multiple organizations to utilize a single agent.
                        </p>
                    </li>
                     <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Enjoy shared resources and less operational stress.
                        </p>
                    </li>
                      <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                        {PLATFORM_DATA.name} handles maintenance, updates, and technical matters.
                        </p>
                    </li>
                     <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Your team focuses on core tasks while we manage the backend.
                        </p>
                    </li>
                    <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Experience seamless efficiency with the Shared Agent from {PLATFORM_DATA.name}.
                        </p>
                    </li>
                    
                </ul>

            </div>
        </div>
    )

}

export default SharedIllustrate
