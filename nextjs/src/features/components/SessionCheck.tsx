'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SessionCheck = ({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement | null => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const redirectTo = searchParams.get('redirectTo')

  const preventRedirectOnPaths = [
    '/organizations/create-organization',
    '/organizations/agent-config',
    '/organizations',
    '/users',
    '/connections',
    '/profile',
    '/developers-setting',
  ]

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    const isOnRestrictedPage = preventRedirectOnPaths.some((page) =>
      pathname.startsWith(page),
    )

    if (session && redirectTo && !isOnRestrictedPage) {
      router.push(redirectTo)
    } else if (session && !redirectTo && !isOnRestrictedPage) {
      router.push('/dashboard')
    }

    if (session === null) {
      localStorage.removeItem('persist:root')
    }
  }, [session, status, redirectTo, router, pathname])

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  return <>{children}</>
}

export default SessionCheck
