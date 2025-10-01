'use client'

import { CredeblLogoHeight, CredeblLogoWidth } from '@/config/CommonConstant'
import Image from 'next/image'
import { Metadata } from 'next'
import React from 'react'
import SignUpUser from './SignUpUser'
import { useTheme } from 'next-themes'

const APP_ENV =
  process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || 'credebl'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage(): React.JSX.Element {
  const { resolvedTheme } = useTheme()

  const logoImageSrc =
    resolvedTheme === 'dark'
      ? `/logos/${APP_ENV}_logo_dark.svg`
      : `/logos/${APP_ENV}_logo.svg`

  return (
    <div className="relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]">
      <div className="absolute top-4 left-4 z-20">
        <Image
          height={CredeblLogoHeight}
          width={CredeblLogoWidth}
          alt="Logo"
          src={logoImageSrc}
        />
      </div>

      <div className="relative flex h-screen w-full items-center justify-center bg-[image:var(--card-gradient)]">
        <SignUpUser />
      </div>
    </div>
  )
}
