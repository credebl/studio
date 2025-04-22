'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/authSlice';
import { getUserProfile } from '@/app/api/Auth';
import { apiStatusCodes } from '@/config/CommonConstant';
import { useEffect, useState } from 'react';
import { IUserProfile } from '../profile/interfaces';
import { clearOrgId } from '@/lib/orgSlice';
import { persistor } from '@/lib/store';

export function UserNav() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const token = useAppSelector((state) => (state as any).auth.token);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const response = await getUserProfile(token);
        if (
          typeof response !== 'string' &&
          response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ) {
          setUserProfile(response.data.data);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user profile:', error);
      }
    }

    fetchProfile();
  }, [token]);

  if (!token) return null;

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
              {userProfile?.email?.[0]?.toUpperCase() || '?'}
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
            <p className='mb-5 text-sm leading-none font-medium'>
              {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className='text-sm leading-none font-medium'>
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              router.push('/profile');
            }}
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Developer Settings</DropdownMenuItem>
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
