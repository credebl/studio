'use client'

import { CredeblLogoHeight, CredeblLogoWidth } from '@/config/CommonConstant'

import Image from 'next/image'
import { Metadata } from 'next'
import React from 'react'
import UserAuthForm from './user-auth-form'
import { useTheme } from 'next-themes'
import { useThemeConfig } from '@/components/active-theme'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage(): React.JSX.Element {
  const { activeTheme } = useThemeConfig()

  const { resolvedTheme } = useTheme()

  const logoImageSrc = ((): string => {
    if (activeTheme === 'credebl') {
      return resolvedTheme === 'dark'
        ? '/images/CREDEBL_Logo_Web_Dark.svg'
        : '/images/CREDEBL_Logo_Web.svg'
    } else {
      return resolvedTheme === 'dark'
        ? '/images/sovio_dark_theme_logo.svg'
        : '/images/sovio_logo.svg'
    }
  })()

  return (
    <div className="relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]">
      <div className="absolute top-1 left-0 z-20 md:top-8 md:left-4">
        <Image
          height={CredeblLogoHeight}
          width={CredeblLogoWidth}
          alt="Logo"
          src={logoImageSrc}
          className="mx-0 h-10 w-fit px-2 md:h-auto md:w-50"
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <UserAuthForm />
      </div>

      <footer className="text-muted-foreground mb-1 text-center text-xs md:mb-4 md:text-sm">
        © 2019 - {new Date().getFullYear()} AYANWORKS TECHNOLOGY SOLUTIONS
        PRIVATE LIMITED.
      </footer>
    </div>
  )
}
