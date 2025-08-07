import React, { JSX } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IIssuanceHeaderProps } from '../type/Issuance'
import Loader from '@/components/Loader'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'

function IssuanceHeader({
  handleBackClick,
  isLoading,
  success,
  error,
  setError,
  setSuccess,
  setCreateLoading,
  createLoading,
}: IIssuanceHeaderProps): JSX.Element {
  const router = useRouter()
  return (
    <div className="col-span-full mb-4 xl:mb-2">
      <div className="flex items-center justify-end px-4">
        <Button onClick={handleBackClick} disabled={isLoading}>
          {isLoading ? <Loader size={20} /> : <ArrowLeft />}
          Back
        </Button>
      </div>
      <AlertComponent
        message={success ?? error}
        type={success ? 'success' : 'failure'}
        onAlertClose={() => {
          setError(null)
          setSuccess(null)
        }}
      />
      <div className="flex justify-between pt-2 pr-5">
        <h1 className="ml-1 text-xl font-semibold sm:text-2xl">Issuance</h1>
        <Button
          onClick={() => {
            setCreateLoading(true)
            router.push(pathRoutes.organizations.schemas)
          }}
          disabled={createLoading}
          className=""
        >
          {createLoading && <Loader size={20} />}
          View Schemas
        </Button>
      </div>
    </div>
  )
}

export default IssuanceHeader
