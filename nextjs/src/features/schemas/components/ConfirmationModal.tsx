'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { AlertComponent } from '@/components/AlertComponent'
import { Button } from '@/components/ui/button'
import { CircleCheck } from 'lucide-react'
import React from 'react'

interface IProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (flag: boolean) => void
  message: React.ReactNode
  isProcessing: boolean
  success: string | null
  failure: string | null
  setFailure: (flag: string | null) => void
  setSuccess: (flag: string | null) => void
  buttonTitles: string[]
  loading: boolean
  warning?: string
}

const ConfirmationModal = ({
  openModal,
  closeModal,
  onSuccess,
  message,
  isProcessing,
  success,
  failure,
  setFailure,
  setSuccess,
  buttonTitles,
  loading,
  warning,
}: IProps): React.JSX.Element => (
  <Dialog open={openModal} onOpenChange={closeModal}>
    <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-center">
          <div className="mx-auto mb-4 grid justify-center">
            <div>
              <CircleCheck size={60} className="text-primary m-auto" />
            </div>
            <div className="text-primary min-w-[200px]">
              {warning ? (
                <div className="">{warning}</div>
              ) : (
                <div className="text-2xl">Confirmation</div>
              )}
            </div>
          </div>
          <div className="mb-2 text-lg">{message}</div>
        </DialogTitle>
      </DialogHeader>

      {(success || failure) && (
        <div className="w-full space-y-4">
          {success && (
            <AlertComponent
              message={success}
              type="success"
              onAlertClose={() => setSuccess(null)}
            />
          )}
          {failure && (
            <AlertComponent
              message={failure}
              type="failure"
              onAlertClose={() => setFailure(null)}
            />
          )}
        </div>
      )}

      <DialogFooter className="m-auto mt-6 flex flex-col gap-4 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => closeModal(false)}
          className="text-destructive hover:text-destructive sm:min-w-[197px]"
        >
          {buttonTitles[0]}
        </Button>
        <Button
          type="submit"
          onClick={() => onSuccess(true)}
          disabled={isProcessing || loading}
          className="sm:min-w-[197px]"
        >
          {isProcessing ? 'Processing...' : buttonTitles[1]}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default ConfirmationModal
