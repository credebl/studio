'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { HolderActionResult, HolderDid } from '@/features/holder/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDidAction, createDidImportSessionAction } from '../actions'
import { useActionState, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormStatus } from '@/features/holder/components/form-status'
import { Input } from '@/components/ui/input'
import { JsonPanel } from '@/features/holder/components/json-panel'
import { Label } from '@/components/ui/label'

interface DidsPanelProps {
  dids: HolderDid[]
}

export function DidsPanel({ dids }: DidsPanelProps): React.JSX.Element {
  const [sessionMethod, setSessionMethod] = useState<'key' | 'web' | 'polygon'>(
    'key',
  )
  const [sessionState, setSessionState] =
    useState<HolderActionResult<unknown> | null>(null)
  const [creatingSession, startSession] = useTransition()

  const [createState, createAction, creating] = useActionState(
    createDidAction,
    null,
  )

  const createImportSession = (): void => {
    startSession(async () => {
      setSessionState(await createDidImportSessionAction(sessionMethod))
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">DIDs</h2>
        <p className="text-muted-foreground text-sm">
          Identifiers held by your personal wallet. No organization is required.
        </p>
      </div>

      <FormStatus state={createState} />
      <FormStatus state={sessionState} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create DID</CardTitle>
            <CardDescription>
              did:key works without owning a domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="did-method">Method</Label>
                  <Select name="method" defaultValue="key" required>
                    <SelectTrigger id="did-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="key">did:key</SelectItem>
                      <SelectItem value="web">did:web</SelectItem>
                      <SelectItem value="polygon">did:polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="did-key-type">Key type</Label>
                  <Select name="keyType" defaultValue="ed25519" required>
                    <SelectTrigger id="did-key-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ed25519">Ed25519</SelectItem>
                      <SelectItem value="secp256k1">Secp256k1</SelectItem>
                      <SelectItem value="rsa">RSA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="did-domain">Domain (did:web)</Label>
                  <Input
                    id="did-domain"
                    name="domain"
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="did-network">Network (optional)</Label>
                  <Input
                    id="did-network"
                    name="network"
                    placeholder="bcovrin:testnet"
                  />
                </div>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create DID'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import an existing key</CardTitle>
            <CardDescription>
              Create a single-use import session, encrypt your private key to
              its public key, then supply the encrypted key when creating the
              DID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-method">Method</Label>
              <Select
                value={sessionMethod}
                onValueChange={(value) =>
                  setSessionMethod(value as 'key' | 'web' | 'polygon')
                }
              >
                <SelectTrigger id="import-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="key">did:key</SelectItem>
                  <SelectItem value="web">did:web</SelectItem>
                  <SelectItem value="polygon">did:polygon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={creatingSession}
              onClick={createImportSession}
            >
              {creatingSession ? 'Creating…' : 'Create import session'}
            </Button>
            {sessionState?.status === 'success' && sessionState.data ? (
              <JsonPanel value={sessionState.data} label="Import session" />
            ) : null}
          </CardContent>
        </Card>
      </div>

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
