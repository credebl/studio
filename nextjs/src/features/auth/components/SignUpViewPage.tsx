'use client';
import { Metadata } from 'next';
import Image from 'next/image';
import SignUpUser from './SignUpUser';
import {
  CredeblLogo,
  CredeblLogoHeight,
  CredeblLogoWidth,
  signInHeight,
  signInImg,
  signInWidth
} from '@/config/CommonConstant';
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
      <div className='absolute top-4 left-4 z-20'>
        <Image
          height={CredeblLogoHeight}
          width={CredeblLogoWidth}
          alt='Logo'
          src={logoImageSrc}
        />
      </div>

      <div className='flex flex-1 items-center justify-center px-4'>
        <SignUpUser />
      </div>

      <footer className='text-muted-foreground mb-4 text-center text-sm'>
        © 2019 - {new Date().getFullYear()} AYANWORKS | All rights reserved.
      </footer>
    </div>
  );
}
