import type { UserProfile } from "./interfaces";
import CustomAvatar from '../Avatar'
import { Formik } from "formik";

interface DisplayUserProfileProps {
    toggleEditProfile: () => void;
    userProfileInfo: UserProfile | null;
}

const DisplayUserProfile = ({ toggleEditProfile, userProfileInfo }: DisplayUserProfileProps) => {

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
                </ul>
            </div> */}

            <div className='h-full'>
                <div className='page-container relative h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:px-8'>
                    <div className='container mx-auto bg-white'>
                        <div className='card border-0 card-border'>
                            <div className="px-6 py-6">
                                <form action="#">
                                    <div className="form-container">
                                        <div>
                                            <h1 className="text-black text-semibold text-xl text-opacity-70 font-montserrat">General</h1>
                                            <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal">Basic info, like your first name, last name and profile image that will be displayed</p>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                            <div className="text-base text-gray-700 font-montserrat">First Name</div>
                                            <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                                <input className="bg-gray-50 py-4 px-12 border border-gray-300 w-full rounded-md focus:ring-primary-500 focus:border-primary-500"/>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                            <div className="text-base text-gray-700 font-montserrat">Last Name</div>
                                            <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                                                <input className="bg-gray-50 py-4 px-12 border border-gray-300 w-full rounded-md "/>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                            <div className="text-base text-gray-700 font-montserrat">Profile Image</div>
                                            <div className="focus:ring-indigo-600 col-span-2 w-full focus-within:ring-indigo-600 focus-within:border-indigo-600 focus:border-indigo-600">
                                                <input className="w-20 h-20 border border-gray-300 rounded-full"/>
                                            </div>
                                        </div>

                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DisplayUserProfile;

