import React from 'react';
import DedicatedIcon from '../../assets/dedicated.svg';

const DedicatedIllustrate = () => {

    return (
        <div className='mt-4 flex flex-row justify-center flex-wrap'>
            <div>
                <img src={DedicatedIcon} alt="dedicated" width={220} />
            </div>
            <div className='ml-8 max-w-xs'>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Complete Control and Maximum Privacy
                </h3>
                <ul className="list-disc">
                    <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Our dedicated agent is exclusively managed by your organization, giving you full control. Customize and configure it to meet your specific needs with ease.
                        </p>
                    </li>
                     <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Rest assured, all data and operations stay within your organization's infrastructure, guaranteeing maximum privacy and autonomy.
                        </p>
                    </li>
                      <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Experience the power of complete control and privacy with our dedicated agent.
                        </p>
                    </li>
                </ul>

            </div>
        </div>
    )

}

export default DedicatedIllustrate