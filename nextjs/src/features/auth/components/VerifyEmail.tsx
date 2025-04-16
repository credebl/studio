'use client';

import { useEffect, useState } from 'react';
import { EmailVerifyData, verifyUserMail } from '@/app/api/Auth';
import { apiStatusCodes } from '@/config/CommonConstant';
import { validEmail } from '@/utils/TextTransform';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AxiosResponse } from 'axios';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const router = useRouter();

  const verifyEmailSuccess = async (payload: EmailVerifyData) => {
    const response = await verifyUserMail(payload);
    const { data } = response as AxiosResponse;

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setError(false);
      setMessage(data?.message);
    } else {
      setError(true);
      setMessage(response as string);
    }

    setLoading(false);
  };

  useEffect(() => {
    const queryParameters = new URLSearchParams(window?.location?.search);
    const payload: EmailVerifyData = {
      verificationCode: queryParameters.get('verificationCode') || '',
      email: validEmail(queryParameters.get('email') || '')
    };
    setEmail(payload?.email);
    verifyEmailSuccess(payload);
  }, []);

  const handleRedirect = () => {
    router.push(`/auth/sign-up?email=${email}`);
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-6'>
      <div className='text-center'>
        <h1>Congratulations!</h1>
        <h1 className='mb-4 text-3xl font-bold'>Email verified successfully</h1>
        <p className='mb-6'>{message}</p>
        <Button onClick={handleRedirect} className='bg-yellow-500 text-black'>
          Go to Sign Up
        </Button>
      </div>
    </div>
  );
}
