'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import React from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function GithubSignInButton(): React.JSX.Element {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  return (
    <Button
      className="w-full"
      variant="outline"
      type="button"
      onClick={() =>
        signIn('github', { callbackUrl: callbackUrl ?? '/dashboard' })
      }
    >
      <Icons.github className="mr-2 h-4 w-4" />
      Continue with Github
    </Button>
  )
}
