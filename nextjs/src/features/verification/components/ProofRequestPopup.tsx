'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JSX, useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import AttributesListData from './AttributesListData'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { IProofRrquestDetails } from '../type/interface'
import Loader from '@/components/Loader'
import { Roles } from '@/common/enums'
import { VerifiedIcon } from 'lucide-react'
import { apiStatusCodes } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { verifyPresentation } from '@/app/api/verification'

interface UserDataItem {
  schemaId?: string
  [key: string]: string | number | boolean | undefined
}

const ProofRequest = (props: IProofRrquestDetails): JSX.Element => {
  const [buttonLoader, setButtonLoader] = useState(false)
  const [navigation, setNavigation] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')
  const orgId = useAppSelector((state) => state.organization.orgId)
  const router = useRouter()

  const handleConfirmClick = async (id: string): Promise<void> => {
    try {
      setButtonLoader(true)
      const response = await verifyPresentation(id, orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccessMsg(data.message)
        setNavigation(true)
      }
    } catch (err) {
      setError((err as Error)?.message || 'Verification failed.')
    } finally {
      setButtonLoader(false)
    }
  }

  const handleClose = (): void => {
    setButtonLoader(false)
    props.closeModal(false, '', false)
    if (navigation) {
      router.push(pathRoutes.organizations.credentials)
    }
  }

  const isDisabled =
    navigation ||
    (props?.userRoles ?? []).every((role) =>
      [Roles.MEMBER, Roles.ISSUER].includes(role as Roles),
    )
  useEffect(() => {
    if (props.openModal) {
      setSuccessMsg('')
      setNavigation(false)
    }
  }, [props.openModal])
  return (
    <Dialog
      open={props.openModal}
      onOpenChange={(open) => props.closeModal(!open, '', false)}
    >
      <DialogContent className="h-full w-full max-w-2xl! p-4 md:h-auto">
        <div className="relative rounded-lg text-center sm:p-5">
          <DialogHeader>
            <DialogTitle>
              <p className="pb-2 text-xl font-semibold">
                {props.view ? 'Verified Details' : 'Verification Details'}
              </p>
            </DialogTitle>
          </DialogHeader>

          {!props.view && successMsg && (
            <AlertComponent
              message={successMsg}
              type="success"
              onAlertClose={() => setSuccessMsg('')}
            />
          )}

          {!props.view && error && (
            <AlertComponent
              message={error}
              type="failure"
              onAlertClose={() => setError('')}
            />
          )}

          {props.verifyLoading ? (
            <div className="m-4 flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="mt-1 w-full">
              <AttributesListData
                attributeDataList={props?.userData?.map(
                  (item: UserDataItem) => ({
                    schemaId: item.schemaId ?? '',
                    ...item,
                  }),
                )}
              />
            </div>
          )}

          <DialogFooter className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleClose}
              disabled={props.verifyLoading}
              style={{ height: '2.5rem', minWidth: '100px' }}
              className="ml-auto rounded-lg text-base font-medium"
              variant="outline"
            >
              {navigation || props.view ? 'Close' : 'No, cancel'}
            </Button>

            {!props.view && (
              <Button
                onClick={() => handleConfirmClick(props.requestId)}
                disabled={isDisabled}
                style={{ height: '2.5rem', minWidth: '3rem' }}
                className="flex items-center gap-2 rounded-lg px-4 py-4 text-base font-medium sm:w-auto"
              >
                {buttonLoader ? <Loader /> : <VerifiedIcon />}
                Verify
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProofRequest
