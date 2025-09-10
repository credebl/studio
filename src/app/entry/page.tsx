'use client'
import { JSX, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Entry(): JSX.Element {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    if (session) {
      router.replace('/dashboard')
    } else {
      router.replace('/sign-in')
    }
  }, [status, session, router])

  return (
    <div className="flex h-screen items-center justify-center">Loading...</div>
  )
}
