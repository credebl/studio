import SharedIcon from '../../assets/shared.svg';

const SharedIllustrate = () => {

    return (
         <div className='mt-4 flex flex-row justify-center flex-wrap'>
            <div>
            <img src={SharedIcon} alt="dedicated" width={220} />
            </div>
            <div className='ml-8 max-w-xs'>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Your Hassle-Free Multi-Tenant Solution
                </h3>
                <ul className="list-disc">
                    <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Our Shared Agent is here to simplify your operations! Managed by CREDEBL on your organization's behalf, this multi-tenant solution allows multiple organizations to share the same agent. You'll benefit from shared resources and reduced operational burdens.
                        </p>
                    </li>
                     <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Leave the agent maintenance, updates, and technical aspects to CREDEBL, so your team can focus on core tasks without worrying about the backend. Enjoy improved productivity and efficiency while we handle the nitty-gritty.
                        </p>
                    </li>
                      <li>
                        <p className='mb-1 text-base font-normal text-gray-900 dark:text-white'>
                            Experience a seamless and hassle-free future with the Shared Agent. Let CREDEBL take care of everything, while you concentrate on achieving your goals.
                        </p>
                    </li>
                </ul>

            </div>
        </div>
    )

}

export default SharedIllustrate