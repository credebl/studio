'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  checkUserExist,
  passwordEncryption,
  sendVerificationMail
} from '@/app/api/Auth';
import { apiStatusCodes, emailRegex } from '@/config/CommonConstant';
import { envConfig } from '@/config/envConfig';
import { AxiosResponse } from 'axios';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepEmailProps {
  email: string;
  setEmail: (value: string) => void;
  goToNext: () => void;
}

export default function EmailVerificationForm({
  email,
  setEmail,
  goToNext
}: StepEmailProps) {
  const [loading, setLoading] = useState(false);
  const [verifyLoader, setVerifyLoader] = useState(false);

  const [showEmailVerification, setShowEmailVerification] = useState<{
    message: string;
    isError: boolean;
    type: string;
  }>({ message: '', isError: false, type: '' });

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .matches(emailRegex, 'Invalid email address')
  });

  const handleSendVerificationEmail = async (email: string) => {
    try {
      setVerifyLoader(true);

      const payload = {
        email,
        clientId: passwordEncryption(envConfig.PLATFORM_DATA.clientId),
        clientSecret: passwordEncryption(envConfig.PLATFORM_DATA.clientSecret)
      };

      const userRsp = await sendVerificationMail(payload);
      const { data } = userRsp as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setShowEmailVerification({
          message: 'Verification email sent. Please check your inbox.',
          isError: false,
          type: 'success'
        });
      } else {
        setShowEmailVerification({
          message: data?.message || 'The verification link has already been sent to your email address.',
          isError: true,
          type: 'danger'
        });
      }
    } catch (err) {
      setShowEmailVerification({
        message: 'An error occurred while sending verification email.',
        isError: true,
        type: 'danger'
      });
    } finally {
      setVerifyLoader(false);
    }
  };

  const handleVerifyEmail = async (emailValue: string) => {
    setLoading(true);
    setShowEmailVerification({ message: '', isError: false, type: '' });

    try {
      const userRsp = await checkUserExist(emailValue);
      const { data } = userRsp as AxiosResponse;
      const { isEmailVerified, isRegistrationCompleted } = data?.data || {};

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (isEmailVerified) {
          if (isRegistrationCompleted) {
            setShowEmailVerification({
              message: 'Email is already registered.',
              isError: true,
              type: 'danger'
            });
          } else {
            setEmail(emailValue);
            goToNext();
          }
        } else {
          await handleSendVerificationEmail(emailValue);
        }
      } else {
        setShowEmailVerification({
          message: data?.data?.message || 'Something went wrong.',
          isError: true,
          type: 'danger'
        });
      }
    } catch (err) {
      setShowEmailVerification({
        message: 'An unexpected error occurred. Please try again.',
        isError: true,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ email }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await handleVerifyEmail(values.email);
      }}
      validateOnBlur
      validateOnChange
    >
      {({ errors, touched, handleChange, handleBlur, values }) => (
        <FormikForm>
          {showEmailVerification.message && (
            <Alert
              variant={
                showEmailVerification.type === 'success'
                  ? 'default'
                  : 'destructive'
              }
              className='mb-4'
            >
              <AlertDescription>
                {showEmailVerification.message}
              </AlertDescription>
            </Alert>
          )}
          <div className='h-12'>
            <Input
              placeholder='Enter your email'
              type='email'
              name='email'
              value={values.email}
              onChange={(e) => {
                handleChange(e);
                setEmail(e.target.value);
              }}
              onBlur={handleBlur}
            />

            {touched.email && errors.email && (
              <div className='text-destructive text-left'>{errors.email}</div>
            )}
          </div>

          <Button
            type='submit'
            className='mt-6 w-full'
            disabled={loading || verifyLoader}
          >
            {loading || verifyLoader ? 'Processing...' : 'Continue with email'}
          </Button>
        </FormikForm>
      )}
    </Formik>
  );
}
