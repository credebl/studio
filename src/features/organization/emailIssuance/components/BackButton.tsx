import React, { JSX } from 'react'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'

export const BackButton = (): JSX.Element => {
  const router = useRouter()
  return (
    <div className="col-span-full mb-3">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => router.push(pathRoutes.organizations.Issuance.issue)}
        >
          <ArrowLeft /> Back
        </Button>
      </div>
    </div>
  )
}
