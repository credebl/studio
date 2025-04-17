'use client';

import { getUserProfile } from '@/app/api/Auth';
import { IUserProfile } from '@/components/profile/interfaces';
import { apiStatusCodes } from '@/config/CommonConstant';
import { useAppSelector } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import DisplayUserProfile from './DisplayUserProfile';
import EditUserProfile from './EditUserProfile';

export default function UserProfile() {
  const token = useAppSelector((state) => state.auth.token);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [prePopulatedUserProfile, setPrePopulatedUserProfile] =
    useState<IUserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'passkey'>('profile');

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const response = await getUserProfile(token);
        if (
          typeof response !== 'string' &&
          response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ) {
          setPrePopulatedUserProfile(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    fetchProfile();
  }, [token]);

  const toggleEditProfile = () => {
    setIsEditProfileOpen((prev) => !prev);
  };

  const updateProfile = (updatedProfile: IUserProfile) => {
    setPrePopulatedUserProfile(updatedProfile);
  };

  return (
    <div className='mx-auto p-6'>
      <h1 className='text-foreground mb-6 text-2xl font-semibold'>
        User Profile
      </h1>

      <div className='mb-6 flex gap-4'>
        <button
          onClick={() => setActiveTab('profile')}
          className={`rounded-md px-4 py-2 ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('passkey')}
          className={`rounded-md px-4 py-2 ${activeTab === 'passkey' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Passkey
        </button>
      </div>

      <div className='bg-card rounded-lg p-6'>
        {activeTab === 'profile' && (
          <>
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
                updateProfile={updateProfile}
              />
            )}
          </>
        )}

        {/* {activeTab === 'passkey' && (
          <AddPasskey
            responseMessages={() => ({ type: 'success', message: '' })}
          />
        )} */}
      </div>
    </div>
  );
}
