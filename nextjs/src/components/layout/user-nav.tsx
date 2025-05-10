'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IUserProfile } from '../profile/interfaces';
import { ThemeSelector } from '../theme-selector';
import { apiStatusCodes } from '@/config/CommonConstant';
import { getUserProfile } from '@/app/api/Auth';
import { logout } from '@/lib/authSlice';
import { persistor } from '@/lib/store';
import { setUserProfileDetails } from '@/lib/userSlice';
import { useAppSelector } from '@/lib/hooks';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        return;
      }
      try {
        const response = await getUserProfile(token);
        if (
          typeof response !== 'string' &&
          response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ) {
          setUserProfile(response.data.data);
          dispatch(setUserProfileDetails(response.data.data));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    fetchProfile();
  }, [token]);

  if (!token) {
    return null;
  }

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    router.push('/auth/sign-in');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={userProfile?.profileImg} alt='profileImg' />
            <AvatarFallback>
              {userProfile?.email?.[0]?.toUpperCase() ?? ''}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-56'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className='text-sm leading-none font-medium'>
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem>Developer Settings</DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
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
  );
}
