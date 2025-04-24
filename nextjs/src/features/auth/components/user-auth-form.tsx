'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import {
  Mail,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  LockKeyhole,
  Github
} from 'lucide-react';
import Link from 'next/link';
import {
  getUserProfile,
  loginUser,
  passwordEncryption,
  IUserSignInData
} from '@/app/api/Auth';
import { useDispatch } from 'react-redux';
import { setRefreshToken, setToken } from '@/lib/authSlice';
import { AxiosResponse } from 'axios';
import { setProfile } from '@/lib/profileSlice';
import {
  generateAuthenticationOption,
  verifyAuthentication
} from '@/app/api/Fido';
import { apiStatusCodes } from '@/config/CommonConstant';
import { startAuthentication } from '@simplewebauthn/browser';
import Image from 'next/image';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().optional()
});

type SignInFormValues = z.infer<typeof signInSchema>;

enum PlatformRoles {
  platformAdmin = 'platform_admin'
}

export default function SignInViewPage() {
  const [isPasswordTab, setIsPasswordTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const [,setFidoLoader] = useState<boolean>(false);
const [,setFidoUserError] = useState('');

  const dispatch = useDispatch();
  const route = useRouter();
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const getUserDetails = async (access_token: string) => {
    try {
      const response = await getUserProfile(access_token);

      const { data } = response as AxiosResponse;

      if (data?.data?.userOrgRoles?.length > 0) {
        const role = data?.data?.userOrgRoles.find(
          (item: { orgRole: { name: PlatformRoles } }) =>
            item.orgRole.name === PlatformRoles.platformAdmin
        );

        const permissionArray: string[] = [];
        data?.data?.userOrgRoles?.forEach(
          (element: { orgRole: { name: string } }) =>
            permissionArray.push(element?.orgRole?.name)
        );

        const { id, profileImg, firstName, lastName, email } = data?.data || {};
        const userProfile = {
          id,
          profileImg,
          firstName,
          lastName,
          email
        };
        dispatch(setProfile(userProfile));

        const orgWithValidId = data?.data?.userOrgRoles.find(
          (item: { orgId: string | null }) => item.orgId !== null
        );
        const orgId = orgWithValidId?.orgId ?? null;

        return {
          role: role?.orgRole ?? '',
          orgId
        };
      } else {
        // eslint-disable-next-line no-console
        console.error('No roles found for the user');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching user details', error);
    }
  };

  const handleSignIn = async (values: { email: string; password?: string }) => {
    try {
      let entityData: IUserSignInData;

      if (isPasswordTab) {
        const encryptedPassword = await passwordEncryption(
          values.password || ''
        );

        entityData = {
          email: values.email,
          password: encryptedPassword,
          isPasskey: false
        };
      } else {
        entityData = {
          email: values.email,
          isPasskey: true
        };
      }

      const response = await loginUser(entityData);

      if (typeof response === 'string') {
        toast.error(response);
        return;
      }

      if (response?.data?.statusCode == 200) {
        const token = response?.data?.data?.access_token;
        const refreshToken = response?.data?.data?.refresh_token;

        dispatch(setRefreshToken(refreshToken));
        dispatch(setToken(token));

        getUserDetails(token);
        route.push('/dashboard');
      }
    } catch (error) {
      toast.error('Error signing in');
    }
  };

  const verifyAuthenticationMethod = async (
    verifyAuthenticationObj: any,
    userData: { userName: string }
  ): Promise<string | AxiosResponse> => {
    try {
      const res = verifyAuthentication(verifyAuthenticationObj, userData);
      return await res;
    } catch (error) {
      setFidoLoader(false);
      throw error;
    }
  };

  const authenticateWithPasskey = async (email: string): Promise<void> => {
    
    try {
      setLoading(true);
      setFidoLoader(true);
      setFidoUserError('');

      const obj = {
        userName: email?.trim()?.toLowerCase(),
        email: email?.trim()?.toLowerCase()
      };
      const generateAuthenticationResponse: any =
        await generateAuthenticationOption(obj);
      const challengeId: string =
        generateAuthenticationResponse?.data?.data?.challenge;
      if (generateAuthenticationResponse?.data?.error) {
        setFidoUserError(generateAuthenticationResponse?.data?.error);
        return;
      }
      
      const opts = generateAuthenticationResponse?.data?.data;

      const attResp = await startAuthentication(opts);

      const verifyAuthenticationObj = {
        ...attResp,
        challangeId: challengeId
      };

      const verificationResp = await verifyAuthenticationMethod(
        verifyAuthenticationObj,
        obj
      );
      const { data } = verificationResp as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const token = data?.data?.access_token;
        const refreshToken = data?.data?.refresh_token;

        dispatch(setToken(token));
        dispatch(setRefreshToken(refreshToken));

        const userRole = await getUserDetails(token);

        if (!userRole?.role?.name) {
          toast.error('Invalid user role');
          return;
        }

        route.push(
          userRole?.role?.name === PlatformRoles.platformAdmin
            ? '/dashboard/settings'
            : '/dashboard'
        );
      } else if (data?.error) {
        setFidoUserError(data?.error);
      } else {
        setFidoUserError('Something went wrong during verification');
      }
    } catch (error) {
      if (error instanceof DOMException) {
        setFidoUserError('The operation either timed out or was not allowed.');
      } else {
        setFidoUserError('Authentication failed. Please try again.');
        // eslint-disable-next-line no-console
        console.error('FIDO Authentication Error:', error);
      }
    } finally {
      setFidoLoader(false);
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isPasswordTab) {
      signInForm.handleSubmit(handleSignIn)();
    } else {
      const email = signInForm.getValues('email');
      authenticateWithPasskey(email);
    }
  };

  return (
    <div className='relative flex h-screen w-full items-center justify-center'>
      <div className='bg-card relative z-10 w-full max-w-md rounded-xl p-8 shadow'>
        <div className='mb-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            Sign in to your account to continue
          </p>
        </div>

        <div className='bg-muted mb-4 flex overflow-hidden rounded-md text-sm font-medium'>
          <Button
            type='button'
            variant='ghost'
            className={`flex flex-1 items-center justify-center gap-1 px-4 py-2 ${
              isPasswordTab
                ? 'bg-card text-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setIsPasswordTab(true)}
          >
            <LockKeyhole className='h-4 w-4' />
            Password
          </Button>
          <Button
            type='button'
            variant='ghost'
            className={`flex flex-1 items-center justify-center gap-1 px-4 py-2 ${
              !isPasswordTab
                ? 'bg-card text-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setIsPasswordTab(false)}
          >
            <KeyRound className='h-4 w-4' />
            Passkey
          </Button>
        </div>

        <Form {...signInForm}>
          <form onSubmit={handleFormSubmit} className='space-y-4'>
            <FormField
              control={signInForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Mail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                      <Input
                        {...field}
                        type='email'
                        placeholder='test@example.com'
                        className='pl-10'
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
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <LockKeyhole className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          className='pr-10 pl-10'
                          disabled={loading}
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='text-muted-foreground absolute top-2.5 right-3 focus:outline-none'
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
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
              <div className='text-right text-sm'>
                <Link
                  href='/forgot-password'
                  className='text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type='submit' disabled={loading} className='w-full'>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isPasswordTab ? 'Sign in' : 'Continue with passkey'}
            </Button>

            <div className='my-6 flex items-center justify-center gap-4'>
              <hr className='border-border flex-grow border-t' />
              <span className='text-muted-foreground text-sm'>OR</span>
              <hr className='border-border flex-grow border-t' />
            </div>

            <div className='mt-6 flex flex-col gap-3'>
              <Button
                type='button'
                className='flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm'
                onClick={() => route.push('#')}
              >
                <Image
                  src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                  alt='Google'
                  width={15}
                  height={15}
                />
                Sign in with Google
              </Button>

              <Button
                type='button'
                className='flex w-full items-center justify-center gap-2 rounded-md bg-black text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95'
                onClick={() => route.push('#')}
              >
                <Github className='h-5 w-5' />
                <span className='text-sm font-medium'>Sign in with GitHub</span>
              </Button>
            </div>

            <div className='mt-4 text-center text-sm'>
              <span className='text-muted-foreground'>
                Don’t have an account?{' '}
              </span>
              <Link
                href='/auth/sign-up'
                className='text-primary hover:underline'
              >
                Create one
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
