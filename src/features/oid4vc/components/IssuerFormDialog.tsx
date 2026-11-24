'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IApiResponse,
  IIssuerListItem,
  ILocaleEntry,
} from '@/app/oid4vc/interface/interface'
import {
  IssuerFormFields,
  buildIssuerFormState,
  buildUpdateIssuerPayload,
  getErrorMessage,
  isSuccessStatus,
} from '@/features/oid4vc/utils/lifecycle'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  buildCreateIssuerPayload,
  getCreateIssuerErrors,
} from '@/features/oid4vc/utils/createIssuer'
import { createIssuer, updateIssuer } from '@/app/api/oid4vc'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getOrganizationById } from '@/app/api/organization'

interface IssuerFormDialogProps {
  open: boolean
  orgId: string
  orgName?: string
  issuer?: IIssuerListItem
  onClose: () => void
  onSaved: (issuerId: string, message: string) => void
}

const localeOptions: Record<string, string> = {
  French: 'fr',
  German: 'de',
  Spanish: 'es',
}

export default function IssuerFormDialog({
  open,
  orgId,
  orgName,
  issuer,
  onClose,
  onSaved,
}: IssuerFormDialogProps): JSX.Element {
  const [fields, setFields] = useState<IssuerFormFields>(() =>
    buildIssuerFormState(issuer),
  )
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setFields(buildIssuerFormState(issuer))
    setTouched({})
    setSubmitted(false)
    setError(null)
  }, [issuer, open])

  useEffect(() => {
    if (!open || issuer || !orgId) {
      return
    }

    let cancelled = false

    getOrganizationById(orgId)
      .then((response) => {
        if (cancelled || typeof response === 'string') {
          return
        }

        const endpoint = (response as AxiosResponse)?.data?.data
          ?.org_agents?.[0]?.agentEndPoint

        if (typeof endpoint === 'string' && endpoint.trim()) {
          setFields((previous) => ({
            ...previous,
            authorizationServerUrl: endpoint.trim(),
          }))
        }
      })
      .catch(() => {
        // The authorization server URL stays editable when lookup fails.
      })

    return () => {
      cancelled = true
    }
  }, [issuer, open, orgId])

  const errors = useMemo(() => {
    const nextErrors = getCreateIssuerErrors(fields)
    if (issuer) {
      // The platform omits these optional fields for existing issuers.
      delete nextErrors.authorizationServerUrl
      delete nextErrors.description
    }
    if (Number(fields.batchCredentialIssuanceSize) < 1) {
      nextErrors.batch = 'Batch size must be at least 1'
    }
    return nextErrors
  }, [fields, issuer])

  const getFieldError = (key: string): string | undefined => {
    if (submitted || touched[key]) {
      return errors[key]
    }
    return undefined
  }

  const setField = <K extends keyof IssuerFormFields>(
    key: K,
    value: IssuerFormFields[K],
  ): void => setFields((previous) => ({ ...previous, [key]: value }))

  const markTouched = (key: string): void =>
    setTouched((previous) => ({ ...previous, [key]: true }))

  const addLocale = (): void =>
    setFields((previous) => ({
      ...previous,
      locales: [
        ...previous.locales,
        { name: '', description: '', locale: 'fr' },
      ],
    }))

  const updateLocale = (
    index: number,
    field: keyof ILocaleEntry,
    value: string,
  ): void =>
    setFields((previous) => ({
      ...previous,
      locales: previous.locales.map((entry, entryIndex) => {
        if (entryIndex === index) {
          return { ...entry, [field]: value }
        }
        return entry
      }),
    }))

  const removeLocale = (index: number): void =>
    setFields((previous) => ({
      ...previous,
      locales: previous.locales.filter((_, entryIndex) => entryIndex !== index),
    }))

  const handleSubmit = async (): Promise<void> => {
    setSubmitted(true)
    setError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      setLoading(true)

      if (issuer) {
        const payload = buildUpdateIssuerPayload(fields)
        const response = (await updateIssuer(
          orgId,
          issuer.id,
          payload,
        )) as AxiosResponse<IApiResponse<IIssuerListItem>>

        if (!isSuccessStatus(response.status, [200, 201])) {
          throw new Error(response.data?.message ?? 'Failed to update issuer')
        }

        onSaved(issuer.id, response.data?.message ?? 'Issuer updated')
        return
      }

      const payload = buildCreateIssuerPayload(orgName ?? '', fields)
      payload.batchCredentialIssuanceSize =
        Number(fields.batchCredentialIssuanceSize) || 1
      payload.cryptographicBindingMethods = []

      const response = (await createIssuer(orgId, payload)) as AxiosResponse<
        IApiResponse<IIssuerListItem>
      >

      if (!isSuccessStatus(response.status, [200, 201])) {
        throw new Error(response.data?.message ?? 'Failed to create issuer')
      }

      onSaved(
        response.data?.data?.id ?? payload.issuerId,
        response.data?.message ?? 'Issuer created',
      )
    } catch (caught) {
      setError(getErrorMessage(caught, 'Failed to save issuer'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issuer ? 'Edit issuer' : 'Create issuer'}</DialogTitle>
        </DialogHeader>

        {error && (
          <AlertComponent
            message={error}
            type="failure"
            onAlertClose={() => setError(null)}
          />
        )}

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lifecycle-issuer-name">Name</Label>
              <Input
                id="lifecycle-issuer-name"
                value={fields.name}
                placeholder="Enter issuer name"
                onChange={(event) => setField('name', event.target.value)}
                onBlur={() => markTouched('name')}
              />
              {getFieldError('name') && (
                <p className="text-destructive text-xs">
                  {getFieldError('name')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifecycle-issuer-logo">Logo URL</Label>
              <Input
                id="lifecycle-issuer-logo"
                value={fields.logoLink}
                placeholder="https://example.com/logo.svg"
                onChange={(event) => setField('logoLink', event.target.value)}
                onBlur={() => markTouched('logo')}
              />
              {getFieldError('logo') && (
                <p className="text-destructive text-xs">
                  {getFieldError('logo')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifecycle-issuer-description">Description</Label>
            <Textarea
              id="lifecycle-issuer-description"
              value={fields.description}
              placeholder="Describe this issuer"
              rows={3}
              onChange={(event) => setField('description', event.target.value)}
              onBlur={() => markTouched('description')}
            />
            {getFieldError('description') && (
              <p className="text-destructive text-xs">
                {getFieldError('description')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifecycle-issuer-as">
              Authorization server URL
            </Label>
            <Input
              id="lifecycle-issuer-as"
              value={fields.authorizationServerUrl}
              disabled={Boolean(issuer)}
              placeholder="https://agent.example.com"
              onChange={(event) =>
                setField('authorizationServerUrl', event.target.value)
              }
              onBlur={() => markTouched('authorizationServerUrl')}
            />
            {issuer && (
              <p className="text-muted-foreground text-xs">
                The authorization server URL cannot be changed after creation.
              </p>
            )}
            {getFieldError('authorizationServerUrl') && (
              <p className="text-destructive text-xs">
                {getFieldError('authorizationServerUrl')}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lifecycle-issuer-batch">Batch size</Label>
              <Input
                id="lifecycle-issuer-batch"
                type="number"
                min={1}
                value={fields.batchCredentialIssuanceSize}
                onChange={(event) =>
                  setField('batchCredentialIssuanceSize', event.target.value)
                }
                onBlur={() => markTouched('batch')}
              />
              {getFieldError('batch') && (
                <p className="text-destructive text-xs">
                  {getFieldError('batch')}
                </p>
              )}
            </div>

            {issuer && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="lifecycle-issuer-primary">Primary issuer</Label>
                <Switch
                  id="lifecycle-issuer-primary"
                  checked={fields.isPrimary}
                  onCheckedChange={(checked) => setField('isPrimary', checked)}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">
                Additional locales
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={addLocale}
              >
                <Plus className="h-3.5 w-3.5" />
                Add locale
              </Button>
            </div>

            {fields.locales.map((locale, index) => (
              <div
                key={`locale-${index}`}
                className="space-y-3 rounded-md border p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`locale-${index}-name`}>Name</Label>
                    <Input
                      id={`locale-${index}-name`}
                      value={locale.name}
                      onChange={(event) =>
                        updateLocale(index, 'name', event.target.value)
                      }
                      onBlur={() => markTouched(`locale-${index}-name`)}
                    />
                    {getFieldError(`locale-${index}-name`) && (
                      <p className="text-destructive text-xs">
                        {getFieldError(`locale-${index}-name`)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`locale-${index}-code`}>Locale</Label>
                    <Select
                      value={locale.locale}
                      onValueChange={(value) =>
                        updateLocale(index, 'locale', value)
                      }
                    >
                      <SelectTrigger id={`locale-${index}-code`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(localeOptions).map(([label, code]) => (
                          <SelectItem key={code} value={code}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`locale-${index}-description`}>
                    Description
                  </Label>
                  <Textarea
                    id={`locale-${index}-description`}
                    value={locale.description}
                    rows={2}
                    onChange={(event) =>
                      updateLocale(index, 'description', event.target.value)
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive gap-1.5"
                    onClick={() => removeLocale(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader size={16} />}
              {issuer ? 'Save changes' : 'Create issuer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
