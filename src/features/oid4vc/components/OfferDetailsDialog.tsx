'use client'

import { Copy, RefreshCw, ShieldAlert, Trash2, Wrench } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JSX, useEffect, useState } from 'react'
import { formatDate, parseJsonObject } from '@/features/oid4vc/utils/lifecycle'

import { AlertComponent } from '@/components/AlertComponent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ICredentialOffer } from '@/app/oid4vc/interface/interface'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Textarea } from '@/components/ui/textarea'

function DetailRow({
  label,
  value,
}: {
  label: string
  value?: string
}): JSX.Element {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-mono text-xs break-all">{value || '—'}</p>
    </div>
  )
}

function CopyableRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value?: string
  copied: boolean
  onCopy: () => void
}): JSX.Element {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">{label}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs"
          disabled={!value}
          onClick={onCopy}
        >
          <Copy className="h-3 w-3" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="bg-muted rounded-md p-2 font-mono text-xs break-all">
        {value || '—'}
      </p>
    </div>
  )
}

interface OfferDetailsDialogProps {
  open: boolean
  offer?: ICredentialOffer
  busy?: boolean
  onClose: () => void
  onReissue: (offer: ICredentialOffer) => void
  onRevoke: (offer: ICredentialOffer) => void
  onDelete: (offer: ICredentialOffer) => void
  onUpdateMetadata: (
    offer: ICredentialOffer,
    metadata: Record<string, unknown>,
  ) => Promise<void>
}

export default function OfferDetailsDialog({
  open,
  offer,
  busy = false,
  onClose,
  onReissue,
  onRevoke,
  onDelete,
  onUpdateMetadata,
}: OfferDetailsDialogProps): JSX.Element {
  const [copied, setCopied] = useState<string | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [metadataText, setMetadataText] = useState('{}')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setCopied(null)
    setUpdateOpen(false)
    setMetadataText('{}')
    setUpdateError(null)
  }, [offer, open])

  const copy = async (label: string, value?: string): Promise<void> => {
    if (!value) {
      return
    }
    await navigator.clipboard.writeText(value)
    setCopied(label)
  }

  const handleUpdate = async (): Promise<void> => {
    if (!offer) {
      return
    }

    const parsed = parseJsonObject(metadataText, 'Issuer metadata')
    if (parsed.error || !parsed.data) {
      setUpdateError(parsed.error ?? 'Issuer metadata is required')
      return
    }

    try {
      setUpdating(true)
      setUpdateError(null)
      await onUpdateMetadata(offer, parsed.data)
      setUpdateOpen(false)
    } catch (caught) {
      setUpdateError(
        caught instanceof Error ? caught.message : 'Failed to update offer',
      )
    } finally {
      setUpdating(false)
    }
  }

  const canRevoke = Boolean(offer?.issuedCredentials?.length)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[88vh] max-w-[min(calc(100vw_-_2rem),96rem)]! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Credential offer details
            {offer?.status?.label && (
              <Badge variant="outline">{offer.status.label}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {!offer ? (
          <p className="text-muted-foreground text-sm">No offer selected.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <DetailRow label="Offer ID" value={offer.id} />
              <DetailRow
                label="Credential offer ID"
                value={offer.credentialOfferId}
              />
              <DetailRow label="State" value={offer.state} />
              <DetailRow label="Created" value={formatDate(offer.createdAt)} />
              <DetailRow label="Expires" value={formatDate(offer.expiresAt)} />
              <DetailRow label="Issuer" value={offer.issuerId} />
            </div>

            <div className="space-y-3">
              <CopyableRow
                label="Credential offer URI"
                value={offer.credentialOfferUri}
                copied={copied === 'uri'}
                onCopy={() => copy('uri', offer.credentialOfferUri)}
              />
              <CopyableRow
                label="Credential offer"
                value={offer.credentialOffer}
                copied={copied === 'offer'}
                onCopy={() => copy('offer', offer.credentialOffer)}
              />
              <CopyableRow
                label="Pre-authorized code"
                value={offer.preAuthorizedCode}
                copied={copied === 'code'}
                onCopy={() => copy('code', offer.preAuthorizedCode)}
              />
              <CopyableRow
                label="User PIN"
                value={offer.userPin}
                copied={copied === 'pin'}
                onCopy={() => copy('pin', offer.userPin)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Issuance metadata</p>
              <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs">
                {JSON.stringify(offer.issuanceMetadata ?? {}, null, 2)}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                disabled={busy}
                onClick={() => onReissue(offer)}
              >
                <RefreshCw className="h-4 w-4" />
                Reissue offer
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                disabled={busy}
                onClick={() => setUpdateOpen(true)}
              >
                <Wrench className="h-4 w-4" />
                Update metadata
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-destructive gap-1.5"
                disabled={busy || !canRevoke}
                title={
                  canRevoke
                    ? undefined
                    : 'No issued credentials are associated with this offer'
                }
                onClick={() => onRevoke(offer)}
              >
                <ShieldAlert className="h-4 w-4" />
                Revoke credentials
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-destructive ml-auto gap-1.5"
                disabled={busy}
                onClick={() => onDelete(offer)}
              >
                <Trash2 className="h-4 w-4" />
                Delete offer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      <Dialog
        open={updateOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !updating) {
            setUpdateOpen(false)
            setUpdateError(null)
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Update offer metadata</DialogTitle>
          </DialogHeader>
          {updateError && (
            <AlertComponent
              message={updateError}
              type="failure"
              onAlertClose={() => setUpdateError(null)}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="offer-metadata">Issuer metadata (JSON)</Label>
            <Textarea
              id="offer-metadata"
              value={metadataText}
              rows={10}
              className="font-mono text-xs"
              onChange={(event) => setMetadataText(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpdateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdate} disabled={updating}>
              {updating && <Loader size={16} />}
              Save metadata
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
