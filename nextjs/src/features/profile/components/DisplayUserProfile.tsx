'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Mail, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IDisplayUserProfileProps } from '../../../components/profile/interfaces'
import React from 'react'

const DisplayUserProfile = ({
  toggleEditProfile,
  userProfileInfo,
}: IDisplayUserProfileProps): React.JSX.Element => (
  <div className="flex h-full flex-col sm:py-6">
    <div className="bg-background mx-auto w-full rounded-lg">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-32 space-x-6">
          <div className="">
            {userProfileInfo?.profileImg ? (
              <img
                src={userProfileInfo.profileImg as string}
                alt="Profile Preview"
                className="h-48 w-48 rounded-full object-cover"
              />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={userProfileInfo?.email || 'Unknown'} />
                <AvatarFallback>
                  {userProfileInfo?.firstName?.[0]?.toUpperCase() ||
                    userProfileInfo?.lastName?.[0]?.toUpperCase() ||
                    '?'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex flex-1 flex-col space-y-4">
            <div>
              <h2 className="text-foreground mb-1 text-3xl font-bold">
                {userProfileInfo?.firstName} {userProfileInfo?.lastName}
              </h2>
              <p className="text-muted-foreground mb-2 flex items-center gap-2 text-lg font-medium">
                <User width={16} height={16} />
                {userProfileInfo?.username}
              </p>

              <p className="text-muted-foreground mb-2 flex items-center gap-2 text-lg font-medium">
                <Mail width={16} height={16} />
                {userProfileInfo?.email}
              </p>
            </div>

            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-foreground text-2xl font-bold">
                  {userProfileInfo?.userOrgRoles?.filter(
                    (role) => role.orgRole.name === 'owner',
                  ).length || 0}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Organizations Owned
                </div>
              </div>
              <div className="text-center">
                <div className="text-foreground text-2xl font-bold">
                  {userProfileInfo?.userOrgRoles?.filter(
                    (role) => role.orgRole.name === 'member',
                  ).length || 0}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Member organizations
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="bg-transparent hover:bg-transparent"
          type="button"
          size="icon"
          onClick={toggleEditProfile}
        >
          <Edit className="mr-12" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Organizations associated
          </h3>

          {userProfileInfo?.userOrgRoles &&
          userProfileInfo.userOrgRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userProfileInfo.userOrgRoles
                .filter((role) => role.organisation)
                .map((role) => (
                  <Card
                    key={role.id}
                    variant="secondary"
                    className="inline-flex items-center border px-3 py-1 text-xs font-medium"
                  >
                    {role.organisation.logoUrl ? (
                      <img
                        src={role.organisation.logoUrl}
                        alt={role.organisation.name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs font-bold">
                          {role.organisation.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span>{role.organisation.name}</span>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <svg
                className="mx-auto mb-4 h-12 w-12 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p>No organizations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default DisplayUserProfile
