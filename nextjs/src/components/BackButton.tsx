'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { JSX } from 'react'
import { useRouter } from 'next/navigation'

const BackButton = (): JSX.Element => {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
      className="border-ring hover:bg-primary mb-4 flex items-center gap-2 rounded-xl border px-4 py-2 transition-colors"
    >
      <ArrowLeft size={18} />
      Back
    </Button>
  )
}

export default BackButton
