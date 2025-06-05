import './globals.css'
import './theme.css'

import type { Metadata, Viewport } from 'next'

import { FaviconUpdater } from '@/components/FaviconUpdater'
import { Session as NextAuthSession } from 'next-auth'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import PageLayout from '@/components/PageLayout'
import Providers from '@/components/layout/providers'
import React from 'react'
import SessionCheck from '@/features/auth/components/SessionCheck'
import { SessionSyncer } from '@/features/auth/components/sessionSyncher'
import StoreProvider from './StoreProvider'
import { Toaster } from '@/components/ui/sonner'
import { authOptions } from '@/utils/authOptions'
import { cn } from '@/lib/utils'
import { cookies } from 'next/headers'
import { fontVariables } from '@/lib/font'
import { getServerSession } from 'next-auth/next'

// Create a new type extending Session to guarantee expires is defined
type SessionWithExpires = NextAuthSession & { expires: string }

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
}): Promise<React.JSX.Element> {
  // Get the session raw
  const sessionRaw = (await getServerSession(
    authOptions,
  )) as SessionWithExpires | null

  const session: SessionWithExpires | null = sessionRaw
    ? {
        ...sessionRaw,
        expires:
          sessionRaw.expires ??
          new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      }
    : null

  const cookieStore = await cookies()
  const activeThemeValue = cookieStore.get('active_theme')?.value
  const isScaled = activeThemeValue?.endsWith('-scaled')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Default favicon */}
        <link rel="icon" href="/favicon-credebl.ico" />
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
            <Providers
              session={session}
              activeThemeValue={activeThemeValue as string}
            >
              <SessionSyncer>
                <SessionCheck>
                  <Toaster />
                  <FaviconUpdater />
                  <PageLayout>{children}</PageLayout>
                </SessionCheck>
              </SessionSyncer>
            </Providers>
          </StoreProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
