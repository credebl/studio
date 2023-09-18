import CustomAvatar from '../Avatar'
import { Formik } from "formik";
import React from "react";
import { Button } from "flowbite-react";

interface DisplayUserProfileProps {
    toggleEditProfile: () => void;
    userProfileInfo: UserProfile | null;
}

// const DisplayUserProfile = ({ toggleEditProfile, userProfileInfo }: DisplayUserProfileProps) => {
    const DisplayUserProfile = () => {

    return (
        <div>

            {/* <div className="flow-root">
                <ul>

                    <li className="flex items-start justify-between pb-4">
                        {(userProfileInfo?.profileImg) ? 
                        <CustomAvatar 
                        className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                        size="90"
                        src={userProfileInfo?.profileImg} 
                        /> :
                         <CustomAvatar                          
                         size="90"
                        name={userProfileInfo?.firstName} />}


                        <button
                            type="button"
                            className=""
                            onClick={toggleEditProfile}
                        >
                            <svg aria-hidden="true"
                                className="-ml-1 w-5 h-5"

                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                color='#3558A8'
                            >
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">

                                </path>
                                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>

                        </button>


                    </li>

                    <li className="py-3">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Name
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">
                                {userProfileInfo?.firstName} {userProfileInfo?.lastName}
                                </p>
                            </div>

                        </div>
                    </li>
                    <li className="py-3">
                        <div className="flex items-center space-x-4">

                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Email
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">

                                    {userProfileInfo?.email}
                                </p>
                            </div>
                        </div>
                    </li>
                     <li className="py-3">
                        <div className="flex items-center space-x-4">

                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Public view
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">

                                    {userProfileInfo?.publicProfile ? " Public" : "Private"}
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div> */}

            <div className='h-full'>
                <div className='page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:px-8'>
                    <div className='container mx-auto bg-white border border-gray-200 rounded-lg'>
                            <div className="px-6 py-6">
                                <form action="#">
                                    <div className="form-container">
                                        <div>
                                            <h1 className="text-gray-500 text-xl font-medium font-montserrat">General</h1>
                                            <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal">Basic info, like your first name, last name and profile image that will be displayed</p>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                            <div className="text-base text-gray-600 font-montserrat font-normal">First Name</div>
                                            <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                                <input className="bg-gray-50 py-2.5 px-10 border border-gray-300 w-full rounded-md focus:ring-primary-500 focus:border-primary-500"/>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                            <div className="text-base text-gray-600 font-montserrat font-normal">Last Name</div>
                                            <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                                <input className="bg-gray-50 py-2.5 px-10 border border-gray-300 w-full rounded-md "/>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 py-8 border-gray-200 dark:border-gray-600 items-center">
                                            <div className="text-base text-gray-600 font-montserrat font-normal">Profile Image</div>
                                            <div className="focus:ring-indigo-600 col-span-2 w-full focus-within:ring-indigo-600 focus-within:border-indigo-600 focus:border-indigo-600">
                                                {/* <input className="w-20 h-20 border border-gray-300 rounded-full"/> */}
                                                <div className="flex items-center gap-4 space-x-4">

                                            <div className="relative w-20 h-20">
                                                <label htmlFor="profile-image" className="block w-full h-full rounded-full border-2 border-gray-300 hover:border-blue-500 cursor-pointer">
                                                    <img src="https://e1.pxfuel.com/desktop-wallpaper/437/582/desktop-wallpaper-cute-doll-for-facebook-profile-cute-doll-in-thumbnail.jpg" alt="Profile Image" className="w-full h-full rounded-full object-cover" />
                                                    <input type="file" id="profile-image" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                </label>
                                            </div>
                                            <div className="flex flex-col mt-2">
                                                <label htmlFor="profile-image" className="px-4 py-1 bg-primary-700 hover:bg-primary-800 text-white text-center rounded-md">
                                                    Choose file
                                                </label>
                                                <span className="mt-1 ml-2 text-sm text-gray-500 dark:text-gray-400">No File Chosen</span>
                                                </div>
                                            </div>
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

        </div>
    );
};

export default DisplayUserProfile;

