import React from 'react';
import { Metadata } from 'next';
import SignInPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  return <SignInPage />;
}
