'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IEmailVerifyData, verifyUserMail } from '@/app/api/Auth';
import { apiStatusCodes } from '@/config/CommonConstant';
import { validEmail } from '@/utils/TextTransform';
import { Button } from '@/components/ui/button';
import { AxiosResponse } from 'axios';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verificationCode = searchParams.get('verificationCode') || '';
    const rawEmail = searchParams.get('email') || '';
    const validatedEmail = validEmail(rawEmail);

    const payload: IEmailVerifyData = {
      verificationCode,
      email: validatedEmail
    };

    setEmail(validatedEmail);

    const verifyEmail = async () => {
      try {
        const response = await verifyUserMail(payload);
        const { data } = response as AxiosResponse;

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setError(false);
          setMessage(data?.message);
        } else {
          setError(true);
          setMessage(data?.message || 'Verification failed. Please try again.');
        }
      } catch (err) {
        setError(true);
        setMessage(
          'An error occurred during verification. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleRedirect = () => {
    router.push(`/auth/sign-up?email=${email}`);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-[image:var(--card-gradient)]'>
      <Card className='animate-fade-in rounded-xlp-0 w-full max-w-md shadow-md'>
        <CardContent className='p-8'>
          <div className='text-center'>
            <div className='space-y-6'>
              <div className='flex justify-center'>
                <div className='inline-block rounded-full p-3'>
                  <CheckCircle
                    className='h-16 w-16 text-[var(--color-green)]'
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h1 className='text-2xl font-bold'>Congratulations!</h1>
              <h2 className='text-xl text-gray-700'>
                Email verified successfully
              </h2>
              <Button
                onClick={handleRedirect}
                className='flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 font-medium'
              >
                Continue to Sign Up
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
