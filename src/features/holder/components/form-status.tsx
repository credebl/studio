'use client'

import { toast } from 'sonner'
import { useEffect } from 'react'

interface FormStatusProps {
  state: { status: 'success' | 'error'; message: string } | null
}

/** Surfaces server-action results consistently across holder screens. */
export function FormStatus({ state }: FormStatusProps): null {
  useEffect(() => {
    if (!state) {
      return
    }
    if (state.status === 'success') {
      toast.success(state.message)
    } else {
      toast.error(state.message)
    }
  }, [state])

  return null
}
