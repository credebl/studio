'use client'

import * as Yup from 'yup'

import { AxiosError, AxiosResponse } from 'axios'
import { CheckCircle, Eye, EyeOff, KeyRound, Lock } from 'lucide-react'
import { Formik, Form as FormikForm } from 'formik'
import {
  IDeviceData,
  IVerifyRegistrationObj,
  IdeviceBody,
} from '@/components/profile/interfaces'
import React, { useEffect, useState } from 'react'
import {
  addDeviceDetails,
  generateRegistrationOption,
  getUserDeviceDetails,
  verifyRegistration,
} from '@/app/api/Fido'
import { apiStatusCodes, passwordRegex } from '@/config/CommonConstant'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addPasswordDetails } from '@/app/api/Auth'
import { passwordValueEncryption } from '@/utils/passwordEncryption'
import { startRegistration } from '@simplewebauthn/browser'
import { v4 as uuidv4 } from 'uuid'

interface StepUserInfoProps {
  email: string
  goBack: () => void
}

export interface RegistrationOptionInterface {
  userName: string
  deviceFlag: boolean
}

export enum Devices {
  Linux = 'linux',
}
export interface AddPasswordDetails {
  email: string
  password: string
  isPasskey: boolean
  firstName: string | null
  lastName: string | null
}

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
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
})

export default function UserInfoForm({
  email,
}: StepUserInfoProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [, setIsDevice] = useState<boolean>(false)
  const [, setShowEmailVerification] = useState({
    message: '',
    isError: false,
    type: '',
  })

  const [, setDeviceList] = useState<IDeviceData[]>([])
  const [usePassword, setUsePassword] = useState(true)
  const [, setDisableFlag] = useState<boolean>(false)
  const [, setAddFailure] = useState<string | null>(null)
  const [, setAddSuccess] = useState<string | null>(null)
  const router = useRouter()
  const [, setFidoLoader] = useState<boolean>(false)
  const [, setFidoError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [passkeyFirstName, setPasskeyFirstName] = useState('')
  const [passkeyLastName, setPasskeyLastName] = useState('')

  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const clientAlias = searchParams.get('clientAlias')

  const onSubmit = async (values: {
    firstName: string
    lastName: string
    password: string
  }): Promise<void> => {
    setServerError('')
    setSuccess(null)
    setFailure(null)
    setShowEmailVerification({ message: '', isError: false, type: '' })
    const encryptedPassword = await passwordValueEncryption(values.password)
    const payload = {
      email,
      password: encryptedPassword,
      isPasskey: false,
      firstName: values.firstName,
      lastName: values.lastName,
    }

    try {
      setLoading(true)
      const userRsp = await addPasswordDetails(payload)
      const { data } = userRsp as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(data?.message || 'Account created successfully!')

        setTimeout(() => {
          router.push(
            redirectTo && clientAlias
              ? `/sign-in?signup=true&email=${email}&redirectTo=${encodeURIComponent(redirectTo)}&clientAlias=${clientAlias}&fidoFlag=false&method=password`
              : `/sign-in?email=${email}&fidoFlag=false&method=password`,
          )
        }, 2000)
      } else {
        setFailure(data?.message || 'Failed to create account.')
      }
    } catch (err) {
      setFailure('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const passkeySubmit = async (values: {
    firstName: string
    lastName: string
  }): Promise<void> => {
    const password: string = uuidv4()
    const encryptedPassword = await passwordValueEncryption(password)
    const payload: AddPasswordDetails = {
      email,
      isPasskey: true,
      firstName: values.firstName,
      lastName: values.lastName,
      password: encryptedPassword,
    }

    setLoading(true)
    try {
      const userRsp = await addPasswordDetails(payload)
      const { data } = userRsp as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        window.location.href =
          '/sign-in?signup=true&fidoFlag=true&method=passkey'
      } else {
        setFailure(data?.message || 'Passkey registration failed')
      }
    } catch (error) {
      setFailure('Error during passkey registration')
    } finally {
      setLoading(false)
    }
  }

  const showFidoError = (error: unknown): void => {
    const err = error as AxiosError
    if (
      err.message.includes('The operation either timed out or was not allowed')
    ) {
      const [errorMsg] = err.message.split('.')
      setFidoError(errorMsg)
    } else {
      setFidoError(err.message)
    }
  }

  const addDeviceDetailsMethod = async (
    deviceBody: IdeviceBody,
  ): Promise<void> => {
    try {
      const deviceDetailsResp = await addDeviceDetails(deviceBody)
      const { data } = deviceDetailsResp as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        passkeySubmit({
          firstName: passkeyFirstName,
          lastName: passkeyLastName,
        })
      }
      setTimeout(() => {
        setAddSuccess('')
        setAddFailure('')
      })
    } catch (error) {
      showFidoError(error)
    }
  }

  const verifyRegistrationMethod = async (
    verifyRegistrationObj: IVerifyRegistrationObj,
    OrgUserEmail: string,
  ): Promise<void> => {
    try {
      const verificationRegisterResp = await verifyRegistration(
        verifyRegistrationObj,
        OrgUserEmail,
      )
      const { data } = verificationRegisterResp as AxiosResponse
      let credentialID = ''

      credentialID = encodeURIComponent(data?.data?.newDevice?.credentialID)
      if (data?.data?.verified) {
        let platformDeviceName = ''

        if (
          verifyRegistrationObj?.authenticatorAttachment === 'cross-platform'
        ) {
          platformDeviceName = 'Passkey'
        } else {
          platformDeviceName = navigator.platform
        }

        const deviceBody: IdeviceBody = {
          userName: OrgUserEmail,
          credentialId: credentialID,
          deviceFriendlyName: platformDeviceName,
        }
        await addDeviceDetailsMethod(deviceBody)
      }
    } catch (error) {
      showFidoError(error)
    }
  }

  const registerWithPasskey = async (flag: boolean): Promise<void> => {
    try {
      const RegistrationOption: RegistrationOptionInterface = {
        userName: email,
        deviceFlag: flag,
      }
      const generateRegistrationResponse =
        await generateRegistrationOption(RegistrationOption)
      const { data } = generateRegistrationResponse as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const opts = data?.data
        const challangeId = opts?.challenge

        if (opts) {
          opts.authenticatorSelection = {
            residentKey: 'preferred',
            requireResidentKey: false,
            userVerification: 'preferred',
          }
        }
        setLoading(false)

        const attResp = await startRegistration(opts)
        const verifyRegistrationObj: IVerifyRegistrationObj = {
          ...attResp,
          challangeId,
        }

        await verifyRegistrationMethod(verifyRegistrationObj, email)
      } else {
        setFailure(
          (generateRegistrationResponse as AxiosResponse)?.data?.message ||
            'An error occurred',
        )
      }
    } catch (error) {
      showFidoError(error)
    }
  }

  const userDeviceDetails = async (): Promise<void> => {
    try {
      setFidoLoader(true)

      const userDeviceDetailsResp = await getUserDeviceDetails(email)
      const { data } = userDeviceDetailsResp as AxiosResponse
      setFidoLoader(false)
      if (userDeviceDetailsResp) {
        const deviceDetails =
          Object.keys(data)?.length > 0
            ? userDeviceDetailsResp?.data?.data.map(
                (data: { lastChangedDateTime: string }) => ({
                  ...data,
                  lastChangedDateTime: data.lastChangedDateTime
                    ? data.lastChangedDateTime
                    : '-',
                }),
              )
            : []
        if (data?.data?.length === 1) {
          setDisableFlag(true)
        } else {
          setDisableFlag(false)
        }
        setDeviceList(deviceDetails)
      }
    } catch (error) {
      setAddFailure('Error while fetching the device details')
      setFidoLoader(false)
    }
  }

  useEffect(() => {
    userDeviceDetails()
    const platform = navigator.platform.toLowerCase()
    if (platform.includes(Devices.Linux)) {
      setIsDevice(true)
    }
  }, [email])

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, handleChange, handleBlur, values }) => (
        <FormikForm className="space-y-4">
          {success && (
            <div className="w-full" role="alert">
              <AlertComponent
                message={success}
                type={'success'}
                onAlertClose={() => setSuccess(null)}
              />
            </div>
          )}
          {failure && (
            <div className="w-full" role="alert">
              <AlertComponent
                message={failure}
                type={'failure'}
                onAlertClose={() => setFailure(null)}
              />
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="First name"
                name="firstName"
                value={values.firstName}
                onChange={(e) => {
                  handleChange(e)
                  setPasskeyFirstName(e.target.value)
                }}
                onBlur={handleBlur}
                className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
              />
              {errors.firstName && touched.firstName && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Input
                placeholder="Last name"
                name="lastName"
                value={values.lastName}
                onChange={(e) => {
                  handleChange(e)
                  setPasskeyLastName(e.target.value)
                }}
                onBlur={handleBlur}
                className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
              />
              {errors.lastName && touched.lastName && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            <Input
              placeholder="Email address"
              value={email}
              readOnly
              className="bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]"
            />
            <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-[var(--color-bg-success)]" />
          </div>

          <div className="bg-muted mb-4 flex h-10 overflow-hidden rounded-md p-1 text-sm font-medium">
            <button
              type="button"
              className={`flex flex-1 items-center justify-center rounded-none p-1 ${
                usePassword
                  ? 'bg-background text-foreground ring-offset-background shadow-xs'
                  : ''
              }`}
              onClick={() => setUsePassword(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Password
            </button>

            <button
              type="button"
              className={`flex flex-1 items-center justify-center rounded-none p-1 ${
                !usePassword
                  ? 'bg-background text-foreground ring-offset-background shadow-xs'
                  : ''
              }`}
              onClick={() => {
                setUsePassword(false)
                registerWithPasskey(true)
              }}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Passkey
            </button>
          </div>

          {usePassword ? (
            <>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground absolute top-2.5 right-3 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                {errors.password && touched.password && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground absolute top-2.5 right-3 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-center"></div>
          )}

          {serverError && (
            <div className="text-destructive text-center">{serverError}</div>
          )}

          <div className="flex justify-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </FormikForm>
      )}
    </Formik>
  )
}
