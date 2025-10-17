import { CredeblLogoHeight, CredeblLogoWidth } from '@/config/CommonConstant'
import React, { JSX } from 'react'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

function DynamicApplicationLogo(): JSX.Element {
  const APP_ENV =
    process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || 'credebl'
  const searchParams = useSearchParams()
  const alias = searchParams.get('clientAlias')
  const { resolvedTheme } = useTheme()
  let logoImageSrc =
    resolvedTheme === 'dark'
      ? `/logos/${APP_ENV}_logo_dark.svg`
      : `/logos/${APP_ENV}_logo.svg`

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
        className="mx-0 h-10 w-fit object-contain px-2 md:h-20 md:w-50"
        onError={(e) => {
          e.currentTarget.src =
            resolvedTheme === 'dark'
              ? `/logos/${APP_ENV}_logo_dark.svg`
              : `/logos/${APP_ENV}_logo.svg`
        }}
      />
    </div>
  )
}

export default DynamicApplicationLogo
