import type { UserProfile } from "./interfaces";
import CustomAvatar from '../Avatar'
import { Button } from "flowbite-react";

interface DisplayUserProfileProps {
    toggleEditProfile: () => void;
    userProfileInfo: UserProfile | null;
}

const DisplayUserProfile = ({ toggleEditProfile, userProfileInfo }: DisplayUserProfileProps) => {

    return (
        <div>
            <div className='h-full'>
                <div className='page-container relative h-full flex flex-auto flex-col px-4 py-4 sm:py-6'>
                    <div className='container mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700'>
                        <div className="px-6 py-6">

                            <form action="#">
                                <div className="form-container">
                                    <div className="flex items-center justify-between">

                                        <div>
                                            <h1 className="text-gray-500 text-xl font-medium font-montserrat dark:text-white">General</h1>
                                            <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal dark:text-white">Basic info, like your first name, last name and profile image that will be displayed</p>
                                        </div>

                                        <Button
                                            type="submit"
                                            title="Add new credential-definition on ledger"
                                            color='bg-primary-800'
                                            onClick={toggleEditProfile}
                                            className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                                        >
                                            <svg className="h-5 w-6 mr-1 text-white" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" />
                                                <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                                                <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                                                <line x1="16" y1="5" x2="19" y2="8" />
                                            </svg>
                                            Edit
                                        </Button>

                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                        <div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">First Name</div>
                                        <div className="col-span-2">
                                            <p className={`bg-gray-50 py-3 px-4 border border-gray-300 w-full rounded-md text-black dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${!userProfileInfo?.firstName && !userProfileInfo?.lastName ? 'py-6' : ''}`}>
                                                {userProfileInfo?.firstName}
                                            </p>
                                        </div>
                                    </div>


                                    <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                        <div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">Last Name</div>
                                        <div className="col-span-2">
                                            <p className={`bg-gray-50 py-3 px-4 border border-gray-300 w-full rounded-md text-black dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${!userProfileInfo?.firstName && !userProfileInfo?.lastName ? 'py-6' : ''}`}>
                                                {userProfileInfo?.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 py-8 border-gray-200 dark:border-gray-600 items-center">
                                        <div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">Profile Image</div>
                                        <div className="focus:ring-indigo-600 col-span-2 w-full focus-within:ring-indigo-600 focus-within:border-indigo-600 focus:border-indigo-600">
                                            <div className="flex items-center gap-4 space-x-4">

                                                {(userProfileInfo?.profileImg) ?
                                                    <CustomAvatar
                                                        className="mb-4 rounded-full w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                                                        size="90"
                                                        src={userProfileInfo?.profileImg}
                                                    /> :
                                                    <CustomAvatar
                                                        className="mb-4 rounded-full w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                                                        size="90"
                                                        name={userProfileInfo?.firstName} />}
                                                <div className="flex flex-col mt-2">
                                                    <label htmlFor="profile-image" className="px-4 py-1 bg-primary-700 hover:bg-primary-800 text-white text-center font-montserrat rounded-md dark:text-white">
                                                        Choose file
                                                        <input type="file" accept="image/*" name="file"
                                                            className="hidden"
                                                            id="organizationlogo" title=""
                                                        />

                                                    </label>
                                                    <span className="mt-1 ml-2 text-sm text-gray-500 dark:text-white">'No File Chosen'</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-16">
                                        <div className='float-right p-2'>
                                            <Button
                                                type="submit"
                                                title="Add new credential-definition on ledger"
                                                fill="none"
                                                className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                                            >
                                                <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                                                </svg>
                                                Update
                                            </Button>
                                        </div>
                                        <div className='float-right p-3'>
                                            <Button
                                                type="reset"
                                                color='bg-primary-800'
                                                className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-3 mr-2 ml-auto dark:text-white'

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

