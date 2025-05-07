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

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-[#ffffff]' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image
            src={CredeblLogo}
            alt='Logo'
            width={CredeblLogoWidth}
            height={CredeblLogoHeight}
          />
        </div>
        <div className='relative z-10 flex flex-1 items-center justify-center'>
          <Image
            src={signInImg}
            alt='Sign In Illustration'
            width={signInWidth}
            height={signInHeight}
            className='h-auto max-w-full object-contain'
          />
        </div>
        <footer className='relative z-20 text-center'>
          <div className='text-sm text-gray-500'>
            © 2019 - {new Date().getFullYear()} AYANWORKS | All rights
            reserved.
          </div>
        </footer>
      </div>

      <div className='relative flex h-screen w-full items-center justify-center bg-[image:var(--card-gradient)]'>
        <SignUpUser />
      </div>
    </div>
  );
}
