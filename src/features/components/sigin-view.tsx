'use client'

import DynamicApplicationLogo from './DynamicLogo'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import React from 'react'
import UserAuthForm from './user-auth-form'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]">
      <div className="absolute top-1 left-0 z-20 max-h-24 md:top-8 md:left-4">
        <DynamicApplicationLogo />
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <UserAuthForm />
      </div>
      <Footer />
    </div>
  )
}
