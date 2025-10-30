'use client'

import 'react-toastify/dist/ReactToastify.css'

import * as yup from 'yup'

import { Eye, EyeOff } from 'lucide-react'
import { Form, Formik } from 'formik'
import { JSX, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { apiStatusCodes, passwordRegex } from '@/config/CommonConstant'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useRouter, useSearchParams } from 'next/navigation'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DynamicApplicationLogo from '@/features/components/DynamicLogo'
import Footer from '@/components/Footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PasswordSuggestionBox from './PasswordSuggestionBox'
import { RootState } from '@/lib/store'
import { SubmitIcon } from '@/config/svgs/ResetPassword'
import { passwordValueEncryption } from '@/utils/passwordEncryption'
import { pathRoutes } from '@/config/pathRoutes'
import { resetPassword } from '../api/Auth'
import { setToken } from '@/lib/authSlice'

interface IPasswordDetails {
  password: string
  confirmPassword: string
}

const ResetPassword = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  //   const [userToken, setUserToken] = useState<string>('')
  const userToken = useAppSelector((state: RootState) => state.auth.token)
  // const [field, meta, helpers] = useField(name)

  const [showSuggestion, setShowSuggestion] = useState(false)
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const router = useRouter()

  const submit = async (passwordDetails: IPasswordDetails): Promise<void> => {
    try {
      setLoading(true)
      dispatch(setToken(userToken))
      const verificationCode = searchParams.get('verificationCode')
      const email = searchParams.get('email')
      const encryptedPassword = await passwordValueEncryption(
        passwordDetails?.password,
      )
      const payload = {
        password: encryptedPassword,
        token: verificationCode,
      }

      const response = await resetPassword(payload, email)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data.message)
        setLoading(false)
        setTimeout(() => {
          router.push(pathRoutes.auth.sinIn)
        }, 2000)
      } else {
        toast.error(response as string)
        setLoading(false)
      }
    } catch (error) {
      console.error('An error occurred:', error)
      toast.error('An error occurred while updating password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]">
      <ToastContainer position="top-center" />
      <div className="absolute top-4 left-4 z-20">
        <DynamicApplicationLogo />
      </div>

      <div className="relative flex h-screen w-full items-center justify-center bg-[image:var(--card-gradient)]">
        <div className="w-full">
          <div className="flex flex-col">
            <div className="flex flex-1 flex-col justify-center md:flex-row">
              <div className="bg-opacity-10 hidden w-full md:w-3/5 md:p-4 lg:block lg:p-4">
                <div className="flex items-center justify-center">
                  <img
                    className="max-h-100/10rem"
                    src="/images/signin.svg"
                    alt="img"
                  />
                </div>
              </div>
              <div className="flex grow-1 p-10">
                <div className="flex w-full justify-center">
                  <Card className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border p-8 shadow-xl transition-transform duration-300 lg:max-w-md">
                    <div className="flex w-full flex-col gap-4 lg:mt-8">
                      <div className="font-inter flex justify-center text-center text-3xl leading-10 font-bold">
                        Reset Password
                      </div>
                      <div className="font-inter h-5.061 text-muted-foreground flex w-full flex-shrink-0 flex-col items-center justify-center text-base leading-5 font-medium">
                        Please set new password
                      </div>
                    </div>
                    <Formik
                      initialValues={{
                        password: '',
                        confirmPassword: '',
                      }}
                      validationSchema={yup.object().shape({
                        password: yup
                          .string()
                          .required('Password is required')
                          .matches(passwordRegex, ' '),
                        confirmPassword: yup
                          .string()
                          .required('Confirm Password is required')
                          .oneOf([yup.ref('password')], 'Passwords must match'),
                      })}
                      validateOnBlur
                      validateOnChange
                      enableReinitialize
                      onSubmit={(values: IPasswordDetails) => {
                        submit(values)
                      }}
                    >
                      {(formikHandlers): JSX.Element => (
                        <Form
                          className="mt-12 space-y-6"
                          onSubmit={formikHandlers.handleSubmit}
                        >
                          <input
                            type="hidden"
                            name="_csrf"
                            value={new Date().getTime()}
                          />
                          <div>
                            <div className="text-base leading-5 font-medium">
                              <div className="mb-2 block text-sm font-medium dark:text-white">
                                <Label
                                  className="text-custom-900"
                                  htmlFor="password"
                                />
                                New Password
                                <span className="text-destructive text-xs">
                                  *
                                </span>
                              </div>
                              <div className="relative">
                                <Input
                                  {...formikHandlers.getFieldProps('password')}
                                  type={passwordVisible ? 'text' : 'password'}
                                  placeholder="Please enter password"
                                  className=""
                                  disabled={loading}
                                  onFocus={() => setShowSuggestion(true)}
                                  onBlur={(e) => {
                                    setShowSuggestion(false)
                                    formikHandlers.handleBlur(e)
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() =>
                                    setPasswordVisible(
                                      (prevVisible) => !prevVisible,
                                    )
                                  }
                                  className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-transparent hover:bg-transparent hover:text-inherit"
                                  variant={'ghost'}
                                >
                                  {passwordVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {showSuggestion &&
                                formikHandlers?.errors?.password &&
                                formikHandlers.values.password && (
                                  <PasswordSuggestionBox
                                    show={true}
                                    value={formikHandlers?.values?.password}
                                  />
                                )}

                              {formikHandlers?.errors?.password &&
                                formikHandlers?.touched?.password && (
                                  <span className="text-destructive absolute mt-1 text-xs">
                                    {formikHandlers?.errors?.password}
                                  </span>
                                )}
                            </div>
                            <div className="mt-8 mb-6 text-base leading-5 font-medium">
                              <div className="mb-2 block text-sm font-medium dark:text-white">
                                <Label className="" htmlFor="confirmPassword" />
                                Confirm New Password
                                <span className="text-destructive text-xs">
                                  *
                                </span>
                              </div>
                              <div className="relative">
                                <Input
                                  {...formikHandlers.getFieldProps(
                                    'confirmPassword',
                                  )}
                                  type={
                                    confirmPasswordVisible ? 'text' : 'password'
                                  }
                                  placeholder="Please re-enter password"
                                  className=""
                                  disabled={loading}
                                  onFocus={() => setShowSuggestion(true)}
                                  onBlur={(e) => {
                                    setShowSuggestion(false)
                                    formikHandlers.handleBlur(e)
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() =>
                                    setConfirmPasswordVisible(
                                      (prevVisible) => !prevVisible,
                                    )
                                  }
                                  className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-transparent hover:bg-transparent hover:text-inherit"
                                  variant={'ghost'}
                                >
                                  {confirmPasswordVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {formikHandlers?.errors?.confirmPassword &&
                                formikHandlers?.touched?.confirmPassword && (
                                  <span className="text-destructive text-xs">
                                    {formikHandlers?.errors?.confirmPassword}
                                  </span>
                                )}
                            </div>

                            <div className="mt-12 flex justify-end">
                              <Button
                                id="signupbutton"
                                type="submit"
                                disabled={loading || !formikHandlers.isValid}
                                className=""
                              >
                                <SubmitIcon />
                                <span className="ml-2">Submit</span>
                              </Button>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer fixed={true} />
    </div>
  )
}

export default ResetPassword
