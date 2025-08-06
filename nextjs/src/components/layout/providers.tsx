'use client'

import { SessionProvider, SessionProviderProps } from 'next-auth/react'

import { ActiveThemeProvider } from '../active-theme'
import React from 'react'
import ThemeProvider from './ThemeToggle/theme-provider'

export default function Providers({
  session,
  activeThemeValue,
  children,
}: Readonly<{
  session: SessionProviderProps['session']
  activeThemeValue: string
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <SessionProvider session={session} key={session?.user.id}>
          {children}
        </SessionProvider>
      </ActiveThemeProvider>
    </ThemeProvider>
  )
}
