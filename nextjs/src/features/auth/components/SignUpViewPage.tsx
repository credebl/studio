'use client'
import { CredeblLogoHeight, CredeblLogoWidth } from '@/config/CommonConstant'
import Image from 'next/image'
import { Metadata } from 'next'
import React from 'react'
import SignUpUser from './SignUpUser'
import { useThemeConfig } from '@/components/active-theme'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage(): JSX.Element {
  const { activeTheme } = useThemeConfig()

  const logoImageSrc =
    activeTheme === 'credebl'
      ? '/images/CREDEBL_Logo_Web.svg'
      : '/images/sovio_logo.svg'

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

      <footer className="text-muted-foreground mb-4 text-center text-sm">
        © 2019 - {new Date().getFullYear()} AYANWORKS | All rights reserved.
      </footer>
    </div>
  )
}
