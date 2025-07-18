import { Metadata } from 'next'
import React from 'react'
import SignInPage from '@/features/components/sigin-view'

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.',
}

export default function Page(): React.JSX.Element {
  return <SignInPage />
}
