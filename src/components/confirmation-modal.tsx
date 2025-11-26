'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { type ReactElement } from 'react'
import { AlertComponent } from '@/components/AlertComponent'
import { Button } from '@/components/ui/button'
import { ConfirmationModalDefaultLogo } from '@/config/svgs/confirmationModal'

interface IProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (flag: boolean) => void
  message: string | ReactElement | React.ReactNode
  isProcessing: boolean
  success: string | null
  failure: string | null
  setFailure: (flag: string | null) => void
  setSuccess: (flag: string | null) => void
  buttonTitles: string[]
  loading: boolean
  warning?: string
  image?: React.JSX.Element
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
  image,
}: IProps): React.JSX.Element => (
  <Dialog open={openModal} onOpenChange={(open) => closeModal(!open)}>
    <DialogTitle></DialogTitle>
    <DialogContent className="fixed top-1/2 left-1/2 max-h-[450px] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform overflow-auto">
      <DialogHeader>
        <button
          type="button"
          className="text-muted-foreground absolute top-3 right-2.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm"
          onClick={() => {
            closeModal(false)
          }}
        >
          <span className="sr-only">Close modal</span>
        </button>
      </DialogHeader>

      <div className="w-full">
        {success && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={success}
              type={'success'}
              onAlertClose={() => {
                if (setSuccess) {
                  setSuccess(null)
                }
              }}
            />
          </div>
        )}
        {failure && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={failure}
              type={'failure'}
              onAlertClose={() => {
                if (setFailure) {
                  setFailure(null)
                }
              }}
            />
          </div>
        )}
      </div>
      <div className="p-6 text-center">
        {image ? image : <ConfirmationModalDefaultLogo />}
        <h3 className="text-muted-foreground mb-4 py-2 text-lg font-normal">
          {message}
        </h3>

        {warning && <h4 className="text-done">{warning}</h4>}
      </div>

      <DialogFooter className="mt-4 flex items-center justify-around gap-4">
        <Button
          variant="outline"
          className="text-md text-muted-foreground rounded-lg border px-5 py-2 font-medium focus:z-10 focus:ring-4 focus:outline-none sm:min-w-[197px]"
          onClick={() => {
            closeModal(false)
          }}
        >
          {buttonTitles[0]}
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || loading}
          onClick={() => {
            onSuccess(true)
          }}
          className={`text-md inline-flex items-center rounded-lg text-center font-medium sm:min-w-[197px] ${isProcessing ? 'opacity-70' : ''}`}
        >
          {isProcessing ? (
            <span className="flex items-center">
              <svg
                className="mr-2 -ml-1 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {buttonTitles[1]}
            </span>
          ) : (
            buttonTitles[1]
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default ConfirmationModal
