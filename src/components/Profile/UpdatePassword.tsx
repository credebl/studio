import { Button } from 'flowbite-react'

const UpdatePassword = () => {
  return (
    <div className='h-full'>
    <div className='page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-3 sm:py-6 md:px-8'>
        <div className='container mx-auto bg-white border border-gray-200 rounded-lg'>
                <div className="px-6 py-6">
                    <form action="#">
                        <div className="form-container">
                            <div>
                            <h1 className="text-gray-500 text-xl font-medium font-montserrat">Password</h1>
                            <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal">Enter your current & new password to reset your password</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                <div className="text-base text-gray-700 font-montserrat">Current Password</div>
                                <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                    <input className="bg-gray-50 py-3 px-12 border border-gray-300 w-full rounded-md focus:ring-primary-500 focus:border-primary-500"/>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                <div className="text-base text-gray-700 font-montserrat">New Password</div>
                                <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                    <input className="bg-gray-50 py-3 px-12 border border-gray-300 w-full rounded-md "/>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 py-8 border-gray-200 dark:border-gray-600 items-center">
                                <div className="text-base text-gray-700 font-montserrat">Confirm Password</div>
                                <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                    <input className="bg-gray-50 py-3 px-12 border border-gray-300 w-full rounded-md "/>
                                </div>
                            </div>
                            <div className='float-right p-2'>
                                        <Button
                                            type="submit"
                                            title="Add new credential-definition on ledger"
                                            color='bg-primary-800'
                                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                                        >
                                            <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                                            </svg>
                                            Update
                                        </Button>
                                    </div>
                                    <div className='float-right p-2'>
                                        <Button
                                            type="reset"
                                            color='bg-primary-800'
                                            className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto dark:text-white'

                                            style={{ height: '2.5rem', width: '7rem', minWidth: '4rem' }}
                                        >
                                            <svg className="h-6 w-6 mr-2 text-primary-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="23 4 23 10 17 10" />
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                            </svg>

                                            Reset
                                        </Button>
                                    </div>

                        </div>
                    </form>
                </div>
        </div>
    </div>
</div>
)
}

export default UpdatePassword