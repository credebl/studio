'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  IDidDetails,
  IDidListData,
} from '@/features/organization/components/interfaces/organization'
import React, { useEffect, useState } from 'react'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getDidDetails } from '@/app/api/Agent'

export type DidActionType = 'primary' | 'archive' | 'unarchive' | 'delete'

export interface DidAction {
  type: DidActionType
  item: IDidListData
}

interface DidActionDialogProps {
  orgId: string
  action: DidAction | null
  busy: boolean
  error: string | null
  onConfirm: (action: DidAction) => void
  onCancel: () => void
}

const COPY: Record<
  DidActionType,
  { title: string; description: string; confirm: string }
> = {
  primary: {
    title: 'Set as the primary DID?',
    description:
      'This DID becomes the one the organization issues and verifies credentials with. The current primary DID stays in the list.',
    confirm: 'Set as primary',
  },
  archive: {
    title: 'Archive this DID?',
    description:
      'An archived DID is hidden from the list and cannot be set as the primary DID until you restore it. Credentials already issued with it are not affected.',
    confirm: 'Archive',
  },
  unarchive: {
    title: 'Restore this DID?',
    description:
      'The DID returns to the list and can be used again, including being set as the primary DID.',
    confirm: 'Restore',
  },
  delete: {
    title: 'Delete this DID?',
    description:
      'This removes the DID from this organization and cannot be undone. Its keys stay in the wallet key store, a DID registered on a ledger stays on that ledger, and a did:web document stays wherever it is hosted.',
    confirm: 'Delete',
  },
}

// Loads the details of the DID being deleted, so the dialog can explain why a DID that is still in use is refused.
const DeleteCheck = ({
  orgId,
  did,
  onAllowedChange,
}: {
  orgId: string
  did: string
  onAllowedChange: (allowed: boolean) => void
}): React.JSX.Element => {
  const [details, setDetails] = useState<IDidDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    onAllowedChange(false)
    const load = async (): Promise<void> => {
      const response = await getDidDetails(orgId, did)
      if (cancelled) {
        return
      }
      if (typeof response === 'string') {
        setError(response)
        return
      }
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const loaded = data.data as IDidDetails
        setDetails(loaded)
        onAllowedChange(loaded.deletion.allowed)
      } else {
        setError(data?.message || 'Unable to check whether this DID is used.')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgId, did])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  if (!details) {
    return (
      <div className="flex justify-center py-2">
        <Loader />
      </div>
    )
  }
  if (details.deletion.allowed) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing refers to this DID and it has never been the primary DID.
      </p>
    )
  }

  return (
    <Alert>
      <AlertDescription className="space-y-2">
        <p className="text-foreground font-medium">
          This DID cannot be deleted:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-left">
          {details.deletion.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        {!details.isArchived && !details.isPrimaryDid && (
          <p>Archive it instead to stop it from being used.</p>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default function DidActionDialog({
  orgId,
  action,
  busy,
  error,
  onConfirm,
  onCancel,
}: DidActionDialogProps): React.JSX.Element {
  const [deleteAllowed, setDeleteAllowed] = useState(false)
  const copy = action ? COPY[action.type] : null
  const isDelete = action?.type === 'delete'
  const canConfirm = !busy && (!isDelete || deleteAllowed)

  return (
    <AlertDialog
      open={Boolean(action)}
      onOpenChange={(open) => {
        if (!open && !busy) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy?.description}</AlertDialogDescription>
        </AlertDialogHeader>

        {action && (
          <div className="space-y-3">
            <p className="bg-muted rounded-md p-2 font-mono text-xs break-all">
              {action.item.did}
            </p>
            {isDelete && (
              <DeleteCheck
                key={action.item.did}
                orgId={orgId}
                did={action.item.did}
                onAllowedChange={setDeleteAllowed}
              />
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button
            variant={isDelete ? 'destructive' : 'default'}
            disabled={!canConfirm}
            onClick={() => action && onConfirm(action)}
          >
            {busy ? 'Working…' : copy?.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
