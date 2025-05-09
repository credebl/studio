import React from 'react';
import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/SignUpViewPage';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  return <SignUpViewPage />;
}
