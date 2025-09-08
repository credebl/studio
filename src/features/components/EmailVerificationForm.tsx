'use client'

import * as Yup from 'yup'

import { Formik, Form as FormikForm } from 'formik'
import React, { useState } from 'react'
import { apiStatusCodes, emailRegex } from '@/config/CommonConstant'
import { checkUserExist, sendVerificationMail } from '@/app/api/Auth'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'

interface StepEmailProps {
  readonly email: string
  readonly setEmail: (value: string) => void
  readonly goToNext: () => void
}

export default function EmailVerificationForm({
  email,
  setEmail,
  goToNext,
}: StepEmailProps): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [verifyLoader, setVerifyLoader] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [addFailure, setAddFailure] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const clientAliasValue = searchParams?.get('clientAlias')

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .matches(emailRegex, 'Invalid email address '),
  })

  const handleSendVerificationEmail = async (email: string): Promise<void> => {
    try {
      setVerifyLoader(true)

      const payload = {
        email,
        clientAlias: clientAliasValue
          ? clientAliasValue
          : process.env.NEXT_PUBLIC_PLATFORM_NAME,
      }

      const userRsp = await sendVerificationMail(payload)
      const { data } = userRsp as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setEmailSuccess(data?.message)
        setAddFailure(null)
      } else {
        setAddFailure(userRsp as string)
        setEmailSuccess(null)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error during sending verification email:', err)
      setAddFailure('An error occurred while sending verification email.')
      setEmailSuccess(null)
    } finally {
      setVerifyLoader(false)
    }
  }

  const handleVerifyEmail = async (emailValue: string): Promise<void> => {
    setLoading(true)
    setEmailSuccess(null)
    setAddFailure(null)

    try {
      const userRsp = await checkUserExist(emailValue)
      const { data } = userRsp as AxiosResponse
      const { isEmailVerified, isRegistrationCompleted } = data?.data ?? {}

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (isEmailVerified) {
          if (isRegistrationCompleted) {
            setAddFailure(data?.data?.message)
          } else {
            setEmail(emailValue)
            goToNext()
          }
        } else {
          await handleSendVerificationEmail(emailValue)
        }
      } else {
        setAddFailure(data?.data?.message ?? 'Something went wrong.')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error during email verification:', err)
      setAddFailure('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Formik
      initialValues={{ email }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await handleVerifyEmail(values.email)
      }}
      validateOnChange
      validateOnBlur
    >
      {({ errors, touched, handleChange, handleBlur, values }) => {
        const handleEmailChange = (
          e: React.ChangeEvent<HTMLInputElement>,
        ): void => {
          handleChange(e)
          setEmail(e.target.value)
        }

        return (
          <FormikForm className="space-y-4">
            {emailSuccess && (
              <div className="w-full" role="alert">
                <AlertComponent
                  message={emailSuccess}
                  type={'success'}
                  onAlertClose={() => {
                    if (emailSuccess) {
                      setEmailSuccess(null)
                    }
                  }}
                />
              </div>
            )}
            {addFailure && (
              <div className="w-full" role="alert">
                <AlertComponent
                  message={addFailure}
                  type={'failure'}
                  onAlertClose={() => {
                    if (addFailure) {
                      setAddFailure(null)
                    }
                  }}
                />
              </div>
            )}

            <div className="h-12">
              <Input
                placeholder="Enter your email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <div className="text-destructive mt-1 text-sm">
                  {errors.email}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={loading || verifyLoader}
            >
              {loading || verifyLoader
                ? 'Processing...'
                : 'Continue with email'}
            </Button>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
