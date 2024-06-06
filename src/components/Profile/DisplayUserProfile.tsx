import type { DisplayUserProfileProps } from './interfaces';
import CustomAvatar from '../Avatar/index';
import { Button } from 'flowbite-react';

const DisplayUserProfile = ({
	toggleEditProfile,
	userProfileInfo,
}: DisplayUserProfileProps) => {
	return (
		<div className="h-full flex flex-auto flex-col px-4 py-4 sm:py-6">
			<div className="w-full mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
				<div className="px-6 py-6">
					<div className="flex justify-between space-x-4">
						<div>
							<h1 className="text-gray-500 text-xl font-medium dark:text-white">
								General
							</h1>
							<span className="flex flex-wrap text-start text-gray-700 text-sm dark:text-white whitespace-normal">
								Basic info, like your first name, last name and profile image
								that will be displayed
							</span>
						</div>

						<Button
							type="button"
							color="bg-primary-800"
							onClick={toggleEditProfile}
							className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
						>
							<svg
								className="h-5 w-6 mr-1 text-white"
								viewBox="0 0 24 24"
								strokeWidth="2"
								stroke="currentColor"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" />
								<path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
								<path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
								<line x1="16" y1="5" x2="19" y2="8" />
							</svg>
							Edit
						</Button>
					</div>

					<div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
						<div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">
							First Name
						</div>
						<div className="col-span-2 font-medium text-gray-900 dark:text-white">
							{userProfileInfo?.firstName ? userProfileInfo.firstName : 'N/A'}
						</div>
					</div>
					<div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
						<div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">
							Last Name
						</div>
						<div className="col-span-2 font-medium text-gray-900 dark:text-white">
							{userProfileInfo?.lastName ? userProfileInfo.lastName : 'N/A'}
						</div>
					</div>
					<div className="grid md:grid-cols-3 gap-4 py-8 border-gray-200 dark:border-gray-600 items-center">
						<div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">
							Profile Image
						</div>
						<div className="focus:ring-indigo-600 col-span-2 w-full focus-within:ring-indigo-600 focus-within:border-indigo-600 focus:border-indigo-600">
							<div className="flex items-center gap-4 space-x-4">
								{userProfileInfo?.profileImg ? (
									<img
									className="mb-4 rounded-full w-24 h-24 sm:mb-0 xl:mb-4 2xl:mb-0"
									src={userProfileInfo?.profileImg}
									alt="Profile Picture"
								  />
								) : (
								  <CustomAvatar
									className="mb-4 rounded-full w-24 h-24 sm:mb-0 xl:mb-4 2xl:mb-0"
									size="80px"
									name={userProfileInfo?.firstName} />
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DisplayUserProfile;
