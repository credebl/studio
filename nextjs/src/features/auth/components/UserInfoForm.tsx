'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { passwordEncryption, addPasswordDetails } from '@/app/api/Auth';
import { apiStatusCodes } from '@/config/CommonConstant';
import { AxiosResponse } from 'axios';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';

interface StepUserInfoProps {
  email: string;
  goBack: () => void;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'Please enter at least two characters')
    .max(50, 'Name cannot exceed 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Please enter at least two characters')
    .max(50, 'Name cannot exceed 50 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required')
});

export default function UserInfoForm({ email, goBack }: StepUserInfoProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState({
    message: '',
    isError: false,
    type: ''
  });
  const [usePassword, setUsePassword] = useState(true);
  const router = useRouter();

  const onSubmit = async (values: {
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    setServerError('');
    setShowEmailVerification({ message: '', isError: false, type: '' });

    const payload = {
      email: email,
      password: passwordEncryption(values.password),
      isPasskey: false,
      firstName: values.firstName,
      lastName: values.lastName
    };

    try {
      setLoading(true);
      const userRsp = await addPasswordDetails(payload);
      const { data } = userRsp as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        router.push(
          `/auth/sign-in?signup=true&email=${email}&fidoFlag=false&method=password`
        );
      } else {
        setShowEmailVerification({
          message: data?.message || 'Failed to create account.',
          isError: true,
          type: 'danger'
        });
      }
    } catch (err) {
      setShowEmailVerification({
        message: 'An unexpected error occurred.',
        isError: true,
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, handleChange, handleBlur, values }) => (
        <FormikForm className='space-y-4'>
          {showEmailVerification.message && (
            <div
              className={`alert alert-${showEmailVerification.type === 'danger' ? 'error' : 'success'} mb-4`}
            >
              {showEmailVerification.message}
            </div>
          )}

          <div className='flex gap-3'>
            <div className='flex-1'>
              <Input
                placeholder='First name'
                name='firstName'
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.firstName && touched.firstName && (
                <p className='mt-1 text-sm text-destructive'>{errors.firstName}</p>
              )}
            </div>
            <div className='flex-1'>
              <Input
                placeholder='Last name'
                name='lastName'
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.lastName && touched.lastName && (
                <p className='mt-1 text-sm text-destructive'>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className='relative'>
            <Input placeholder='Email address' value={email} readOnly />
            <CheckCircle className='absolute top-3 right-3 h-5 w-5 text-green-500' />
          </div>

          <div className='flex overflow-hidden rounded-md border'>
            <Button
              type='button'
              className={`flex-1 rounded-none ${usePassword ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setUsePassword(true)}
            >
              <Lock className='mr-2 h-4 w-4' />
              Password
            </Button>
            <Button
              type='button'
              className={`flex-1 rounded-none ${!usePassword ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setUsePassword(false)}
            >
              <KeyRound className='mr-2 h-4 w-4' />
              Passkey
            </Button>
          </div>

          <div>
            <Input
              type='password'
              placeholder='Create password'
              name='password'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password && (
              <p className='mt-1 text-sm text-destructive'>{errors.password}</p>
            )}
          </div>

          <div>
            <Input
              type='password'
              placeholder='Confirm password'
              name='confirmPassword'
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className='mt-1 text-sm text-destructive'>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {serverError && (
            <div className='text-center text-destructive'>{serverError}</div>
          )}

          <div className='flex justify-between gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={goBack}
              className='flex items-center gap-1'
            >
              <ArrowLeft className='h-4 w-4' />
              Back
            </Button>

            <Button
              type='submit'
              className='bg-yellow-500 text-black hover:bg-yellow-600'
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </FormikForm>
      )}
    </Formik>
  );
}
