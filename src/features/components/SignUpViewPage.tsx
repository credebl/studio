'use client'

import DynamicApplicationLogo from './DynamicLogo'
import { Metadata } from 'next'
import React from 'react'
import SignUpUser from './SignUpUser'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]">
      <div className="absolute top-4 left-4 z-20">
        <DynamicApplicationLogo />
      </div>

      <div className="relative flex h-screen w-full items-center justify-center bg-[image:var(--card-gradient)]">
        <SignUpUser />
      </div>
    </div>
  )
}
