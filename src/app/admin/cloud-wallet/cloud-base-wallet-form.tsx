'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  CloudBaseWalletActionResult,
  CloudBaseWalletStatus,
} from '@/features/admin/types'
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { configureCloudBaseWalletAction } from '../actions'

type WalletReset = { type: 'reset' }
type WalletActionState = CloudBaseWalletActionResult | null
type WalletActionPayload = FormData | WalletReset

const walletAction = async (
  previous: WalletActionState,
  payload: WalletActionPayload,
): Promise<WalletActionState> => {
  if (payload instanceof FormData) {
    return configureCloudBaseWalletAction(previous, payload)
  }

  return null
}

const formatConfiguredAt = (value?: string): string | undefined => {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? undefined
    : `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

export function CloudBaseWalletPanel({
  initialStatus,
}: {
  initialStatus: CloudBaseWalletStatus
}): React.JSX.Element {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState(initialStatus)
  const [isEditing, setIsEditing] = useState(!initialStatus.configured)
  const [actionState, dispatch, isSubmitting] = useActionState(
    walletAction,
    null,
  )

  useEffect(() => {
    if (!actionState?.configured) {
      return
    }

    // Clear any secrets the admin typed before switching away from the form.
    formRef.current?.reset()
    setStatus((current) => ({
      configured: true,
      agentEndpoint: actionState.agentEndpoint ?? current.agentEndpoint,
      configuredAt: actionState.configuredAt ?? current.configuredAt,
    }))
    setIsEditing(false)
  }, [actionState])

  const openEditor = (): void => {
    formRef.current?.reset()
    startTransition(() => {
      dispatch({ type: 'reset' })
      setIsEditing(true)
    })
  }

  const closeEditor = (): void => {
    formRef.current?.reset()
    startTransition(() => {
      dispatch({ type: 'reset' })
      setIsEditing(false)
    })
  }

  if (!isEditing && status.configured) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Shared agent connected</CardTitle>
              <CardDescription>
                The platform already has one base wallet for holder cloud
                wallets.
              </CardDescription>
            </div>
            <Badge variant="secondary">Configured</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {actionState?.configured ? (
            <Alert
              variant={
                actionState.status === 'error' ? 'destructive' : 'default'
              }
              role={actionState.status === 'error' ? 'alert' : 'status'}
            >
              <AlertDescription>{actionState.message}</AlertDescription>
            </Alert>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">Agent endpoint</dt>
              <dd className="font-mono text-xs break-all">
                {status.agentEndpoint ?? 'Not available from the platform API'}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm">Configured</dt>
              <dd className="text-sm">
                {formatConfiguredAt(status.configuredAt) ??
                  'Previously configured'}
              </dd>
            </div>
          </dl>

          <p className="text-muted-foreground text-sm">
            The agent API key and wallet key are encrypted by the platform and
            are never displayed again.
          </p>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={openEditor}>
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {status.configured ? 'Edit shared agent' : 'Connect the shared agent'}
        </CardTitle>
        <CardDescription>
          {status.configured
            ? 'Platform v2.3.0 accepts only one base wallet and has no update endpoint. Saving while one exists is safely rejected.'
            : 'The platform creates one tenant on this agent for each holder wallet. Keys are sent over TLS and encrypted by the platform; Studio does not store them.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form ref={formRef} action={dispatch} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="agent-endpoint">Agent endpoint</Label>
            <Input
              id="agent-endpoint"
              name="agentEndpoint"
              type="text"
              required
              maxLength={2048}
              defaultValue={status.agentEndpoint ?? ''}
              placeholder="https://agent.example.com:4001"
              autoComplete="off"
              spellCheck={false}
              aria-describedby="agent-endpoint-description"
            />
            <p
              id="agent-endpoint-description"
              className="text-muted-foreground text-sm"
            >
              Base URL of the agent-controller v2.3.3 instance, including the
              port if it is not the default.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-api-key">Agent API key</Label>
            <Input
              id="agent-api-key"
              name="apiKey"
              type="password"
              required
              maxLength={4096}
              autoComplete="new-password"
              aria-describedby="agent-api-key-description"
            />
            <p
              id="agent-api-key-description"
              className="text-muted-foreground text-sm"
            >
              Authorization key the platform uses to call the shared agent. The
              base-agent JWT from{' '}
              <code className="text-xs">POST /agent/token</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-key">Wallet key</Label>
            <Input
              id="wallet-key"
              name="walletKey"
              type="password"
              required
              maxLength={4096}
              autoComplete="new-password"
              aria-describedby="wallet-key-description"
            />
            <p
              id="wallet-key-description"
              className="text-muted-foreground text-sm"
            >
              Wallet key stored by the platform alongside the base agent.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="cloud-wallet-confirm"
              name="confirm"
              type="checkbox"
              required
              className="border-input bg-background focus-visible:ring-ring mt-0.5 size-4 rounded border shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            />
            <Label
              htmlFor="cloud-wallet-confirm"
              className="text-muted-foreground text-sm font-normal"
            >
              I have verified the endpoint and keys. I understand the platform
              accepts only one base wallet and existing settings are not
              replaced.
            </Label>
          </div>

          {actionState ? (
            <Alert
              variant={
                actionState.status === 'error' ? 'destructive' : 'default'
              }
              role={actionState.status === 'error' ? 'alert' : 'status'}
            >
              <AlertDescription>{actionState.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2">
            {status.configured ? (
              <Button type="button" variant="ghost" onClick={closeEditor}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? status.configured
                  ? 'Saving...'
                  : 'Configuring...'
                : status.configured
                  ? 'Save base wallet'
                  : 'Configure base wallet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
