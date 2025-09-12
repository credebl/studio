'use client'
import { JSX, useEffect } from 'react'
import Loader from '@/components/Loader'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home(): JSX.Element {
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

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="bg-background fixed top-0 left-0 z-[9999] flex h-full w-full items-center justify-center">
      <div className="relative">
        <Loader size={90} />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/SOVIO Icon.svg"
            alt="SOVIO Logo"
            className="h-14 w-14 object-contain"
          />
        </div>
      </div>
    </div>
  )
}
