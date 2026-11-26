'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { HolderActionResult, HolderProof } from '@/features/holder/types'
import {
  acceptDidCommProofAction,
  acceptProofRequestAction,
  resolveProofRequestAction,
} from '../actions'
import { useActionState, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormStatus } from '@/features/holder/components/form-status'
import { Input } from '@/components/ui/input'
import { JsonPanel } from '@/features/holder/components/json-panel'
import { Label } from '@/components/ui/label'

interface ProofsPanelProps {
  proofs: HolderProof[]
}

export function ProofsPanel({ proofs }: ProofsPanelProps): React.JSX.Element {
  const [proofUri, setProofUri] = useState('')
  const [actionStatus, setActionStatus] =
    useState<HolderActionResult<unknown> | null>(null)
  const [pending, startTransition] = useTransition()

  const [resolveState, resolveAction, resolving] = useActionState(
    resolveProofRequestAction,
    null,
  )

  const acceptOid4vp = (): void => {
    startTransition(async () => {
      setActionStatus(await acceptProofRequestAction(proofUri))
    })
  }

  const acceptDidComm = (proofRecordId: string): void => {
    startTransition(async () => {
      setActionStatus(await acceptDidCommProofAction(proofRecordId))
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Proof requests</h2>
        <p className="text-muted-foreground text-sm">
          Review and answer OpenID4VP or DIDComm presentation requests.
        </p>
      </div>

      <FormStatus state={resolveState} />
      <FormStatus state={actionStatus} />

      <Card>
        <CardHeader>
          <CardTitle>OpenID4VP request</CardTitle>
          <CardDescription>
            Paste an <code>openid4vp://</code> request URI to inspect it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resolveAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof-uri">Request URI</Label>
              <Input
                id="proof-uri"
                name="proofRequestUri"
                value={proofUri}
                onChange={(event) => setProofUri(event.target.value)}
                placeholder="openid4vp://…"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={resolving || !proofUri}>
                {resolving ? 'Resolving…' : 'Resolve request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending || !proofUri}
                onClick={acceptOid4vp}
              >
                Accept and share
              </Button>
            </div>
          </form>

          {resolveState?.status === 'success' && resolveState.data ? (
            <div className="mt-4">
              <JsonPanel value={resolveState.data} label="Resolved request" />
            </div>
          ) : null}
          {actionStatus?.status === 'success' && actionStatus.data ? (
            <div className="mt-4">
              <JsonPanel
                value={actionStatus.data}
                label="Presentation result"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proof history</CardTitle>
          <CardDescription>
            DIDComm proof records from your personal wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proofs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No proof records yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {proofs.map((proof, index) => (
                <div
                  key={proof.id || index}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-mono text-sm">{proof.id}</p>
                    {proof.state && (
                      <Badge variant="secondary">{proof.state}</Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending || !proof.id}
                    onClick={() => acceptDidComm(proof.id)}
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
