import React from 'react'
import BreadCrumbs from '../../components/BreadCrumbs';

const OrgFreeSubscription = () => {

    const data = [{

        name: "AyanWorks",
        plan: "free",
        role: "admin"
    },
    {
        name: "Blockster",
        plan: "pro",
        role: "admin"
    },
    {
        name: "AyanWorks pvt ltd",
        plan: "pro",
        role: "admin"
    }

    ]

    return (

        <section className="bg-gray-50 dark:bg-gray-900">
            <BreadCrumbs />
            <div className='mx-4'>
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Subscription
                </h1>
                <div className='flex justify-end dark:text-white'>Back</div>
                <div className="mt-4 dark:text-white border-b border-blue-500 dark:text-white items-center mb-4">
                    Plan :
                    <span className='text-blue-700 font-semibold'> Free </span>
                    <span>(validity : 1 Month)</span>
                    <p className='flex items-center justify-between mb-4'>
                        <span>Start Date : 13/09/2023</span>
                        <span>Expiry Date : 12/10/2023</span></p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 mx-4">
                <h1 className='text-blue-700 font-semibold'>Organizatin(s) Details</h1>
                <a href='/subscription'>
                    <button type="button" className="flex items-center justify-end text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        <svg className="h-6 w-6 text-white" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <line x1="12" y1="8" x2="8" y2="12" />  <line x1="12" y1="8" x2="12" y2="16" />  <line x1="16" y1="12" x2="12" y2="8" /></svg>
                        Upgrade
                    </button>
                </a>

            </div>
            <div className="mx-4">

                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-white">
                            <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Organizations name</th>
                                    <th scope="col" className="px-4 py-3">Plan</th>
                                    <th scope="col" className="px-4 py-3">Roles</th>
                                    <th scope="col" className="px-4 py-3">

                                    </th>


                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.name} className="border-b border-blue-500 dark:text-white">
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                                        <td className="px-4 py-3">{item.plan}</td>
                                        <td className="px-4 py-3">{item.role}</td>
                                        <td className="px-4 py-3">
                                            <a href="/prosubscription">
                                            <svg className="h-4 w-4 text-gray-500 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                            </svg></a>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default OrgFreeSubscription;