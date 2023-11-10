import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage, getUserProfile, setToLocalStorage } from '../../api/Auth';
import BreadCrumbs from '../BreadCrumbs';
import type { UserProfile } from './interfaces';
import DisplayUserProfile from './DisplayUserProfile';
import React from 'react';
import AddPasskey from './AddPasskey';
import EditUserProfile from './EditUserProfile';

interface IUserProfile {
  firstName: string
  lastName: string
  email: string
  profileImg: string
}

const UserProfile = ({ noBreadcrumb }: { noBreadcrumb?: boolean }) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [prePopulatedUserProfile, setPrePopulatedUserProfile] = useState<IUserProfile | null>(null);

  const fetchUserProfile = async () => {
    try {
      const token = await getFromLocalStorage(storageKeys.TOKEN);
      const userDetailsResponse = await getUserProfile(token);
      const { data } = userDetailsResponse as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setPrePopulatedUserProfile(data?.data);
        await setToLocalStorage(storageKeys.USER_PROFILE, data?.data)
        await setToLocalStorage(storageKeys.USER_EMAIL, data?.data?.email)
      }
    } catch (error) {
    }
  };

  const toggleEditProfile = async () => {
    await fetchUserProfile()
    setIsEditProfileOpen(!isEditProfileOpen);
  };


  useEffect(() => {
    fetchUserProfile();
  }, []);


  const updatePrePopulatedUserProfile = (updatedProfile: IUserProfile) => {
    setPrePopulatedUserProfile(updatedProfile);
  };

  return (

    <div className={`mb-4 col-span-full xl:mb-2 p-4 ${noBreadcrumb ? "mx-auto max-w-screen-xl" : ""}`}>
      {!noBreadcrumb && <BreadCrumbs />}
      <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
        User's Profile
      </h1>

      <div>
        <div className=' h-full flex flex-auto flex-col justify-between'>
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
              <li className="mr-2">
                <button
                  className="text-xl inline-block p-4 border-b-2 rounded-t-lg text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 border-blue-600 dark:border-blue-500"
                  id="profile-tab"
                  data-tabs-target="#profile"
                  type="button"
                  role="tab"
                  aria-controls="profile"
                  aria-selected="false">
                  Profile
                </button>
              </li>
              <li className="mr-2">
                <button
                  className="inline-block p-4 border-b-2 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-xl"
                  id="passkey-tab"
                  data-tabs-target="#dashboard"
                  type="button"
                  role="tab"
                  aria-controls="dashboard"
                  aria-selected="false"
                >
                  Passkey
                </button>
              </li>
            </ul>
          </div>

        </div>
        <div id="myTabContent">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">

            {!isEditProfileOpen && prePopulatedUserProfile && (
              <DisplayUserProfile
                toggleEditProfile={toggleEditProfile}
                userProfileInfo={prePopulatedUserProfile}
              />
            )}

            {isEditProfileOpen && prePopulatedUserProfile && (
              <EditUserProfile
                toggleEditProfile={toggleEditProfile}
                userProfileInfo={prePopulatedUserProfile}
                updateProfile={updatePrePopulatedUserProfile}
              />
            )}

          </div>
          <div className="hidden rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
            <AddPasskey />
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
