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
                    <div className='w-full mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700'>
                        <div className="px-6 py-6">

                            <form action="#">
                                <div className="form-container">
                                    <div className="flex items-center justify-between">

                                        <div>
                                            <h1 className="text-gray-500 text-xl font-medium font-montserrat dark:text-white">General</h1>
                                            <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal dark:text-white">Basic info, like your first name, last name and profile image that will be displayed</p>
                                        </div>

                                        <Button
                                            type="button"
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
                                        <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                                            {userProfileInfo?.firstName ? (
                                                userProfileInfo.firstName
                                            ) : (
                                                "N/A"
                                            )}

                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                                        <div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">Last Name</div>
                                        <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                                            {userProfileInfo?.lastName ? (
                                                userProfileInfo.lastName
                                            ) : (
                                                "N/A"
                                            )}

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
                                                        className="mb-4 border border-b rounded-full w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                                                        size="90"
                                                        src={userProfileInfo?.firstName || '../../public/images/profile.png'}
                                                        name={userProfileInfo?.firstName} />}
                                            </div>
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

