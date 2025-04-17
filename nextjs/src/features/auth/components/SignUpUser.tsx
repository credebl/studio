'use client';
import React, { useState } from 'react';
import EmailVerificationForm from './EmailVerificationForm';
import UserInfoForm from './UserInfoForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignUpUser() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='relative w-[480px] rounded-xl border border-gray-200 bg-white p-6 shadow-md'>
        {/* {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className='absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-800'
          >
            <ArrowLeft className='h-5 w-5' />
            Back
          </button>
        )} */}

        <h2 className='mb-2 text-center text-xl font-semibold'>
          Create an account
        </h2>

        <div className='mb-6 flex items-center justify-center gap-2'>
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step === s
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {i < 1 && (
                <div
                  className={`h-1 w-6 rounded-full ${
                    step > s ? 'bg-yellow-500' : 'bg-gray-200'
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

        <div className='mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link href='/auth/sign-in'>
            <span className='hover:underline'>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
