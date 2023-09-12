import React from 'react'

const UpdatePassword = () => {
  return (
    <div className='h-full'>
    <div className='page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:px-8'>
        <div className='container mx-auto bg-white'>
            <div className='card border-0 card-border'>
                <div className="px-6 py-6">
                    <form action="#">
                        <div className="form-container">
                            <div>
                                <h1 className="text-black text-semibold text-xl text-opacity-70 font-montserrat">Password</h1>
                                <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal">Enter your current & new password to reset your password</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                <div className="text-base text-gray-700 font-montserrat">Current Password</div>
                                <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                    <input className="bg-gray-50 py-4 px-12 border border-gray-300 w-full rounded-md focus:ring-primary-500 focus:border-primary-500"/>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                <div className="text-base text-gray-700 font-montserrat">New Password</div>
                                <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                    <input className="bg-gray-50 py-4 px-12 border border-gray-300 w-full rounded-md "/>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                <div className="text-base text-gray-700 font-montserrat">Confirm Password</div>
                                <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                    <input className="bg-gray-50 py-4 px-12 border border-gray-300 w-full rounded-md "/>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
)
}

export default UpdatePassword