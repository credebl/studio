'use client'

import { AgentEndpointField, CUSTOM_AGENT_ID } from './agent-endpoint-field'
import type {
  AgentTokenActionResult,
  CloudBaseWalletActionResult,
  CloudBaseWalletStatus,
  KnownAgentOption,
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
import { startTransition, useActionState, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
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

type FetchInputField = 'agentEndpoint' | 'tokenEndpoint' | 'agentAuthKey'
type TextFieldName = FetchInputField | 'walletKey'

interface FormValues {
  agentEndpoint: string
  tokenEndpoint: string
  agentAuthKey: string
  walletKey: string
  confirm: boolean
}

const initialFormValues = (status: CloudBaseWalletStatus): FormValues => ({
  agentEndpoint: status.agentEndpoint ?? '',
  tokenEndpoint: '',
  agentAuthKey: '',
  walletKey: '',
  confirm: false,
})

const initialSelectedAgentId = (
  status: CloudBaseWalletStatus,
  knownAgents: KnownAgentOption[],
): string => {
  const endpoint = status.agentEndpoint?.trim()
  const match = knownAgents.find((option) => option.endpoint === endpoint)
  if (endpoint) {
    return match?.id ?? CUSTOM_AGENT_ID
  }
  return knownAgents.length > 0 ? '' : CUSTOM_AGENT_ID
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
  knownAgents,
}: {
  initialStatus: CloudBaseWalletStatus
  knownAgents: KnownAgentOption[]
}): React.JSX.Element {
  const [status, setStatus] = useState(initialStatus)
  const [formValues, setFormValues] = useState<FormValues>(() =>
    initialFormValues(initialStatus),
  )
  const [selectedAgentId, setSelectedAgentId] = useState(() =>
    initialSelectedAgentId(initialStatus, knownAgents),
  )
  const [tokenNotice, setTokenNotice] = useState<Notice | null>(null)
  const [fetchedToken, setFetchedToken] = useState('')
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
      // Keep the JWT only in transient client state; clear the raw key it was
      // minted from as soon as the fetch succeeds.
      setFetchedToken(tokenState.token)
      setFormValues((current) => ({ ...current, agentAuthKey: '' }))
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
    setFetchedToken('')
    setTokenNotice(null)
    setFormValues((current) => ({
      ...current,
      agentAuthKey: '',
      walletKey: '',
      confirm: false,
    }))
    setStatus((current) => ({
      configured: true,
      agentEndpoint: actionState.agentEndpoint ?? current.agentEndpoint,
      configuredAt: actionState.configuredAt ?? current.configuredAt,
    }))
  }, [actionState])

  const updateTextField = (field: TextFieldName, value: string): void => {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  const updateFetchInput = (field: FetchInputField, value: string): void => {
    updateTextField(field, value)
    setFetchedToken('')
    setTokenNotice(null)
  }

  const handleSelectAgent = (value: string): void => {
    setSelectedAgentId(value)

    if (value === CUSTOM_AGENT_ID) {
      updateFetchInput('agentEndpoint', '')
      updateFetchInput('tokenEndpoint', '')
      return
    }

    const option = knownAgents.find((item) => item.id === value)
    if (!option) {
      return
    }

    setFormValues((current) => ({
      ...current,
      agentEndpoint: option.endpoint,
      tokenEndpoint: option.tokenEndpoint ?? '',
    }))
    setFetchedToken('')
    setTokenNotice(null)
  }

  const handleFetchToken = (): void => {
    const formData = new FormData()
    formData.set('agentEndpoint', formValues.agentEndpoint)
    formData.set('tokenEndpoint', formValues.tokenEndpoint)
    formData.set('agentAuthKey', formValues.agentAuthKey)

    // A plain button avoids React's automatic form reset, which was clearing
    // unrelated fields whenever the token was fetched.
    startTransition(() => {
      fetchTokenDispatch(formData)
    })
  }

  if (status.configured) {
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
            // The wallet is configured here, so a conflict ("already
            // configured") is information, not a failure: keep it neutral.
            <Alert variant="default" role="status">
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

          <p className="text-muted-foreground text-sm">
            Platform v2.3.0 has no read or update endpoint for the base wallet.
            Studio cannot change these details or reconfigure the shared agent;
            replacing it requires a platform change.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Connect the shared agent</CardTitle>
        <CardDescription>
          The platform creates one tenant on this agent for each holder wallet.
          Keys are sent over TLS and encrypted by the platform; Studio does not
          store them.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={dispatch} className="space-y-5">
          <AgentEndpointField
            value={formValues.agentEndpoint}
            options={knownAgents}
            selectedId={selectedAgentId}
            onSelect={handleSelectAgent}
            onChange={(value) => updateFetchInput('agentEndpoint', value)}
          />

          <div className="space-y-2">
            <Label htmlFor="agent-token-url">Token fetch URL (optional)</Label>
            <Input
              id="agent-token-url"
              name="tokenEndpoint"
              type="text"
              maxLength={2048}
              value={formValues.tokenEndpoint}
              placeholder="Uses the agent endpoint above"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) =>
                updateFetchInput('tokenEndpoint', event.target.value)
              }
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
              id="agent-authorization-key"
              name="agentAuthKey"
              type="password"
              maxLength={4096}
              value={formValues.agentAuthKey}
              autoComplete="off"
              onChange={(event) =>
                updateFetchInput('agentAuthKey', event.target.value)
              }
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
                type="button"
                variant="outline"
                onClick={handleFetchToken}
                disabled={isFetchingToken || isSubmitting}
              >
                {isFetchingToken ? 'Checking agent...' : 'Fetch token'}
              </Button>
              <span className="text-muted-foreground text-xs">
                Tests that the agent is reachable and fetches the runtime key.
              </span>
              {fetchedToken ? (
                <span className="text-success flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  Token fetched
                </span>
              ) : null}
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
            <p className="text-sm font-medium">Runtime API key</p>
            <input name="apiKey" type="hidden" value={fetchedToken} />
            {fetchedToken ? (
              <div className="text-success bg-muted flex items-center gap-2 rounded-md p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Runtime API key fetched and ready to configure.</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Fetch a runtime key above to continue. The JWT is not displayed.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-key">Wallet key</Label>
            <Input
              id="wallet-key"
              name="walletKey"
              type="password"
              required
              maxLength={4096}
              value={formValues.walletKey}
              autoComplete="new-password"
              onChange={(event) =>
                updateTextField('walletKey', event.target.value)
              }
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
              checked={formValues.confirm}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  confirm: event.target.checked,
                }))
              }
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || isFetchingToken}>
              {isSubmitting ? 'Configuring...' : 'Configure base wallet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
