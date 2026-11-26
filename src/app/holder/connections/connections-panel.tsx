'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  HolderActionResult,
  HolderConnection,
} from '@/features/holder/types'
import {
  acceptOfferAction,
  createConnectionAction,
  receiveInvitationAction,
} from '../actions'
import { useActionState, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyField } from '@/features/holder/components/copy-field'
import { FormStatus } from '@/features/holder/components/form-status'
import { Input } from '@/components/ui/input'
import { JsonPanel } from '@/features/holder/components/json-panel'
import { Label } from '@/components/ui/label'

interface ConnectionsPanelProps {
  connections: HolderConnection[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const findInvitationUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.startsWith('http')) {
    return value
  }
  if (!isRecord(value)) {
    return undefined
  }
  for (const key of ['invitationUrl', 'url', 'invitation']) {
    const nested = value[key]
    if (typeof nested === 'string' && nested.startsWith('http')) {
      return nested
    }
    if (isRecord(nested)) {
      const found = findInvitationUrl(nested)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

const renderInvitationResult = (data: unknown): React.JSX.Element | null => {
  if (!data) {
    return null
  }

  const url = findInvitationUrl(data)
  if (url) {
    return (
      <div className="space-y-2">
        <Label>Invitation URL</Label>
        <CopyField value={url} label="Invitation URL" />
      </div>
    )
  }

  return <JsonPanel value={data} label="Invitation" />
}

export function ConnectionsPanel({
  connections,
}: ConnectionsPanelProps): React.JSX.Element {
  const [invitationUrl, setInvitationUrl] = useState('')
  const [offerId, setOfferId] = useState('')
  const [offerStatus, setOfferStatus] = useState<HolderActionResult | null>(
    null,
  )
  const [accepting, startAccept] = useTransition()

  const [inviteState, inviteAction, inviting] = useActionState(
    createConnectionAction,
    null,
  )
  const [receiveState, receiveAction, receiving] = useActionState(
    receiveInvitationAction,
    null,
  )

  const acceptOffer = (): void => {
    startAccept(async () => {
      setOfferStatus(await acceptOfferAction(offerId))
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Connections</h2>
        <p className="text-muted-foreground text-sm">
          DIDComm connections owned by your personal wallet.
        </p>
      </div>

      <FormStatus state={inviteState} />
      <FormStatus state={receiveState} />
      <FormStatus state={offerStatus} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create invitation</CardTitle>
            <CardDescription>
              Share the generated URL with the other party.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={inviteAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitation-label">Label</Label>
                <Input
                  id="invitation-label"
                  name="label"
                  placeholder="My wallet"
                />
              </div>
              <Button type="submit" disabled={inviting}>
                {inviting ? 'Creating…' : 'Create invitation'}
              </Button>
            </form>
            {inviteState?.status === 'success'
              ? renderInvitationResult(inviteState.data)
              : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accept invitation</CardTitle>
            <CardDescription>
              Paste an invitation URL to connect with an issuer or verifier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={receiveAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitation-url">Invitation URL</Label>
                <Input
                  id="invitation-url"
                  name="invitationUrl"
                  value={invitationUrl}
                  onChange={(event) => setInvitationUrl(event.target.value)}
                  placeholder="https://…"
                  required
                />
              </div>
              <Button type="submit" disabled={receiving}>
                {receiving ? 'Accepting…' : 'Accept invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accept credential offer</CardTitle>
          <CardDescription>
            Accept a DIDComm credential offer by record id.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Input
              aria-label="Credential record ID"
              value={offerId}
              onChange={(event) => setOfferId(event.target.value)}
              placeholder="Credential record ID"
            />
            <Button
              type="button"
              variant="outline"
              disabled={accepting || !offerId}
              onClick={acceptOffer}
            >
              Accept offer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your connections</CardTitle>
          <CardDescription>
            Connections established from your personal wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No connections yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {connections.map((connection, index) => (
                <div
                  key={connection.id || index}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{connection.label}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {connection.id}
                    </p>
                  </div>
                  {connection.state && (
                    <Badge variant="secondary">{connection.state}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
