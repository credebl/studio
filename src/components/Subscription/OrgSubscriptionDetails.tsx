import BreadCrumbs from '../BreadCrumbs'
import React from 'react'

interface IProps {
    name: string
}

const OrgSubscriptionDetails = ({ name }: IProps) => {
    const data = [{

        name: "Create organization",
        total: 2,
        used: 1,
        remaining: 1
    },
    {
        name: "create schema",
        total: 10,
        used: 3,
        remaining: 7
    },
    {
        name: "credential definition creation",
        total: 6,
        used: 3,
        remaining: 3
    },
    {
        name: "creations of Attribute",
        total: 6,
        used: 3,
        remaining: 3
    },
    ]


    return (
        <section className="pt-2 px-4">
            <div className="mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
            </div>
            <div className=''>

                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Subscription ORG SUB DETAILS
                </h1>

                <p className='flex justify-end dark:text-white'>Back</p>
                <div className='flex'>
                    <div>
                        <img src="public/images/CREDEBL_ICON.png" className="w-12 h-12" />
                    </div>
                    <div className='ml-2'>
                        <p className='text-blue-700 font-semibold text-2xl '>
                            {name}
                        </p>
                        <p className='dark:text-white'>
                            SSI based company
                        </p>
                        <p className='dark:text-white'>
                            Role:Admin
                        </p>
                    </div>
                </div>
                <div className="mt-4 dark:text-white border-b border-blue-500 dark:text-white items-center mb-4">
                    Plan :
                    <span className='text-blue-700 font-semibold'> Free </span>
                    <span>(validity : 1 Month)</span>
                    <p className='grid items-center justify-end mb-4'>
                        <span>Start Date : 13/09/2023</span>
                        <span>Expiry Date : 12/10/2023</span></p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 mx-4">
                <p className='text-blue-700 font-semibold text-2xl'>Features</p>
                <a href='/subscriptionplans'>
                    <button type="button" className="flex items-center justify-end text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        <svg className="h-6 w-6 text-white" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <line x1="12" y1="8" x2="8" y2="12" />  <line x1="12" y1="8" x2="12" y2="16" />  <line x1="16" y1="12" x2="12" y2="8" /></svg>
                        Upgrade
                    </button>
                </a>

            </div>
            <div className="mx-4">

                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Feature name</th>
                                    <th scope="col" className="px-4 py-3">Total</th>
                                    <th scope="col" className="px-4 py-3">Used</th>
                                    <th scope="col" className="px-4 py-3">Remaining</th>
                                    <th scope="col" className="px-4 py-3">Percent Usage</th>

                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.name} className="dark:text-white border-b border-blue-500">
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                                        <td className="px-4 py-3">{item.total}</td>
                                        <td className="px-4 py-3">{item.used}</td>
                                        <td className="px-4 py-3">{item.total - item.used}</td>
                                        <td className="px-4 py-3 ">
                                            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                                {/* Background circle */}
                                                <circle
                                                    cx="20"
                                                    cy="20"
                                                    r="15.9155"
                                                    fill="transparent"
                                                    stroke="lightgray"
                                                    strokeWidth="4"
                                                />
                                                {/* Usage percentage arc */}
                                                <circle
                                                    cx="20"
                                                    cy="20"
                                                    r="15.9155"
                                                    fill="transparent"
                                                    stroke="blue"
                                                    strokeWidth="4"
                                                    strokeDasharray={`${(item.used / item.total) * 100} ${100 - (item.used / item.total) * 100}`}
                                                    transform="rotate(-90 20 20)"
                                                />
                                            </svg>
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

export default OrgSubscriptionDetails;