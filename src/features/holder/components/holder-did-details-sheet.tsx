'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { didRelationshipSummary, formatDidDate } from '../did-details'
import { Badge } from '@/components/ui/badge'
import { CopyValue } from '@/features/wallet/DetailParts'
import DidDocumentView from '@/features/wallet/DidDocumentView'
import type { HolderDid } from '../types'

interface HolderDidDetailsSheetProps {
  did: HolderDid | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DetailItem = ({
  label,
  value,
}: {
  label: string
  value?: string | number
}): React.JSX.Element => (
  <div className="min-w-0 space-y-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="text-sm font-medium break-words">
      {value === undefined || value === '' ? 'Not reported' : value}
    </dd>
  </div>
)

export function HolderDidDetailsSheet({
  did,
  open,
  onOpenChange,
}: HolderDidDetailsSheetProps): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden sm:max-w-5xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">DID details</SheetTitle>
          <SheetDescription>
            Read-only information stored in your holder wallet.
          </SheetDescription>
        </SheetHeader>

        {did ? (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pt-4 pb-6">
            <div className="space-y-6 px-4">
              <div className="flex flex-wrap items-center gap-2">
                {did.method && (
                  <Badge variant="secondary">did:{did.method}</Badge>
                )}
                {did.role && (
                  <Badge variant="outline">
                    {did.role.charAt(0).toUpperCase() + did.role.slice(1)}
                  </Badge>
                )}
                <span className="text-muted-foreground text-xs">
                  Created {formatDidDate(did.createdAt)}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">DID</p>
                {did.did ? (
                  <CopyValue value={did.did} />
                ) : (
                  <p className="text-sm font-medium">Not reported</p>
                )}
              </div>

              <dl className="grid gap-x-4 gap-y-3 border-t pt-4 sm:grid-cols-2">
                <DetailItem
                  label="Method identifier"
                  value={did.methodSpecificIdentifier}
                />
                <DetailItem label="Key type" value={did.keyType} />
                <DetailItem
                  label="Verification methods"
                  value={did.verificationMethodCount}
                />
                <DetailItem
                  label="Relationships"
                  value={didRelationshipSummary(did)}
                />
                <DetailItem
                  label="Last updated"
                  value={formatDidDate(did.updatedAt)}
                />
              </dl>

              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Record ID</p>
                {did.id ? (
                  <CopyValue value={did.id} />
                ) : (
                  <p className="text-sm font-medium">Not reported</p>
                )}
              </div>
            </div>

            <div className="min-w-0 border-t pt-4">
              <DidDocumentView
                did={did.did ?? ''}
                didDocument={did.didDocument}
              />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
