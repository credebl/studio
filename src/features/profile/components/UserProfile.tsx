'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { setFirstName, setProfileId } from '@/lib/profileSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import AddPasskey from '@/features/passkey/AddPasskey'
import DisplayUserProfile from './DisplayUserProfile'
import EditUserProfile from './EditUserProfile'
import { IUserProfile } from '@/components/profile/interfaces'
import Loader from '@/components/Loader'
import Sessions from './Sessions'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getUserProfile } from '@/app/api/Auth'

export default function UserProfile(): React.JSX.Element {
  const token = useAppSelector((state) => state.auth.token)

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [prePopulatedUserProfile, setPrePopulatedUserProfile] =
    useState<IUserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'passkey'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch()

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
        dispatch(setProfileId(response.data.data.id))
        dispatch(setFirstName(response.data.data.firstName))
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

    return (
      <DisplayUserProfile
        key={`display-${prePopulatedUserProfile.id}`} // Force re-render with key
        toggleEditProfile={toggleEditProfile}
        userProfileInfo={prePopulatedUserProfile}
      />
    )
  }

  return (
    <div className="p-6">
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
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="passkey">Passkey</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-8">
          <>
            {renderProfileContent()}

            {/* ✅ Drawer always rendered, controlled by open state */}
            {prePopulatedUserProfile && (
              <Sheet open={isEditProfileOpen} onOpenChange={toggleEditProfile}>
                <SheetContent
                  side="right"
                  className="w-[500px] overflow-y-auto sm:w-[600px]"
                >
                  <SheetHeader>
                    <SheetTitle>Edit Profile</SheetTitle>
                  </SheetHeader>
                  <EditUserProfile
                    toggleEditProfile={toggleEditProfile}
                    userProfileInfo={prePopulatedUserProfile}
                    updateProfile={updateProfile}
                  />
                </SheetContent>
              </Sheet>
            )}
          </>
        </TabsContent>

        <TabsContent value="passkey" className="mt-8">
          <AddPasskey email={userEmail} />
        </TabsContent>

        <TabsContent value="sessions" className="mt-8">
          <Sessions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
