import {
  ACTIVE_THEME,
  DEFAULT_THEME_ASSET,
  fallbackOnce,
  themeLogoPath,
} from '@/lib/theme-assets'
import { CredeblLogoHeight, CredeblLogoWidth } from '@/config/CommonConstant'
import React, { JSX } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

function DynamicApplicationLogo(): JSX.Element {
  const APP_ENV = ACTIVE_THEME
  const searchParams = useSearchParams()
  const alias = searchParams.get('clientAlias')
  const { resolvedTheme } = useTheme()
  let logoImageSrc =
    resolvedTheme === 'dark'
      ? themeLogoPath(APP_ENV, true)
      : themeLogoPath(APP_ENV, false)

  if (alias) {
    logoImageSrc =
      resolvedTheme === 'dark'
        ? `${process.env.NEXT_PUBLIC_LOGO_BASE_URL}${alias}_logo_dark.svg`
        : `${process.env.NEXT_PUBLIC_LOGO_BASE_URL}${alias}_logo.svg`
  }
  return (
    <div className="max-h-24">
      <Image
        height={CredeblLogoHeight}
        width={CredeblLogoWidth}
        alt={`${APP_ENV} Logo`}
        src={logoImageSrc}
        loading="eager"
        className="mx-0 h-10 w-fit object-contain px-2 md:h-20 md:w-50"
        onError={(e) => {
          fallbackOnce(
            e.currentTarget,
            themeLogoPath(DEFAULT_THEME_ASSET, resolvedTheme === 'dark'),
          )
        }}
      />
    </div>
  )
}

export default DynamicApplicationLogo
