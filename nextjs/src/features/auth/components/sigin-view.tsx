import { Metadata } from 'next';
import UserAuthForm from './user-auth-form';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignIn() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
      <div className='absolute inset-0 bg-[#ffffff]' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image
            src='/images/CREDEBL_Logo_Web.svg'
            alt='Logo'
            width={170}
            height={140}
          />
        </div>
        <div className='relative z-10 flex flex-1 items-center justify-center'>
          <Image
            src='/images/signin.svg'
            alt='Sign In Illustration'
            width={500}
            height={500}
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

      <div className='relative flex h-screen w-full items-center justify-center bg-gradient-to-t from-yellow-100 to-white'>
        <UserAuthForm />
      </div>
    </div>
  );
}
