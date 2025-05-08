'use client';

import { Metadata } from 'next';
import UserAuthForm from './user-auth-form';
import Image from 'next/image';
import {
  CredeblLogoHeight,
  CredeblLogoWidth} from '@/config/CommonConstant';
import { useThemeConfig } from '@/components/active-theme';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInPage() {
  const { activeTheme } = useThemeConfig();

  const logoImageSrc =
    activeTheme === 'credebl'
      ? '/images/CREDEBL_Logo_Web.svg'
      : '/images/sovio_logo.svg';

  return (
    <div className='relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]'>
      <div className='absolute top-8 left-8 z-20'>
        <Image
          height={CredeblLogoHeight}
          width={CredeblLogoWidth}
          alt='Logo'
          src={logoImageSrc}
        />
      </div>

      <div className='flex flex-1 items-center justify-center px-4'>
        <UserAuthForm />
      </div>

      <footer className='text-muted-foreground mb-4 text-center text-sm'>
        © 2019 - {new Date().getFullYear()} AYANWORKS | All rights reserved.
      </footer>
    </div>
  );
}
