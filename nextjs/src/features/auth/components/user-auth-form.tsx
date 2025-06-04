'use client'

import * as z from 'zod'

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  IUserSignInData,
  forgotPassword,
  getUserProfile,
  passwordEncryption,
} from '@/app/api/Auth'
import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import {
  generateAuthenticationOption,
  verifyAuthentication,
} from '@/app/api/Fido'
import { setRefreshToken, setToken } from '@/lib/authSlice'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { IVerifyRegistrationObj } from '@/components/profile/interfaces'
import { Icons } from '@/config/svgs/Auth'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { apiStatusCodes } from '@/config/CommonConstant'
import { setProfile } from '@/lib/profileSlice'
import { signIn } from 'next-auth/react'
import { startAuthentication } from '@simplewebauthn/browser'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().optional(),
})

type SignInFormValues = z.infer<typeof signInSchema>

enum PlatformRoles {
  platformAdmin = 'platform_admin',
}

export default function SignInViewPage(): React.JSX.Element {
  const [isPasswordTab, setIsPasswordTab] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [, setFidoLoader] = useState<boolean>(false)
  const [, setFidoUserError] = useState('')

  const dispatch = useDispatch()
  const route = useRouter()
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const getUserDetails = async (
    // eslint-disable-next-line camelcase
    access_token: string,
  ): Promise<
    | {
        role: { name: string }
        orgId: string
      }
    | undefined
  > => {
    try {
      const response = await getUserProfile(access_token)

      const { data } = response as AxiosResponse

      if (data?.data?.userOrgRoles?.length > 0) {
        const role = data?.data?.userOrgRoles.find(
          (item: { orgRole: { name: PlatformRoles } }) =>
            item.orgRole.name === PlatformRoles.platformAdmin,
        )

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
          role: role?.orgRole ?? '',
          orgId,
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('No roles found for the user')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching user details', error)
    }
  }

  const handleSignIn = async (values: {
    email: string
    password?: string
  }): Promise<void> => {
    try {
      const entityData: IUserSignInData = isPasswordTab
        ? {
            email: values.email,
            password: await passwordEncryption(values.password || ''),
            isPasskey: false,
          }
        : {
            email: values.email,
            isPasskey: true,
          }

      const response = await signIn('credentials', {
        ...entityData,
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (response?.ok && typeof response.url === 'string') {
        route.push(response.url)
      } else {
        console.error('Sign in failed:', response?.error)
      }
    } catch (error) {
      toast.error('Error signing in')
    }
  }

  const verifyAuthenticationMethod = async (
    verifyAuthenticationObj: IVerifyRegistrationObj,
    userData: { userName: string },
  ): Promise<string | AxiosResponse> => {
    try {
      const res = verifyAuthentication(verifyAuthenticationObj, userData)
      return await res
    } catch (error) {
      setFidoLoader(false)
      throw error
    }
  }

  const authenticateWithPasskey = async (email: string): Promise<void> => {
    try {
      setLoading(true)
      setFidoLoader(true)
      setFidoUserError('')

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
        setFidoUserError(generateAuthenticationResponse?.data?.error)
        return
      }

      const opts = generateAuthenticationResponse?.data?.data

      const attResp = await startAuthentication(opts)

      const verifyAuthenticationObj = {
        ...attResp,
        challangeId: challengeId,
      }

      const verificationResp = await verifyAuthenticationMethod(
        verifyAuthenticationObj,
        obj,
      )
      const { data } = verificationResp as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const token = data?.data?.access_token
        const refreshToken = data?.data?.refresh_token

        dispatch(setToken(token))
        dispatch(setRefreshToken(refreshToken))

        const userRole = await getUserDetails(token)

        if (!userRole?.role?.name) {
          toast.error('Invalid user role')
          return
        }

        route.push(
          userRole?.role?.name === PlatformRoles.platformAdmin
            ? '/dashboard/settings'
            : '/dashboard',
        )
      } else if (data?.error) {
        setFidoUserError(data?.error)
      } else {
        setFidoUserError('Something went wrong during verification')
      }
    } catch (error) {
      if (error instanceof DOMException) {
        setFidoUserError('The operation either timed out or was not allowed.')
      } else {
        setFidoUserError('Authentication failed. Please try again.')
        // eslint-disable-next-line no-console
        console.error('FIDO Authentication Error:', error)
      }
    } finally {
      setFidoLoader(false)
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
    setLoading(true)
    try {
      const response = await forgotPassword({
        email: signInForm.getValues('email'),
      })
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data.message)
        setLoading(false)
      } else {
        toast.error(response as string)
        setLoading(false)
      }
    } catch (error) {
      console.error('An error occurred:', error)
      setLoading(false)
    }
  }

  return (
    <div className="relative flex w-full items-center justify-center">
      <ToastContainer />
      <div className="bg-card border-border relative z-10 h-full w-full max-w-md overflow-hidden rounded-xl border p-8 shadow-xl transition-transform duration-300">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-muted mb-4 flex overflow-hidden rounded-md p-1 text-sm font-medium">
          <Button
            type="button"
            variant="ghost"
            className={`flex flex-1 items-center justify-center gap-1 px-4 py-2 hover:text-inherit ${
              isPasswordTab
                ? 'bg-card text-foreground hover:bg-background'
                : 'bg-muted text-muted-foreground hover:bg-transparent'
            }`}
            onClick={() => setIsPasswordTab(true)}
          >
            <LockKeyhole className="h-4 w-4" />
            Password
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`flex flex-1 items-center justify-center gap-1 px-4 py-2 hover:text-inherit ${
              !isPasswordTab
                ? 'bg-card text-foreground hover:bg-background'
                : 'bg-muted text-muted-foreground hover:bg-transparent'
            }`}
            onClick={() => setIsPasswordTab(false)}
          >
            <KeyRound className="h-4 w-4" />
            Passkey
          </Button>
        </div>

        <Form {...signInForm}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="test@example.com"
                        className="pl-10"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10 pl-10"
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
              <div className="text-right text-sm">
                <Button
                  type="button"
                  onClick={forgotUserPassword}
                  variant={'default'}
                  className="focus-visible:ring-ring text-foreground w-fit bg-transparent px-2 text-left underline-offset-4 shadow-none hover:bg-transparent hover:underline focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  Forgot password?
                </Button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPasswordTab ? 'Sign in' : 'Continue with passkey'}
            </Button>

            <div className="my-6 flex items-center justify-center gap-4">
              <hr className="border-border flex-grow border-t" />
              <span className="text-muted-foreground text-sm">OR</span>
              <hr className="border-border flex-grow border-t" />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                className=""
                onClick={() => route.push('#')}
                variant={'outline'}
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>

              <Button
                type="button"
                className=""
                onClick={() => route.push('#')}
                variant={'outline'}
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Sign in with GitHub</span>
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don’t have an account?{' '}
              </span>
              <Link
                href="/auth/sign-up"
                className="text-muted-foreground hover:text-inherit hover:underline"
              >
                Create one
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
