'use client'

import { JSX, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import Loader from './Loader'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  path?: string
}

const BackButton = ({ path }: BackButtonProps): JSX.Element => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (): void => {
    setIsLoading(true)
    if (path) {
      router.push(path)
    } else {
      router.back()
    }

    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <Button
      variant="default"
      onClick={handleClick}
      disabled={isLoading}
      className="mb-4 flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
    >
      {isLoading ? (
        <Loader size={20} />
      ) : (
        <>
          <ArrowLeft size={18} />
          Back
        </>
      )}
    </Button>
  )
}

export default BackButton
