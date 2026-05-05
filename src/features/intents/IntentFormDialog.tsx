'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { AlertComponent } from '@/components/AlertComponent'
import { JSX } from 'react'

export interface IntentFormState {
  intentName: string
  intentDesc: string
  isEdit: boolean
  creating: boolean
  success: string | null
  failure: string | null
}

export interface IntentFormHandlers {
  setIntentName: (value: string) => void
  setIntentDesc: (value: string) => void
  setSuccess: (val: string | null) => void
  setFailure: (val: string | null) => void
  handleSubmit: () => void
  resetFormState: () => void
}

interface IntentFormDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  formState: IntentFormState
  handlers: IntentFormHandlers
}

const IntentFormDialog = ({
  open,
  setOpen,
  formState,
  handlers,
}: IntentFormDialogProps): JSX.Element => {
  const { intentName, intentDesc, isEdit, creating, success, failure } =
    formState
  const {
    setIntentName,
    setIntentDesc,
    setSuccess,
    setFailure,
    handleSubmit,
    resetFormState,
  } = handlers

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          resetFormState()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
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
          <DialogTitle>
            {isEdit ? 'Update Intent' : 'Create Intent'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Intent Name *</label>
            <input
              type="text"
              value={intentName}
              onChange={(e) => setIntentName(e.target.value)}
              placeholder="Enter intent name"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={intentDesc}
              onChange={(e) => setIntentDesc(e.target.value)}
              placeholder="Enter description"
              className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={creating || !intentName.trim()}
              className="bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm"
            >
              {creating && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IntentFormDialog
