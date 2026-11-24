'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  authorizationRequestAction,
  requestCredentialAction,
  resolveOfferAction,
} from '../actions'
import { useActionState, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormStatus } from '@/features/holder/components/form-status'
import type { HolderActionResult } from '@/features/holder/types'
import { Input } from '@/components/ui/input'
import { JsonPanel } from '@/features/holder/components/json-panel'
import { Label } from '@/components/ui/label'
import { normalizeResolvedOffer } from '@/features/holder/normalize'

interface OffersPanelProps {
  dids: string[]
}

export function OffersPanel({ dids }: OffersPanelProps): React.JSX.Element {
  const [offerUri, setOfferUri] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [prepareState, setPrepareState] =
    useState<HolderActionResult<unknown> | null>(null)
  const [preparing, startPrepare] = useTransition()

  const [resolveState, resolveAction, resolving] = useActionState(
    resolveOfferAction,
    null,
  )
  const [requestState, requestAction, requesting] = useActionState(
    requestCredentialAction,
    null,
  )

  const configurations = useMemo(() => {
    if (resolveState?.status !== 'success') {
      return []
    }
    return normalizeResolvedOffer(resolveState.data).configurations
  }, [resolveState])

  const toggleConfiguration = (id: string, checked: boolean): void => {
    setSelected((current) => {
      if (checked) {
        return Array.from(new Set([...current, id]))
      }
      return current.filter((item) => item !== id)
    })
  }

  const prepareAuthorization = (): void => {
    startPrepare(async () => {
      setPrepareState(await authorizationRequestAction(offerUri, selected))
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Redeem offer</h2>
        <p className="text-muted-foreground text-sm">
          Paste or paste-scan an OpenID4VCI credential offer to add it to your
          wallet.
        </p>
      </div>

      <FormStatus state={resolveState} />
      <FormStatus state={requestState} />
      <FormStatus state={prepareState} />

      <Card>
        <CardHeader>
          <CardTitle>Credential offer</CardTitle>
          <CardDescription>
            Offers use the <code>openid-credential-offer://</code> scheme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resolveAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer-uri">Offer URI</Label>
              <Input
                id="offer-uri"
                name="credentialOfferUri"
                value={offerUri}
                onChange={(event) => setOfferUri(event.target.value)}
                placeholder="openid-credential-offer://?credential_offer=…"
                required
              />
            </div>
            <Button type="submit" disabled={resolving}>
              {resolving ? 'Resolving…' : 'Resolve offer'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {configurations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose credentials</CardTitle>
            <CardDescription>
              Select the configurations you want to request from the issuer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {configurations.map((configuration) => (
                <label
                  key={configuration.id}
                  className="flex items-center gap-3 rounded-md border p-3 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(configuration.id)}
                    onCheckedChange={(value) =>
                      toggleConfiguration(configuration.id, value === true)
                    }
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {configuration.label}
                    </span>
                    <span className="text-muted-foreground block truncate font-mono text-xs">
                      {configuration.id}
                    </span>
                  </span>
                </label>
              ))}

              <Button
                type="button"
                variant="outline"
                disabled={selected.length === 0 || preparing}
                onClick={prepareAuthorization}
              >
                {preparing ? 'Preparing…' : 'Prepare authorization'}
              </Button>

              {prepareState?.status === 'success' && prepareState.data ? (
                <JsonPanel
                  value={prepareState.data}
                  label="Authorization details"
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      {configurations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request credential</CardTitle>
            <CardDescription>
              Provide the authorization code or transaction code required by the
              issuer. DID binding is optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={requestAction} className="space-y-4">
              <input type="hidden" name="credentialOfferUri" value={offerUri} />
              <input
                type="hidden"
                name="credentialsToRequest"
                value={selected.join(',')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="authorization-code">Authorization code</Label>
                  <Input id="authorization-code" name="authorizationCode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code-verifier">PKCE code verifier</Label>
                  <Input id="code-verifier" name="codeVerifier" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tx-code">Transaction code</Label>
                  <Input
                    id="tx-code"
                    name="txCode"
                    placeholder="Pre-authorized flow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification">Send notification</Label>
                  <Select name="sendNotification" defaultValue="true">
                    <SelectTrigger id="notification">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {dids.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="holder-did">Bind to a DID (optional)</Label>
                    <Select name="holderDidUrl" defaultValue="">
                      <SelectTrigger id="holder-did">
                        <SelectValue placeholder="Use a new key" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Use a new key</SelectItem>
                        {dids.map((did) => (
                          <SelectItem key={did} value={did}>
                            {did}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="binding-policy">Binding policy</Label>
                    <Select name="bindingPolicy" defaultValue="require">
                      <SelectTrigger id="binding-policy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="require">Require</SelectItem>
                        <SelectItem value="prefer">Prefer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={selected.length === 0 || requesting}
              >
                {requesting ? 'Requesting…' : 'Request credential'}
              </Button>
            </form>

            {requestState?.status === 'success' && requestState.data ? (
              <div className="mt-4">
                <JsonPanel value={requestState.data} label="Issuance result" />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
