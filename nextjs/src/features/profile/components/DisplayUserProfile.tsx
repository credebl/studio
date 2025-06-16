'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Mail, User } from 'lucide-react'
import React, { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getRandomAvatarColor } from '@/utils/avatarColors'

interface OrgRole {
  name: string
}

interface Organisation {
  id: string
  name: string
  logoUrl?: string | null
}

interface UserOrgRole {
  id: string
  orgRole: OrgRole
  organisation: Organisation
}

interface DisplayUserProfileInfo {
  profileImg?: string | null
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  userOrgRoles?: UserOrgRole[]
}

interface IDisplayUserProfileProps {
  toggleEditProfile: () => void
  userProfileInfo: DisplayUserProfileInfo
}

const DisplayUserProfile = ({
  toggleEditProfile,
  userProfileInfo,
}: IDisplayUserProfileProps): React.JSX.Element => {
  // const [orgPresent, setOrgPresent] = useState<[] | UserOrgRole[]>()
  const orgPresent = useMemo(
    () =>
      userProfileInfo?.userOrgRoles?.filter((role) => role.organisation) || [],
    [userProfileInfo],
  )

  return (
    <Card className="flex h-full flex-col p-8 sm:py-6">
      <div className="bg-background mx-auto w-full rounded-lg">
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center justify-center gap-32 space-x-6">
            <div className="">
              {userProfileInfo?.profileImg ? (
                <img
                  src={userProfileInfo.profileImg}
                  alt="Profile Preview"
                  className="h-48 w-48 rounded-full object-cover"
                />
              ) : (
                <Avatar className="h-48 w-48">
                  <AvatarImage
                    src=""
                    alt={userProfileInfo?.email || 'Unknown'}
                  />
                  <AvatarFallback className="text-4xl">
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
            <span>
              <Edit className="mr-12" />
            </span>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg">
            <div className="mt-4">
              {orgPresent && orgPresent.length > 0 ? (
                <>
                  <div className="text-foreground mb-4 text-lg font-semibold">
                    Organizations associated
                  </div>
                  <hr />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {orgPresent.map((role) => {
                      const { bg, text } = getRandomAvatarColor(
                        role.organisation.name,
                      )
                      return (
                        <Card
                          key={role.id}
                          className="inline-flex items-center border px-3 py-1 text-xs font-medium"
                        >
                          {role.organisation.logoUrl ? (
                            <img
                              src={role.organisation.logoUrl}
                              alt={role.organisation.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback
                                className={`${bg} ${text} text-xs font-bold`}
                              >
                                {role.organisation.name
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="pl-2">{role.organisation.name}</span>
                        </Card>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center border-t pt-6">
                  <div className="text-center">
                    <div className="mb-4 text-2xl font-bold">
                      No Organization
                    </div>
                    <p className="text-lg">
                      Get started by creating a new Organization
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DisplayUserProfile
