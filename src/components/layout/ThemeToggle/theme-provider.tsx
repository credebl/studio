'use client'

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from 'next-themes'

import React from 'react'

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps): React.JSX.Element {
  // next-themes renders an inline no-flash <script> inside the provider. The
  // server copy must stay a real script so it runs before first paint, but
  // React 19 warns when the same tag is rendered on the client. Marking only
  // the client copy as JSON data keeps the SSR script intact and silences the
  // warning. See https://github.com/pacocoursey/next-themes/issues/387
  const scriptProps =
    typeof window === 'undefined'
      ? undefined
      : ({ type: 'application/json' } as const)

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  )
}
