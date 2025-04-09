import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { IconStar } from '@tabler/icons-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Sign Up
      </Link>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-[#fefceb]' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image
            src='/images/CREDEBL_Logo_Web.svg'
            alt='Logo'
            width={70}
            height={40}
          />
        </div>

        <div className='relative z-10 flex flex-1 items-center justify-center'>
          <Image
            src='/images/signin.svg'
            alt='Sign In Illustration'
            width={500}
            height={500}
            className='h-auto max-w-full object-contain'
            priority
          />
        </div>

        <footer className='relative z-20 text-center'>
          <div className='text-sm text-gray-500'>
            © 2019 - {new Date().getFullYear()} AYANWORKS | All rights
            reserved.
          </div>
        </footer>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <ClerkSignUpForm
            initialValues={{
              emailAddress: 'your_mail+clerk_test@example.com'
            }}
          />
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
