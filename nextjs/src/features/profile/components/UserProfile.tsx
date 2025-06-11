'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [userEmail, setUserEmail] = useState('')
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
          setUserEmail(response.data.data.email)
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

  const handleTabChange = (value: string): void => {
    setActiveTab(value as 'profile' | 'passkey')
  }

  return (
    <div className="mx-auto p-6">
      <h1 className="text-foreground mb-6 text-2xl font-semibold">
        User Profile
      </h1>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={handleTabChange}
        className="mb-6 w-full"
      >
        <TabsList>
          <TabsTrigger value="profile" className="relative">
            Profile
          </TabsTrigger>
          <TabsTrigger value="passkey">Passkey</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-lg px-6">
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
          <AddPasskey email={userEmail} />
        )}
      </div>
    </div>
  )
}
