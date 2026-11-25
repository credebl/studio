'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BINDING_ERROR_MESSAGES,
  BINDING_MODE_OPTIONS,
  type BindingSelection,
  type CredentialBindingMode,
  type CredentialBindingPolicy,
  POLICY_OPTIONS,
  PRIMARY_DID_BADGE,
  type ResolvedHolderOffer,
  buildCredentialRequest,
  getAllowedDidMethods,
  getAllowedProofAlgorithms,
  getConfirmationSummary,
  getInitialBindingSelection,
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
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface BindingChoiceFormProps {
  offer: ResolvedHolderOffer
  primaryDidUrl?: string | null
  dids: string[]
}

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as {
      code?: string
      message?: string
    }
    return (
      (body.code &&
        BINDING_ERROR_MESSAGES[
          body.code as keyof typeof BINDING_ERROR_MESSAGES
        ]) ||
      body.message ||
      'Unable to request the credential'
    )
  } catch {
    return 'Unable to request the credential'
  }
}

export const BindingChoiceForm = ({
  offer,
  primaryDidUrl,
  dids,
}: BindingChoiceFormProps): React.JSX.Element => {
  const [selection, setSelection] = useState<BindingSelection>(() =>
    getInitialBindingSelection({ primaryDidUrl, offer }),
  )
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const didMethods = useMemo(() => getAllowedDidMethods(offer), [offer])
  const algorithms = useMemo(() => getAllowedProofAlgorithms(offer), [offer])
  const validation = useMemo(
    () => validateBindingSelection(selection, offer),
    [selection, offer],
  )

  const existingDidOptions = useMemo(() => {
    const options = new Set<string>()
    if (primaryDidUrl) {
      options.add(primaryDidUrl)
    }
    dids.forEach((didUrl) => options.add(didUrl))
    if (selection.holderDidUrl) {
      options.add(selection.holderDidUrl)
    }
    return Array.from(options)
  }, [primaryDidUrl, dids, selection.holderDidUrl])

  const summary = getConfirmationSummary(selection, primaryDidUrl)
  const disabled = !validation.valid || submitting

  const changeMode = (mode: CredentialBindingMode): void => {
    setError(null)
    setSuccess(null)
    if (mode === 'new-key') {
      setSelection({
        mode,
        didMethod: didMethods[0],
        signatureAlgorithm: algorithms[0],
      })
      return
    }

    setSelection((current) => ({
      mode,
      holderDidUrl: primaryDidUrl ?? current.holderDidUrl,
      policy: current.policy ?? 'require',
    }))
  }

  const submit = async (): Promise<void> => {
    if (disabled) {
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = buildCredentialRequest(offer, selection, {
        sendNotification: true,
      })
      const response = await fetch('/api/holder/offers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setError(await readErrorMessage(response))
        return
      }

      const body = (await response.json()) as { message?: string }
      setSuccess(body.message ?? 'Credential requested successfully')
    } catch {
      setError('Unable to request the credential')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Choose how to bind this credential</CardTitle>
          <CardDescription>
            A fresh key keeps issuers from correlating your credentials. Reuse a
            DID only when you explicitly choose to.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RadioGroup
            value={selection.mode}
            onValueChange={(value) =>
              changeMode(value as CredentialBindingMode)
            }
            aria-label="Credential binding mode"
          >
            {BINDING_MODE_OPTIONS.map((option) => (
              <Label
                key={option.mode}
                htmlFor={`binding-mode-${option.mode}`}
                className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm font-normal"
              >
                <RadioGroupItem
                  id={`binding-mode-${option.mode}`}
                  value={option.mode}
                />
                <span>{option.label}</span>
              </Label>
            ))}
          </RadioGroup>

          {selection.mode === 'new-key' && (
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit px-0"
                aria-expanded={showAdvanced}
                onClick={() => setShowAdvanced((current) => !current)}
              >
                {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
              </Button>

              {showAdvanced && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="binding-did-method">DID method</Label>
                    <Select
                      value={selection.didMethod ?? didMethods[0]}
                      onValueChange={(value) =>
                        setSelection((current) => ({
                          ...current,
                          didMethod: value,
                        }))
                      }
                    >
                      <SelectTrigger id="binding-did-method">
                        <SelectValue placeholder="Automatic" />
                      </SelectTrigger>
                      <SelectContent>
                        {didMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="binding-proof-algorithm">
                      Proof algorithm
                    </Label>
                    <Select
                      value={selection.signatureAlgorithm ?? algorithms[0]}
                      onValueChange={(value) =>
                        setSelection((current) => ({
                          ...current,
                          signatureAlgorithm: value,
                        }))
                      }
                    >
                      <SelectTrigger id="binding-proof-algorithm">
                        <SelectValue placeholder="Automatic" />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map((algorithm) => (
                          <SelectItem key={algorithm} value={algorithm}>
                            {algorithm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {selection.mode === 'existing-did' && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="binding-existing-did">Holder DID</Label>
                <Select
                  value={selection.holderDidUrl ?? ''}
                  onValueChange={(value) =>
                    setSelection((current) => ({
                      ...current,
                      holderDidUrl: value,
                    }))
                  }
                >
                  <SelectTrigger id="binding-existing-did">
                    <SelectValue placeholder="Select a DID" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingDidOptions.map((didUrl) => (
                      <SelectItem key={didUrl} value={didUrl}>
                        <span className="flex items-center gap-2">
                          <span>{didUrl}</span>
                          {didUrl === primaryDidUrl && (
                            <Badge variant="outline">{PRIMARY_DID_BADGE}</Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="binding-policy">Binding policy</Label>
                <Select
                  value={selection.policy ?? 'require'}
                  onValueChange={(value) =>
                    setSelection((current) => ({
                      ...current,
                      policy: value as CredentialBindingPolicy,
                    }))
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
        </CardContent>
      </Card>

      <Card data-testid="binding-summary">
        <CardHeader>
          <CardTitle>Confirmation summary</CardTitle>
          <CardDescription>
            This is the binding that will be sent with your request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-sm">
            {summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {!validation.valid && (
        <Alert variant="destructive" data-testid="binding-validation">
          <AlertDescription>
            {BINDING_ERROR_MESSAGES[validation.errors[0]]}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        disabled={disabled}
        onClick={submit}
        className="w-fit"
      >
        {submitting ? 'Requesting…' : 'Request credential'}
      </Button>
    </div>
  )
}

export default BindingChoiceForm
