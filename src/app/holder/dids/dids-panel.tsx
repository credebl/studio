'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HolderDid } from '@/features/holder/types'
import { HolderDidCreateForm } from '@/features/holder/components/holder-did-create-form'

interface DidsPanelProps {
  dids: HolderDid[]
}

export function DidsPanel({ dids }: DidsPanelProps): React.JSX.Element {
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
                  className="space-y-2 rounded-md border p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {did.method && (
                      <Badge variant="secondary">{did.method}</Badge>
                    )}
                    {did.isPrimary && <Badge variant="outline">Primary</Badge>}
                  </div>
                  <p className="font-mono text-sm break-all">
                    {did.did ?? 'Unknown DID'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
