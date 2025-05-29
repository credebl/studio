'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { JSX } from 'react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  path?: string
}

const BackButton = ({ path }: BackButtonProps): JSX.Element => {
  const router = useRouter()

  const handleClick = (): void => {
    if (path) {
      router.push(path)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="default"
      onClick={handleClick}
      className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2 transition-colors"
    >
      <ArrowLeft size={18} />
      Back
    </Button>
  )
}

export default BackButton
