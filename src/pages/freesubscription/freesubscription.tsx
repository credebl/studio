import React from 'react'

const FreeSubscription = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 mx-auto max-w-screen-xl px-4 lg:px-1">
        <div>Back</div>
        <div className="mt-4 dark:text-white border-b border-blue-500 dark:text-white items-center mb-4">
          Plan:
          <span className='text-blue-700 font-semibold'>Free</span>
          <span>(validity : 1 Month)</span> 
          <p className='flex items-center justify-between mb-4'>
            <span>Start Date : 13/09/2023</span>
          <span>Expiry Date : 12/10/2023</span></p>
        </div>
        <div className="flex items-center justify-between mb-4">
            <p className='text-blue-700 font-semibold'>Features</p>
        <button type="button" className="flex items-center justify-end text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                       Upgrade
                    </button>
        </div>
    <div className="mx-auto max-w-screen-xl">
    
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
           
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">Feature name</th>
                            <th scope="col" className="px-4 py-3">Total</th>
                            <th scope="col" className="px-4 py-3">Used</th>
                            <th scope="col" className="px-4 py-3">Remaining</th>
                            <th scope="col" className="px-4 py-3">Percent Usage</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-blue-500">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Org Creation</th>
                            <td className="px-4 py-3">2</td>
                            <td className="px-4 py-3">1</td>
                            <td className="px-4 py-3">1</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Create Schema</th>
                            <td className="px-4 py-3">10</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">7</td>
                            <td className="px-4 py-3"></td>
                            
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Credential Definition Creation</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">2</td>
                            <td className="px-4 py-3">4</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                        <tr className="border-b border-blue-500 ">
                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Creation of Attribute</th>
                            <td className="px-4 py-3">6</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3">3</td>
                            <td className="px-4 py-3"></td>
                            
                        </tr>
                    </tbody>
                </table>
            </div>
           
        </div>
    </div>
    </section>
  )
}

export default FreeSubscription;