'use client';

import { useState, useTransition } from 'react';
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

import { Mail, Lock, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { loginUser, passwordEncryption, UserSignInData } from '@/app/api/Auth';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/userSlice';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().optional()
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInViewPage() {
  const [isPasswordTab, setIsPasswordTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const route = useRouter();
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleSignIn = async (values: { email: string; password?: string }) => {
    try {
      let entityData: UserSignInData;

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

      if (response?.data?.status !== 'success') {
        const token = response?.data?.data?.access_token;
        const email = values?.email || '';

        dispatch(setUser({ email, token }));
        route.push('/dashboard/overview');
      }
    } catch (error) {
      console.error('Error signing in', error);
      toast.error('Error signing in');
    }
  };

  return (
    <div className='relative flex h-screen w-full items-center justify-center bg-gradient-to-b from-yellow-100 to-white'>
      <div className='relative z-10 w-full max-w-md rounded-xl border bg-white p-8 shadow-lg'>
        <div className='mb-6 text-center'>
          <h1 className='mt-2 text-2xl font-semibold'>Welcome Back</h1>
          <p className='text-muted-foreground text-sm'>
            Sign in to your account to continue
          </p>
        </div>

        <div className='bg-muted mb-4 flex overflow-hidden rounded-md border text-sm font-medium'>
          <Button
            type='button'
            variant='ghost'
            className={`flex flex-1 items-center justify-center gap-1 px-4 py-2 ${
              isPasswordTab
                ? 'bg-white text-black'
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setIsPasswordTab(true)}
          >
            <Mail className='h-4 w-4' />
            Password
          </Button>
          <Button
            type='button'
            variant='ghost'
            className={`flex flex-1 items-center justify-center gap-1 px-4 py-2 ${
              !isPasswordTab
                ? 'bg-white text-black'
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setIsPasswordTab(false)}
          >
            <KeyRound className='h-4 w-4' />
            Passkey
          </Button>
        </div>

        <Form {...signInForm}>
          <form
            onSubmit={signInForm.handleSubmit(handleSignIn)}
            className='space-y-4'
          >
            <FormField
              control={signInForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
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
                        <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
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
                <Link href='/forgot-password' passHref legacyBehavior>
                  <a className='text-yellow-600 hover:underline'>
                    Forgot password?
                  </a>
                </Link>
              </div>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='w-full bg-yellow-600 transition-colors hover:bg-yellow-700'
            >
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isPasswordTab ? 'Sign in' : 'Continue with passkey'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
