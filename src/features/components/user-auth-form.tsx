'use client'

import * as z from 'zod'

import { Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import React, { useState } from 'react'
import { forgotPassword, getUserProfile } from '@/app/api/Auth'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Icons } from '@/config/svgs/Auth'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { generateAuthenticationOption } from '@/app/api/Fido'
import { setProfile } from '@/lib/profileSlice'
import { signIn } from 'next-auth/react'
import { startAuthentication } from '@simplewebauthn/browser'
import { useAppSelector } from '@/lib/hooks'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, { message: 'Password is required' }),
})

type SignInFormValues = z.infer<typeof signInSchema>

enum PlatformRoles {
  platformAdmin = 'platform_admin',
}

export default function SignInViewPage(): React.JSX.Element {
  const [isPasswordTab, setIsPasswordTab] = useState(true)
  const [loading, setLoading] = useState(false)
  const [forgetPasswordLoading, setForgetPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [alert, setAlert] = useState<null | string>(null)
  const [success, setSuccess] = useState<null | string>(null)

  const token = useAppSelector((state) => state.auth.token)
  const dispatch = useDispatch()
  const route = useRouter()
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const searchParams = useSearchParams()

  const redirectTo = searchParams?.get('redirectTo')
  const clientAlias = searchParams?.get('clientAlias')

  const signUpUrl =
    redirectTo && clientAlias
      ? `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}&clientAlias=${clientAlias}`
      : '/sign-up'

  const handleSignIn = async (values: {
    email: string
    password?: string
  }): Promise<void> => {
    try {
      setLoading(true)
      const entityData = {
        email: values.email,
        password: values.password || '',
        isPassword: isPasswordTab,
      }
      const response = await signIn('credentials', {
        ...entityData,
        redirect: false,
      })
      if (response?.error) {
        let errorMsg: string = ''

        switch (response.error) {
          case 'Invalid Credentials':
            errorMsg = 'Invalid Credentials.'
            break
          case 'fetch failed':
            errorMsg =
              'Unable to connect to the server. Please check your network and try again.'
            break
          default:
            errorMsg = 'Sign in failed. Please try again later.'
            break
        }
        setAlert(errorMsg)
        console.error('Sign in failed:', response.error)
      }
      setLoading(false)
    } catch (error) {
      setAlert('Something went wrong during sign in. Please try again.')
      setLoading(false)
      console.error('Sign in error:', error)
    }
  }

  const getUserDetails = async (
    // eslint-disable-next-line camelcase
    access_token: string,
  ): Promise<
    | {
        role: { name: string }
        orgId: string | null
      }
    | undefined
  > => {
    try {
      const response = await getUserProfile(access_token)

      const { data } = response as AxiosResponse

      if (data?.data?.userOrgRoles?.length > 0) {
        const platformAdminRole = data?.data?.userOrgRoles.find(
          (item: { orgRole: { name: string } }) =>
            item.orgRole.name === PlatformRoles.platformAdmin,
        )
        const selectedRole = platformAdminRole || data?.data?.userOrgRoles[0]

        const permissionArray: string[] = []
        data?.data?.userOrgRoles?.forEach(
          (element: { orgRole: { name: string } }) =>
            permissionArray.push(element?.orgRole?.name),
        )

        const { id, profileImg, firstName, lastName, email } = data?.data || {}
        const userProfile = {
          id,
          profileImg,
          firstName,
          lastName,
          email,
        }
        dispatch(setProfile(userProfile))

        const orgWithValidId = data?.data?.userOrgRoles.find(
          (item: { orgId: string | null }) => item.orgId !== null,
        )
        const orgId = orgWithValidId?.orgId ?? null

        return {
          role: { name: selectedRole.orgRole.name },
          orgId,
        }
      } else {
        console.error('No roles found for the user')
        return undefined
      }
    } catch (error) {
      console.error('Error fetching user details', error)
      return undefined
    }
  }

  const authenticateWithPasskey = async (email: string): Promise<void> => {
    try {
      setLoading(true)
      const obj = {
        userName: email?.trim()?.toLowerCase(),
        email: email?.trim()?.toLowerCase(),
      }
      // Fix this later
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const generateAuthenticationResponse: any =
        await generateAuthenticationOption(obj)
      const challengeId: string =
        generateAuthenticationResponse?.data?.data?.challenge

      if (generateAuthenticationResponse?.data?.error) {
        console.error(generateAuthenticationResponse?.data?.error)
        return
      }

      const opts = generateAuthenticationResponse?.data?.data

      const attResp = await startAuthentication(opts)

      const verifyAuthenticationObj = {
        ...attResp,
        challangeId: challengeId,
      }
      const entityData = {
        verifyAuthenticationObj: JSON.stringify(verifyAuthenticationObj),
        obj: JSON.stringify(obj),
        isPasswordTab,
      }

      const verificationResp = await signIn('credentials', {
        ...entityData,
        redirect: false,
        // callbackUrl: redirectTo ? redirectTo : '/dashboard',
      })

      if (verificationResp?.ok && verificationResp?.status === 200) {
        if (!token) {
          return
        }
        const userRole = await getUserDetails(token)

        if (!userRole?.role?.name) {
          setAlert('Invalid user role')
          return
        }

        route.push(
          userRole?.role?.name === PlatformRoles.platformAdmin
            ? '/dashboard/settings'
            : '/dashboard',
        )
      } else if (verificationResp?.error) {
        console.error(verificationResp?.error)
      } else {
        console.error('Something went wrong during verification')
      }
    } catch (error) {
      if (error instanceof DOMException) {
        console.error('The operation either timed out or was not allowed.')
      } else {
        console.error('Authentication failed. Please try again.')
        // eslint-disable-next-line no-console
        console.error('FIDO Authentication Error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    if (isPasswordTab) {
      signInForm.handleSubmit(handleSignIn)()
    } else {
      const email = signInForm.getValues('email')
      authenticateWithPasskey(email)
    }
  }

  const forgotUserPassword = async (): Promise<void> => {
    setForgetPasswordLoading(true)
    try {
      const response = await forgotPassword({
        email: signInForm.getValues('email'),
        clientAlias,
      })
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(data.message)
        setForgetPasswordLoading(false)
      } else {
        setAlert(
          typeof response === 'string' ? response : 'Something went wrong',
        )
        setForgetPasswordLoading(false)
      }
    } catch (error) {
      console.error('An error occurred:', error)
      setForgetPasswordLoading(false)
    }
  }

  return (
    <div className="relative mt-4 flex w-full flex-col items-center justify-end md:justify-center">
      {alert && (
        <div className="w-full max-w-md" role="alert">
          <AlertComponent
            message={alert}
            type={'failure'}
            onAlertClose={() => {
              setAlert(null)
            }}
          />
        </div>
      )}
      {success && (
        <div className="w-full max-w-md">
          <AlertComponent
            message={success}
            type={'success'}
            onAlertClose={() => {
              setSuccess(null)
            }}
          />
        </div>
      )}
      <div className="bg-card border-border relative z-10 h-full w-full max-w-md overflow-hidden rounded-xl border p-4 pt-6 shadow-xl transition-transform duration-300 md:p-8">
        <div className="mb-2 text-center md:mb-6">
          <p className="text-muted-foreground text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-muted mb-4 flex h-10 overflow-hidden rounded-md p-1 text-sm font-medium">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-none p-1 ${
              isPasswordTab
                ? 'bg-background text-foreground ring-offset-background shadow-xs'
                : ''
            }`}
            onClick={() => setIsPasswordTab(true)}
          >
            <LockKeyhole className="h-4 w-4" />
            Password
          </button>
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-none p-1 ${
              !isPasswordTab
                ? 'bg-background text-foreground ring-offset-background shadow-xs'
                : ''
            }`}
            onClick={() => setIsPasswordTab(false)}
          >
            <KeyRound className="h-4 w-4" />
            Passkey
          </button>
        </div>

        <Form {...signInForm}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="data-[error=true]:text-foreground text-xs md:text-sm">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="test@example.com"
                        className="pl-10 text-xs md:text-sm"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPasswordTab && (
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="data-[error=true]:text-foreground text-xs md:text-sm">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10 pl-10 text-xs md:text-sm"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground absolute top-2.5 right-3 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isPasswordTab && (
              <div className="text-right text-xs md:text-sm">
                <Button
                  type="button"
                  onClick={forgotUserPassword}
                  variant={'default'}
                  disabled={forgetPasswordLoading || loading}
                  className="focus-visible:ring-ring text-foreground url-link w-fit bg-transparent px-2 text-left text-xs underline-offset-4 shadow-none hover:bg-transparent hover:underline focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none md:text-sm [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  {forgetPasswordLoading
                    ? 'Send reset link . . .'
                    : 'Forgot password?'}
                </Button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-xs md:text-sm"
            >
              {loading && <Loader size={20} isExpand={false} />}
              {isPasswordTab ? 'Sign in' : 'Continue with passkey'}
            </Button>

            {process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN?.toLowerCase() ===
              'true' && (
              <>
                <div className="my-2 flex items-center justify-center gap-2 md:my-6 md:gap-4">
                  <hr className="border-border flex-grow border-t" />
                  <span className="text-muted-foreground text-xs md:text-sm">
                    OR
                  </span>
                  <hr className="border-border flex-grow border-t" />
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    type="button"
                    className="text-xs md:text-sm"
                    onClick={() => route.push('#')}
                    variant={'outline'}
                  >
                    <Icons.google className="mr-2 h-2 w-2 md:h-4 md:w-4" />
                    Sign in with Google
                  </Button>

                  <Button
                    type="button"
                    className="text-xs md:text-sm"
                    onClick={() => route.push('#')}
                    variant={'outline'}
                  >
                    <Icons.gitHub className="mr-2 h-2 w-2 md:h-4 md:w-4" />
                    <span className="text-xs font-medium md:text-sm">
                      Sign in with GitHub
                    </span>
                  </Button>
                </div>
              </>
            )}

            <div className="mt-4 text-center text-xs md:text-sm">
              <span className="text-muted-foreground">
                Don’t have an account?{' '}
              </span>
              <Link href={signUpUrl} className="url-link">
                Create one
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
