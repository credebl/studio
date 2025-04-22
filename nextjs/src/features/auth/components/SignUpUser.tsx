'use client';

import React, { useState } from 'react';
import EmailVerificationForm from './EmailVerificationForm';
import UserInfoForm from './UserInfoForm';
import Link from 'next/link';
// import { ArrowLeft } from 'lucide-react';

export default function SignUpUser() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='bg-card relative w-[480px] rounded-xl p-6 shadow'>
        {/* {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="absolute left-6 top-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
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
