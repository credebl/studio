'use client'

import { CredeblLogoHeight, CredeblLogoWidth } from '@/config/CommonConstant'

import Footer from '@/components/Footer'
import Image from 'next/image'
import { Metadata } from 'next'
import React from 'react'
import UserAuthForm from './user-auth-form'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

const APP_ENV =
  process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || 'credebl'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function SignInPage(): React.JSX.Element {
  const searchParams = useSearchParams()
  const alias = searchParams.get('clientAlias')
  const { resolvedTheme } = useTheme()
  let logoImageSrc =
    resolvedTheme === 'dark'
      ? `/logos/${APP_ENV}_logo_dark.svg`
      : `/logos/${APP_ENV}_logo.svg`

  switch (alias) {
    case 'VERIFIER':
      logoImageSrc =
        resolvedTheme === 'dark'
          ? '/logos/verifier_logo_dark.png'
          : '/logos/verifier_logo.png'
      break

    default:
      logoImageSrc =
        resolvedTheme === 'dark'
          ? `/logos/${APP_ENV}_logo_dark.svg`
          : `/logos/${APP_ENV}_logo.svg`
      break
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[image:var(--card-gradient)]">
      <div className="absolute top-1 left-0 z-20 max-h-24 md:top-8 md:left-4">
        <Image
          height={CredeblLogoHeight}
          width={CredeblLogoWidth}
          alt={`${APP_ENV} Logo`}
          src={logoImageSrc}
          className="mx-0 h-10 w-fit object-contain px-2 md:h-20 md:w-50"
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <UserAuthForm />
      </div>
      <Footer />
    </div>
  )
}
