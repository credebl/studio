'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SessionCheck = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element | null => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (session) {
      router.push(redirectTo)
    }
  }, [session, status, redirectTo, router])

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  return <>{children}</>
}

export default SessionCheck
