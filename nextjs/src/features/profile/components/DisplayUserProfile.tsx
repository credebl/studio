'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Button } from '@/components/ui/button'
import { IDisplayUserProfileProps } from '../../../components/profile/interfaces'
import Image from 'next/image'
import React from 'react'

const DisplayUserProfile = ({
  toggleEditProfile,
  userProfileInfo,
}: IDisplayUserProfileProps): React.JSX.Element => (
  <div className="flex h-full flex-col p-4 sm:py-6">
    <div className="bg-background mx-auto w-full rounded-lg">
      <div className="px-6 py-6">
        <div className="mb-8 flex items-start justify-between space-x-4">
          <div>
            <h1 className="text-foreground text-2xl font-semibold">General</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Basic info like your name and profile image that will be
              displayed.
            </p>
          </div>
          <Button onClick={toggleEditProfile} className="text-base font-medium">
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 7h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3" />
              <path d="M9 15h3l8.5-8.5a1.5 1.5 0 1 0-3-3l-8.5 8.5v3" />
              <line x1="16" y1="5" x2="19" y2="8" />
            </svg>
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid items-center gap-4 md:grid-cols-3">
            <div className="text-muted-foreground text-sm font-medium">
              First Name
            </div>
            <div className="text-foreground text-base font-semibold md:col-span-2">
              {userProfileInfo?.firstName || 'N/A'}
            </div>
          </div>

          <div className="grid items-center gap-4 md:grid-cols-3">
            <div className="text-muted-foreground text-sm font-medium">
              Last Name
            </div>
            <div className="text-foreground text-base font-semibold md:col-span-2">
              {userProfileInfo?.lastName || 'N/A'}
            </div>
          </div>

          <div className="grid items-center gap-4 md:grid-cols-3">
            <div className="text-muted-foreground text-sm font-medium">
              Profile Image
            </div>
            <div className="md:col-span-2">
              {userProfileInfo?.profileImg ? (
                <Image
                  src={userProfileInfo.profileImg}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src=""
                    alt={userProfileInfo?.email || 'Unknown'}
                  />
                  <AvatarFallback>
                    {userProfileInfo?.firstName?.[0]?.toUpperCase() ||
                      userProfileInfo?.lastName?.[0]?.toUpperCase() ||
                      '?'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default DisplayUserProfile
