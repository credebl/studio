'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { IUserProfile } from '../profile/interfaces'
import { ThemeSelector } from '../theme-selector'
import { apiRoutes } from '@/config/apiRoutes'
import { apiStatusCodes } from '@/config/CommonConstant'
import { envConfig } from '@/config/envConfig'
import { getUserProfile } from '@/app/api/Auth'
import { logout } from '@/lib/authSlice'
import { persistor } from '@/lib/store'
import { resetOrgState } from '@/lib/orgSlice'
import { resetVerificationState } from '@/lib/verificationSlice'
import { setUserProfileDetails } from '@/lib/userSlice'
import { signOut } from 'next-auth/react'
import { useAppSelector } from '@/lib/hooks'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'

export function UserNav(): React.JSX.Element | null {
  const dispatch = useDispatch()
  const router = useRouter()

  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null)
  const token = useAppSelector((state) => state.auth.token)
  const sessionId = useAppSelector((state) => state.auth.sessionId)
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
          setUserProfile(response.data.data)
          dispatch(setUserProfileDetails(response.data.data))
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user profile:', error)
      }
    }

    fetchProfile()
  }, [token])

  if (!token) {
    return null
  }

  const logoutUser = async (): Promise<void> => {
    const rootKey = 'persist:root'
    const payload = {
      sessions: [sessionId],
    }

    const response = await fetch(
      `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.signOut}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      console.error('Logout API failed')
    }

    // 2. Then sign out locally with NextAuth
    if (localStorage.getItem(rootKey)) {
      localStorage.removeItem(rootKey)

      const interval = setInterval(() => {
        if (!localStorage.getItem(rootKey)) {
          clearInterval(interval)
          void signOut({ callbackUrl: '/sign-in' })
        }
      }, 100)
    } else {
      void signOut({ callbackUrl: '/sign-in' })
    }
  }

  const handleLogout = async (): Promise<void> => {
    dispatch(resetOrgState())
    dispatch(resetVerificationState())
    dispatch(logout())
    await persistor.purge()
    logoutUser()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="">
            <AvatarImage src={userProfile?.profileImg} alt="profileImg" />
            <AvatarFallback className="text-md">
              {userProfile?.email?.[0]?.toUpperCase() ?? ''}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 border"
        align="end"
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className="text-sm leading-none font-medium">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push('/developers-setting')}>
            Developer Settings
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border">
              <ThemeSelector />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
