'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  didRelationshipSummary,
  formatDidDate,
} from '@/features/holder/did-details'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import type { HolderDid } from '@/features/holder/types'
import { HolderDidCreateForm } from '@/features/holder/components/holder-did-create-form'
import { HolderDidDetailsSheet } from '@/features/holder/components/holder-did-details-sheet'
import { useState } from 'react'

interface DidsPanelProps {
  dids: HolderDid[]
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

export function DidsPanel({ dids }: DidsPanelProps): React.JSX.Element {
  const [selectedDid, setSelectedDid] = useState<HolderDid | null>(null)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">DIDs</h2>
        <p className="text-muted-foreground text-sm">
          Identifiers held by your personal wallet. No organization is required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create DID</CardTitle>
          <CardDescription>
            Generate a fresh key or import an existing one into your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HolderDidCreateForm showX509Note={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your DIDs</CardTitle>
          <CardDescription>
            Identifiers currently available in your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dids.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No DIDs yet. Create one above.
            </p>
          ) : (
            <div className="grid gap-3">
              {dids.map((did, index) => (
                <div
                  key={did.id || did.did || index}
                  className="space-y-3 rounded-md border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {did.method && (
                        <Badge variant="secondary">did:{did.method}</Badge>
                      )}
                      {did.role && (
                        <Badge variant="outline">
                          {did.role.charAt(0).toUpperCase() + did.role.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Created {formatDidDate(did.createdAt)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDid(did)}
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </Button>
                    </div>
                  </div>

                  <p className="font-mono text-sm break-all">
                    {did.did ?? 'Unknown DID'}
                  </p>

                  <dl className="grid gap-x-4 gap-y-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem label="Key type" value={did.keyType} />
                    <DetailItem
                      label="Verification methods"
                      value={did.verificationMethodCount}
                    />
                    <DetailItem
                      label="Relationships"
                      value={didRelationshipSummary(did)}
                    />
                    <DetailItem label="Record ID" value={did.id} />
                  </dl>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HolderDidDetailsSheet
        did={selectedDid}
        open={selectedDid !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDid(null)
          }
        }}
      />
    </div>
  )
}
