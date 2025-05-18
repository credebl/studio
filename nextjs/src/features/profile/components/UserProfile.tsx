'use client'

import React, { useEffect, useState } from 'react'

import AddPasskey from '@/features/passkey/AddPasskey'
import DisplayUserProfile from './DisplayUserProfile'
import EditUserProfile from './EditUserProfile'
import { IUserProfile } from '@/components/profile/interfaces'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getUserProfile } from '@/app/api/Auth'
import { useAppSelector } from '@/lib/hooks'

export default function UserProfile(): React.JSX.Element {
  const token = useAppSelector((state) => state.auth.token)

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [prePopulatedUserProfile, setPrePopulatedUserProfile] =
    useState<IUserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'passkey'>('profile')

  useEffect(() => {
    async function fetchProfile(): Promise<void> {
      if (!token) {
        return
      }
      try {
        const response = await getUserProfile(token)
        if (
          typeof response !== 'string' &&
          response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ) {
          setPrePopulatedUserProfile(response.data.data)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user profile:', error)
      }
    }

    fetchProfile()
  }, [token])

  const toggleEditProfile = (): void => {
    setIsEditProfileOpen((prev) => !prev)
  }

  const updateProfile = (updatedProfile: IUserProfile): void => {
    setPrePopulatedUserProfile(updatedProfile)
  }

  return (
    <div className="mx-auto p-6">
      <h1 className="text-foreground mb-6 text-2xl font-semibold">
        User Profile
      </h1>

      <div className="mb-6 flex gap-4">
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

      <div className="bg-card rounded-lg p-6">
        {activeTab === 'profile' ? (
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
        ) : (
          <AddPasskey />
        )}
      </div>
    </div>
  )
}
