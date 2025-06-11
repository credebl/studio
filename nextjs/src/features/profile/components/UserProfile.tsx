'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AddPasskey from '@/features/passkey/AddPasskey'
import DisplayUserProfile from './DisplayUserProfile'
import EditUserProfile from './EditUserProfile'
import { IUserProfile } from '@/components/profile/interfaces'
import Loader from '@/components/Loader'
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
  const [isLoading, setIsLoading] = useState(false)

  const fetchProfile = async (): Promise<void> => {
    if (!token) {
      return
    }
    setIsLoading(true)
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
      console.error('Error fetching user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token])

  const toggleEditProfile = (): void => {
    setIsEditProfileOpen((prev) => !prev)
    // Only refresh data when switching from edit to display mode
    // Don't refresh when opening edit mode to avoid overriding current data
  }

  const updateProfile = (updatedProfile: IUserProfile): void => {
    setPrePopulatedUserProfile(updatedProfile)
    setUserEmail(updatedProfile.email)
    // Note: Don't set isEditProfileOpen here as it will be handled by toggleEditProfile
  }

  const handleTabChange = (value: string): void => {
    setActiveTab(value as 'profile' | 'passkey')
    // Close edit mode when switching tabs
    if (isEditProfileOpen) {
      setIsEditProfileOpen(false)
    }
  }

  const renderProfileContent = (): React.JSX.Element => {
    if (isLoading) {
      return <Loader />
    }

    if (!prePopulatedUserProfile) {
      return <div className="p-6">No profile data available</div>
    }

    if (isEditProfileOpen) {
      return (
        <EditUserProfile
          key={`edit-${prePopulatedUserProfile.id}`} // Force re-render with key
          toggleEditProfile={toggleEditProfile}
          userProfileInfo={prePopulatedUserProfile}
          updateProfile={updateProfile}
        />
      )
    }

    return (
      <DisplayUserProfile
        key={`display-${prePopulatedUserProfile.id}`} // Force re-render with key
        toggleEditProfile={toggleEditProfile}
        userProfileInfo={prePopulatedUserProfile}
      />
    )
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
          renderProfileContent()
        ) : (
          <AddPasskey email={userEmail} />
        )}
      </div>
    </div>
  )
}
