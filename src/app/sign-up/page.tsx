import { Metadata } from 'next'
import React from 'react'
import SignUpViewPage from '@/features/components/SignUpViewPage'

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.',
}

export default function Page(): React.JSX.Element {
  return <SignUpViewPage />
}
