'use client'

import {
  BINDING_ERROR_MESSAGES,
  BINDING_MODE_OPTIONS,
  type BindingSelection,
  type BindingValidation,
  type CredentialBindingMode,
  type CredentialBindingPolicy,
  POLICY_OPTIONS,
  PRIMARY_DID_BADGE,
  getAllowedDidMethods,
  getAllowedProofAlgorithms,
  getConfirmationSummary,
  getInitialBindingSelection,
  toResolvedHolderOffer,
  validateBindingSelection,
} from '@/lib/holderBinding'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react'
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
  /** Platform preference; a suggestion shown only after existing-DID opt-in. */
  primaryDidUrl?: string | null
}

export function OffersPanel({
  dids,
  primaryDidUrl,
}: OffersPanelProps): React.JSX.Element {
  const [offerUri, setOfferUri] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [prepareState, setPrepareState] =
    useState<HolderActionResult<unknown> | null>(null)
  const [preparing, startPrepare] = useTransition()

  // Fresh key is the default even when the platform supplies a primary DID.
  const [bindingMode, setBindingMode] =
    useState<CredentialBindingMode>('new-key')
  const [didMethod, setDidMethod] = useState('')
  const [signatureAlgorithm, setSignatureAlgorithm] = useState('')
  const [existingDidUrl, setExistingDidUrl] = useState('')
  const [policy, setPolicy] = useState<CredentialBindingPolicy>('require')

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

  const offer = useMemo(() => {
    if (resolveState?.status !== 'success') {
      return undefined
    }
    return toResolvedHolderOffer(resolveState.data, selected)
  }, [resolveState, selected])

  // Each newly resolved offer starts with the privacy-preserving default and
  // advanced overrides derived from that offer's metadata.
  useEffect(() => {
    setBindingMode('new-key')
    setDidMethod('')
    setSignatureAlgorithm('')
    setExistingDidUrl('')
  }, [resolveState?.data])

  const defaults = useMemo(
    () =>
      getInitialBindingSelection({
        primaryDidUrl,
        offer,
      }),
    [primaryDidUrl, offer],
  )
  const allowedDidMethods = offer ? getAllowedDidMethods(offer) : []
  const allowedAlgorithms = offer ? getAllowedProofAlgorithms(offer) : []
  const activeDidMethod = didMethod || defaults.didMethod || ''
  const activeAlgorithm =
    signatureAlgorithm || defaults.signatureAlgorithm || ''

  const selection: BindingSelection =
    bindingMode === 'new-key'
      ? {
          mode: bindingMode,
          ...(activeDidMethod ? { didMethod: activeDidMethod } : {}),
          ...(activeAlgorithm ? { signatureAlgorithm: activeAlgorithm } : {}),
        }
      : {
          mode: bindingMode,
          holderDidUrl: existingDidUrl,
          policy,
        }

  const validation: BindingValidation = offer
    ? validateBindingSelection(selection, offer)
    : { valid: false, errors: [] }

  const suggestedDid = primaryDidUrl?.trim() || ''
  const existingDidOptions = Array.from(
    new Set([...dids, ...(suggestedDid ? [suggestedDid] : [])]),
  )

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

  const changeBindingMode = (value: string): void => {
    if (!BINDING_MODE_OPTIONS.some((option) => option.mode === value)) {
      return
    }
    const nextMode = value as CredentialBindingMode
    setBindingMode(nextMode)
    // Pre-fill only when the user explicitly opts into an existing DID.
    if (nextMode === 'existing-did' && !existingDidUrl) {
      setExistingDidUrl(suggestedDid || dids[0] || '')
    }
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
              Choose how the credential is bound. A fresh key is used unless you
              explicitly opt into an existing DID.
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
              <input type="hidden" name="bindingMode" value={selection.mode} />
              {selection.mode === 'new-key' ? (
                <>
                  {activeDidMethod ? (
                    <input
                      type="hidden"
                      name="bindingDidMethod"
                      value={activeDidMethod}
                    />
                  ) : null}
                  {activeAlgorithm ? (
                    <input
                      type="hidden"
                      name="bindingSignatureAlgorithm"
                      value={activeAlgorithm}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <input
                    type="hidden"
                    name="bindingHolderDidUrl"
                    value={existingDidUrl}
                  />
                  <input type="hidden" name="bindingPolicy" value={policy} />
                </>
              )}

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

              <div className="space-y-3 rounded-md border p-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Credential binding</h3>
                  <p className="text-muted-foreground text-xs">
                    A fresh key keeps this credential unlinkable from your other
                    issuers. Only choose an existing DID when you want it
                    reused.
                  </p>
                </div>
                <RadioGroup
                  value={bindingMode}
                  onValueChange={changeBindingMode}
                  className="gap-3"
                >
                  {BINDING_MODE_OPTIONS.map((option) => (
                    <label
                      key={option.mode}
                      htmlFor={`binding-${option.mode}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      <RadioGroupItem
                        id={`binding-${option.mode}`}
                        value={option.mode}
                        className="border-primary text-primary focus:ring-ring size-4 rounded-full border shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>

                {bindingMode === 'new-key' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="binding-did-method">DID method</Label>
                      <Select
                        value={activeDidMethod}
                        onValueChange={setDidMethod}
                      >
                        <SelectTrigger id="binding-did-method">
                          <SelectValue placeholder="Automatic" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedDidMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="binding-algorithm">Proof algorithm</Label>
                      <Select
                        value={activeAlgorithm}
                        onValueChange={setSignatureAlgorithm}
                      >
                        <SelectTrigger id="binding-algorithm">
                          <SelectValue placeholder="Automatic" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedAlgorithms.map((algorithm) => (
                            <SelectItem key={algorithm} value={algorithm}>
                              {algorithm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="existing-did">Holder DID</Label>
                      <Select
                        value={existingDidUrl}
                        onValueChange={setExistingDidUrl}
                      >
                        <SelectTrigger id="existing-did">
                          <SelectValue placeholder="Choose a DID" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingDidOptions.map((did) => (
                            <SelectItem key={did} value={did}>
                              {did}
                              {did === suggestedDid
                                ? ` (${PRIMARY_DID_BADGE})`
                                : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {suggestedDid ? (
                        <p className="text-muted-foreground text-xs">
                          {suggestedDid} is {PRIMARY_DID_BADGE} — it is only
                          used if you choose this option.
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="binding-policy">Binding policy</Label>
                      <Select
                        value={policy}
                        onValueChange={(value) =>
                          setPolicy(value as CredentialBindingPolicy)
                        }
                      >
                        <SelectTrigger id="binding-policy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POLICY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted/40 space-y-1 rounded-md p-3 text-sm">
                <p className="font-medium">Confirmation</p>
                {getConfirmationSummary(selection, primaryDidUrl).map(
                  (line) => (
                    <p key={line} className="text-muted-foreground">
                      {line}
                    </p>
                  ),
                )}
                {validation.errors.length > 0 ? (
                  <ul className="text-destructive list-disc pl-5 text-xs">
                    {validation.errors.map((error) => (
                      <li key={error}>{BINDING_ERROR_MESSAGES[error]}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={
                  selected.length === 0 ||
                  requesting ||
                  !offer ||
                  !validation.valid
                }
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
