import './globals.css'
import './theme.css'

import type { Metadata, Viewport } from 'next'

import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import PageLayout from '@/components/PageLayout'
import Providers from '@/components/layout/providers'
import React from 'react'
import SessionCheck from '@/features/auth/components/SessionCheck'
import StoreProvider from './StoreProvider'
import { Toaster } from '@/components/ui/sonner'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { cookies } from 'next/headers'
import { fontVariables } from '@/lib/font'

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
}

export const metadata: Metadata = {
  title: 'CREDEBL - Studio',
  description: 'CREDEBL - Studio with Next.js and Shadcn',
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const cookieStore = await cookies()
  const activeThemeValue = cookieStore.get('active_theme')?.value
  const isScaled = activeThemeValue?.endsWith('-scaled')
  console.log('------')
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-hidden overscroll-none font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables,
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <StoreProvider>
            <SessionCheck>
              <Providers
                session={session}
                activeThemeValue={activeThemeValue as string}
              >
                <Toaster />
                <PageLayout>{children}</PageLayout>
              </Providers>
            </SessionCheck>
          </StoreProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
