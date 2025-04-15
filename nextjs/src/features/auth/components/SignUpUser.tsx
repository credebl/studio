'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  checkUserExist,
  passwordEncryption,
  sendVerificationMail
} from '@/app/api/Auth';
import { AxiosResponse } from 'axios';
import { apiStatusCodes } from '@/config/CommonConstant';
import { envConfig } from '@/config/envConfig';

interface emailValue {
  email: string;
}

export default function SignUpUser() {
  const [step, setStep] = useState(1);
  const [usePassword, setUsePassword] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [verifyLoader, setVerifyLoader] = useState<boolean>(false);
  const [erroMsg, setErrMsg] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [nextflag, setNextFlag] = useState<boolean>(false);
  const [enableName, setEnableName] = useState<boolean>(false);
  const [emailAutoFill, setEmailAutoFill] = useState<string>('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const VerifyMail = async (email: string) => {
    try {
      const payload = {
        email: email,
        clientId: passwordEncryption(envConfig.PLATFORM_DATA.clientId),
        clientSecret: passwordEncryption(envConfig.PLATFORM_DATA.clientSecret)
      };

      setVerifyLoader(true);
      const userRsp = await sendVerificationMail(payload);
      const { data } = userRsp as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setVerificationSuccess(data?.message);
        setVerifyLoader(false);
      } else {
        setErrMsg(userRsp as string);
        setVerifyLoader(false);
      }
      return data;
    } catch (error) {
      setErrMsg('An error occurred. Please try again later.');
      setVerifyLoader(false);
    }
  };

  const ValidateEmail = async (values: emailValue) => {
    setVerificationSuccess('');
    setLoading(true);
    const userRsp = await checkUserExist(values?.email);
    const { data } = userRsp as AxiosResponse;
    setLoading(false);
    const { isEmailVerified, isRegistrationCompleted } = data?.data || {};
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      if (isEmailVerified) {
        if (isRegistrationCompleted) {
          setErrMsg(data?.data?.message);
        } else {
          setEmail(values?.email);
        //   setNextFlag(true);
        //   setEnableName(true);
        }
      } else {
        setEmail(values?.email);
        await VerifyMail(values?.email);
      }
    } else {
      setErrMsg(data?.data?.message);
    }
  };

  async function handleCreateAccount(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!firstName || !lastName || !password) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }

      const payload = {
        firstName,
        lastName,
        email,
        password: passwordEncryption(password)
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/sign-in');
      } else {
        setError(data.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='w-[480px] rounded-xl border border-gray-200 bg-white p-6 shadow-md'>
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

        {error && (
          <div className='mb-4 text-center text-sm text-red-600'>{error}</div>
        )}

        {step === 1 && (
          <>
            <Input
              placeholder='Enter your email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mb-6'
            />
            <Button
              className='w-full bg-yellow-500 text-black hover:bg-yellow-600'
              onClick={() => ValidateEmail({ email })}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue with email'}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className='mb-4 flex gap-3'>
              <Input
                placeholder='First name'
                className='flex-1'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder='Last name'
                className='flex-1'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {/* <SignUpUserName /> */}
            </div>

            <div className='relative mb-4'>
              <Input placeholder='Email address' value={email} readOnly />
              <CheckCircle className='absolute top-3 right-3 h-5 w-5 text-green-500' />
            </div>

            <div className='mb-4 flex overflow-hidden rounded-md border'>
              <Button
                type='button'
                className={`flex-1 rounded-none ${
                  usePassword
                    ? 'bg-white text-black'
                    : 'bg-gray-100 text-gray-400'
                }`}
                onClick={() => setUsePassword(true)}
              >
                <Lock className='mr-2 h-4 w-4' />
                Password
              </Button>
              <Button
                type='button'
                className={`flex-1 rounded-none ${
                  !usePassword
                    ? 'bg-white text-black'
                    : 'bg-gray-100 text-gray-400'
                }`}
                onClick={() => setUsePassword(false)}
              >
                <KeyRound className='mr-2 h-4 w-4' />
                Passkey
              </Button>
            </div>

            <Input
              placeholder={
                usePassword ? 'Create password' : 'Enter your passkey'
              }
              type={usePassword ? 'password' : 'text'}
              className='mb-6'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              className='w-full bg-yellow-500 text-black hover:bg-yellow-600'
              onClick={handleCreateAccount}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </>
        )}

        <div className='mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link href='/auth/sign-in'>
            <span className='text-yellow-600 hover:underline'>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
