'use client'

import type {
  AgentTokenActionResult,
  CloudBaseWalletActionResult,
  CloudBaseWalletStatus,
} from '@/features/admin/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  configureCloudBaseWalletAction,
  fetchAgentAuthTokenAction,
} from '../actions'
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

type WalletReset = { type: 'reset' }
type WalletActionState = CloudBaseWalletActionResult | null
type WalletActionPayload = FormData | WalletReset

type TokenReset = { type: 'reset' }
type TokenActionState = AgentTokenActionResult | null
type TokenActionPayload = FormData | TokenReset

interface Notice {
  status: 'success' | 'error'
  message: string
}

const walletAction = async (
  previous: WalletActionState,
  payload: WalletActionPayload,
): Promise<WalletActionState> => {
  if (payload instanceof FormData) {
    return configureCloudBaseWalletAction(previous, payload)
  }

  return null
}

const tokenAction = async (
  previous: TokenActionState,
  payload: TokenActionPayload,
): Promise<TokenActionState> => {
  if (payload instanceof FormData) {
    return fetchAgentAuthTokenAction(previous, payload)
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
  const apiKeyRef = useRef<HTMLInputElement>(null)
  const agentAuthKeyRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState(initialStatus)
  const [isEditing, setIsEditing] = useState(!initialStatus.configured)
  const [tokenNotice, setTokenNotice] = useState<Notice | null>(null)
  const [actionState, dispatch, isSubmitting] = useActionState(
    walletAction,
    null,
  )
  const [tokenState, fetchTokenDispatch, isFetchingToken] = useActionState(
    tokenAction,
    null,
  )

  useEffect(() => {
    if (!tokenState) {
      return
    }

    if (tokenState.status === 'success' && tokenState.token) {
      // Populate the form only for this submission; the raw authorization key
      // is cleared immediately and neither value is persisted by Studio.
      if (apiKeyRef.current) {
        apiKeyRef.current.value = tokenState.token
      }
      if (agentAuthKeyRef.current) {
        agentAuthKeyRef.current.value = ''
      }
    }

    setTokenNotice({
      status: tokenState.status,
      message: tokenState.message,
    })
    startTransition(() => {
      fetchTokenDispatch({ type: 'reset' })
    })
  }, [tokenState, fetchTokenDispatch])

  useEffect(() => {
    if (!actionState?.configured) {
      return
    }

    // Clear any secrets the admin typed before switching away from the form.
    formRef.current?.reset()
    setTokenNotice(null)
    setStatus((current) => ({
      configured: true,
      agentEndpoint: actionState.agentEndpoint ?? current.agentEndpoint,
      configuredAt: actionState.configuredAt ?? current.configuredAt,
    }))
    setIsEditing(false)
  }, [actionState])

  const clearTransientSecrets = (): void => {
    formRef.current?.reset()
    setTokenNotice(null)
  }

  const openEditor = (): void => {
    clearTransientSecrets()
    startTransition(() => {
      dispatch({ type: 'reset' })
      fetchTokenDispatch({ type: 'reset' })
      setIsEditing(true)
    })
  }

  const closeEditor = (): void => {
    clearTransientSecrets()
    startTransition(() => {
      dispatch({ type: 'reset' })
      fetchTokenDispatch({ type: 'reset' })
      setIsEditing(false)
    })
  }

  const invalidateFetchedToken = (): void => {
    if (apiKeyRef.current) {
      apiKeyRef.current.value = ''
    }
    setTokenNotice(null)
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
            The agent and wallet keys are encrypted by the platform and are
            never displayed again. This configuration lets the platform create
            one wallet tenant per holder; it does not create holder wallets
            itself. Studio keeps only the non-secret endpoint and status shown
            above.
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
              onChange={invalidateFetchedToken}
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
            <Label htmlFor="agent-token-url">Token fetch URL (optional)</Label>
            <Input
              id="agent-token-url"
              name="tokenEndpoint"
              type="text"
              maxLength={2048}
              placeholder="Uses the agent endpoint above"
              autoComplete="off"
              spellCheck={false}
              onChange={invalidateFetchedToken}
              aria-describedby="agent-token-url-description"
            />
            <p
              id="agent-token-url-description"
              className="text-muted-foreground text-sm"
            >
              Only needed when Studio reaches the agent at a different URL than
              the platform does, such as{' '}
              <code className="text-xs">localhost</code> versus{' '}
              <code className="text-xs">host.docker.internal</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-authorization-key">
              Agent authorization key
            </Label>
            <Input
              ref={agentAuthKeyRef}
              id="agent-authorization-key"
              name="agentAuthKey"
              type="password"
              maxLength={4096}
              autoComplete="off"
              onChange={invalidateFetchedToken}
              aria-describedby="agent-authorization-key-description"
            />
            <p
              id="agent-authorization-key-description"
              className="text-muted-foreground text-sm"
            >
              Optional. The raw <code className="text-xs">AGENT_API_KEY</code>{' '}
              used only to call{' '}
              <code className="text-xs">POST /agent/token</code>. It is not sent
              to the platform or stored by Studio.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                formAction={fetchTokenDispatch}
                formNoValidate
                variant="outline"
                disabled={isFetchingToken || isSubmitting}
              >
                {isFetchingToken ? 'Checking agent...' : 'Fetch token'}
              </Button>
              <span className="text-muted-foreground text-xs">
                Tests that the agent is reachable and fills the runtime API key.
              </span>
            </div>
          </div>

          {tokenNotice ? (
            <Alert
              variant={
                tokenNotice.status === 'error' ? 'destructive' : 'default'
              }
              role={tokenNotice.status === 'error' ? 'alert' : 'status'}
            >
              <AlertDescription>{tokenNotice.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="agent-api-key">Agent API key</Label>
            <Input
              ref={apiKeyRef}
              id="agent-api-key"
              name="apiKey"
              type="password"
              required
              maxLength={4096}
              autoComplete="new-password"
              onChange={() => setTokenNotice(null)}
              aria-describedby="agent-api-key-description"
            />
            <p
              id="agent-api-key-description"
              className="text-muted-foreground text-sm"
            >
              Runtime JWT from{' '}
              <code className="text-xs">POST /agent/token</code>. Use Fetch
              token above or paste a token you already minted.
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
              accepts only one base wallet, encrypts the keys, and this enables
              holder wallet creation.
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
            <Button type="submit" disabled={isSubmitting || isFetchingToken}>
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
