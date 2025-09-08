'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Mail } from 'lucide-react'
import React, { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
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
  orgId: string
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
  const roles = useMemo(() => {
    const map: Record<string, string[]> = {}

    userProfileInfo?.userOrgRoles?.forEach((val) => {
      if (val?.orgId) {
        map[val.orgId] ??= []
        if (!map[val.orgId].includes(val.orgRole.name)) {
          map[val.orgId].push(val.orgRole.name)
        }
      }
    })

    return map
  }, [userProfileInfo])

  const orgPresent = useMemo(() => {
    const roles = userProfileInfo?.userOrgRoles || []
    const uniqueOrgsMap = new Map<string, UserOrgRole>()

    roles.forEach((role) => {
      if (role.organisation && !uniqueOrgsMap.has(role.organisation.id)) {
        uniqueOrgsMap.set(role.organisation.id, role)
      }
    })

    return Array.from(uniqueOrgsMap.values())
  }, [userProfileInfo])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        <Card className="relative col-span-1 flex flex-col items-center space-y-4 p-6 text-center shadow">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleEditProfile}
            className="absolute top-4 right-4"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {userProfileInfo?.profileImg ? (
            <img
              src={userProfileInfo.profileImg}
              alt="Profile"
              className="h-28 w-28 rounded-full object-cover"
            />
          ) : (
            <Avatar className="h-28 w-28">
              <AvatarImage src="" alt={userProfileInfo?.email || 'Unknown'} />
              <AvatarFallback className="text-2xl">
                {userProfileInfo?.firstName?.[0]?.toUpperCase() ||
                  userProfileInfo?.lastName?.[0]?.toUpperCase() ||
                  '?'}
              </AvatarFallback>
            </Avatar>
          )}

          <div>
            <h2 className="max-w-full text-2xl font-bold break-all">
              {userProfileInfo?.firstName} {userProfileInfo?.lastName}
            </h2>
            <p className="text-muted-foreground text-sm">
              {userProfileInfo?.username}
            </p>
            <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {userProfileInfo?.email}
            </p>
          </div>

          {/* Stats */}
          <div className="text-muted-foreground mt-2 grid w-full grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-lg font-semibold">
                {userProfileInfo?.userOrgRoles?.filter(
                  (role) => role.orgRole.name === 'owner',
                ).length || 0}
              </p>
              <p>Organizations Owned</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {userProfileInfo?.userOrgRoles?.filter(
                  (role) => role.orgRole.name === 'member',
                ).length || 0}
              </p>
              <p>Member Organizations</p>
            </div>
          </div>
        </Card>

        <div className="col-span-1 md:col-span-2">
          <RecentActivity />
        </div>
      </div>

      <Card className="p-6">
        {orgPresent && orgPresent.length > 0 ? (
          <>
            <h3 className="mb-4 text-lg font-semibold">
              Organizations Associated
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar className="h-12 w-12">
                        <AvatarFallback
                          className={`${bg} ${text} text-xs font-bold`}
                        >
                          {role.organisation.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <span className="pl-2 text-base">
                        {role.organisation.name}
                      </span>
                      <div className="pl-2">
                        <b>Role</b> : {roles[role.orgId]?.join(', ') ?? ''}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-2 text-2xl font-bold">No Organization</div>
            <p className="text-sm">
              Get started by creating a new organization.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DisplayUserProfile
