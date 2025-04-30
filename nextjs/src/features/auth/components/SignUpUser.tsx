'use client';

import React, { useState } from 'react';
import EmailVerificationForm from './EmailVerificationForm';
import UserInfoForm from './UserInfoForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignUpUser() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const route = useRouter();
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='bg-card relative w-[480px] rounded-xl p-6 shadow'>
    
        <h2 className='mb-2 text-center text-xl font-semibold'>
          Create an account
        </h2>

        <div className='mb-6 flex items-center justify-center gap-2'>
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} `}
              >
                {s}
              </div>
              {i < 1 && (
                <div
                  className={`h-1 w-6 rounded-full ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <EmailVerificationForm
            email={email}
            setEmail={setEmail}
            goToNext={() => setStep(2)}
          />
        )}
        {step === 2 && <UserInfoForm email={email} goBack={() => setStep(1)} />}

        <div className='my-6 flex items-center justify-center gap-4'>
          <hr className='border-border flex-grow border-t' />
          <span className='text-muted-foreground text-sm'>OR</span>
          <hr className='border-border flex-grow border-t' />
        </div>

        <div className='mt-6 flex flex-col gap-3'>
          <Button
            type='button'
            className='flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm'
            onClick={() => route.push('google')}
          >
            <Image
              src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
              alt='Google'
              width={15}
              height={15}
            />
            Sign in with Google
          </Button>

          <Button
            type='button'
            className='flex w-full items-center justify-center gap-2 rounded-md bg-black text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95'
            onClick={() => route.push('#')}
          >
            <Github className='h-5 w-5' />
            <span className='text-sm font-medium'>Sign in with GitHub</span>
          </Button>
        </div>
        <div className='text-muted-foreground mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link href='/auth/sign-in'>
            <span className='text-primary hover:underline'>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
