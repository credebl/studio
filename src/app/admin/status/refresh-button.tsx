'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function RefreshButton(): React.JSX.Element {
  const router = useRouter()
  const [isRefreshing, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isRefreshing}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw
        aria-hidden="true"
        className={isRefreshing ? 'animate-spin' : ''}
      />
      {isRefreshing ? 'Checking...' : 'Refresh'}
    </Button>
  )
}
