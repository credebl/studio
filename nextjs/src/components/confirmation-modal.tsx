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

      <div className="p-6 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 22 22"
          className="text-primary mx-auto mb-4 h-12 w-12"
        >
          <path
            fill="currentColor"
            d="M12.388 21.99c-.916.01-1.82.01-2.743.01-.202-.078-.397-.052-.586-.069-.685-.062-1.33-.274-1.968-.508a10.64 10.64 0 0 1-3.424-2.051 11.243 11.243 0 0 1-2.35-2.88 11.537 11.537 0 0 1-1.17-3.012c-.085-.356-.07-.721-.137-1.092C0 11.458 0 10.54 0 9.602.083 9.396.049 9.194.072 9c.088-.73.318-1.423.58-2.105A10.541 10.541 0 0 1 2.64 3.654C4.245 1.857 6.22.664 8.581.134 8.916.057 9.26.072 9.612.01 10.528 0 11.432 0 12.355 0c.216.08.425.046.627.07.739.086 1.438.318 2.126.584a10.554 10.554 0 0 1 3.24 1.987c1.804 1.611 2.994 3.594 3.524 5.962.073.328.057.666.118 1.01.01.915.01 1.819.01 2.742-.08.216-.046.425-.07.627-.086.739-.318 1.438-.584 2.126a10.544 10.544 0 0 1-1.988 3.24c-1.61 1.803-3.592 2.996-5.961 3.524-.328.073-.666.057-1.01.118Z"
          />
          <path
            fill="#FFFfFf"
            d="M12.72 7.183c-.052 1.824-.107 3.62-.155 5.418-.033 1.232-.7 2.147-1.573 2.141-.825-.005-1.506-.88-1.543-2.024a1052 1052 0 0 1-.206-7.108c-.03-1.213.66-2.187 1.546-2.203.23-.005.461-.029.691.033.78.21 1.304 1.09 1.285 2.175-.009.513-.028 1.026-.044 1.568Z"
          />
          <path
            fill="#FFF"
            d="M9.989 15.875c1.013-.78 2.34-.282 2.54.94.133.817-.438 1.586-1.29 1.736-.785.138-1.588-.419-1.738-1.208-.108-.572.056-1.057.488-1.468Z"
          />
        </svg>
        <h3 className="text-muted-foreground mb-4 py-2 text-lg font-normal">
          {message}
        </h3>

        {warning && <h4 className="text-done">{warning}</h4>}

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
