import type { OrgAgent, Organisation } from './interfaces'

interface Values {
	seed: string;
    name:string,
    password: string
}


const OrganizationDetails = ({orgData}: {orgData: Organisation}) => {

    const { org_agents} = orgData
    const agentData: OrgAgent | null = org_agents.length > 0 ? org_agents[0] : null

    return (
        <div
            className="mt-4 flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >

            <div
                className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
            >

                <div>
                    {/* <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                        Organization Wallet Details
                    </h3> */}
                    	<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					<li className="py-4">
						<div className="flex items-center space-x-4">
							<div className="flex-shrink-0">
								<svg
									className="w-6 h-6 dark:text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									></path></svg
								>
							</div>
							<div className="inline-flex min-w-0">
                                <p
									className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
								>
									Organization: 
								</p>
								<p
									className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
								>
									{orgData.name}
								</p>
							
							</div>							
						</div>
					</li>
                    	<li className="py-4">
						<div className="flex items-center space-x-4">
							
							<div className="inline-flex min-w-0">
                                <p
									className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
								>
									DID: 
								</p>
								<p
									className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
								>
									{agentData?.orgDid}
								</p>
							
							</div>							
						</div>
					</li>	                   
                    	<li className="py-4">
						<div className="flex items-center space-x-4">
							
							<div className="inline-flex min-w-0">
                                <p
									className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
								>
									Wallet Name: 
								</p>
								<p
									className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
								>
									{agentData?.walletName}
								</p>
							
							</div>							
						</div>
					</li>	
                    	<li className="py-4">
						<div className="flex items-center space-x-4">
							
							<div className="inline-flex min-w-0">
                                <p
									className="text-base font-normal text-gray-500 truncate dark:text-gray-400"
								>
									Created On: 
								</p>
								<p
									className="ml-4 text-base font-semibold text-gray-900 truncate dark:text-white"
								>
									{agentData?.agents_type.createDateTime.split("T")[0]}
								</p>
							
							</div>							
						</div>
					</li>					
				</ul>

                </div>

            </div>
          
        </div>
    )

}

export default OrganizationDetails