'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useActionState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { configureCloudBaseWalletAction } from '../actions'

export function CloudBaseWalletForm(): React.JSX.Element {
  const formRef = useRef<HTMLFormElement>(null)
  const [actionState, formAction, isSubmitting] = useActionState(
    configureCloudBaseWalletAction,
    null,
  )

  useEffect(() => {
    if (actionState?.status === 'success') {
      // Clear the secrets from the DOM once they have been accepted.
      formRef.current?.reset()
    }
  }, [actionState])

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
        <form ref={formRef} action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="agent-endpoint">Agent endpoint</Label>
            <Input
              id="agent-endpoint"
              name="agentEndpoint"
              type="text"
              required
              maxLength={2048}
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
              Authorization key the platform uses to call the shared agent.
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
              accepts only one base wallet and it cannot be changed here
              afterwards.
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Configuring...' : 'Configure base wallet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
