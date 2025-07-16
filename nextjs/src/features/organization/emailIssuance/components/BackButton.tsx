import React, { JSX, useState } from 'react'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'

export const BackButton = (): JSX.Element => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (): void => {
    setIsLoading(true)
    router.push(pathRoutes.organizations.Issuance.issue)
  }

  return (
    <div className="col-span-full mb-3">
      <div className="flex items-center justify-end">
        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? <Loader size={20} /> : <ArrowLeft />}
          Back
        </Button>
      </div>
    </div>
  )
}
