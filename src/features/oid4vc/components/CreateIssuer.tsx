'use client'

import {
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Plus,
} from 'lucide-react'
import {
  ICreateIssuerResponse,
  ILocaleEntry,
} from '@/app/oid4vc/interface/interface'
import { JSX, useEffect, useMemo, useState } from 'react'
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
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Textarea } from '@/components/ui/textarea'
import { addIssuer } from '@/lib/oid4vc'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createIssuer } from '@/app/api/oid4vc'
import { getOrganizationById } from '@/app/api/organization'

const localeOptions: Record<string, string> = {
  Fr: 'fr',
  De: 'de',
  Es: 'es',
}

export default function CreateIssuer(): JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoLink, setLogoLink] = useState('')
  const [authorizationServerUrl, setAuthorizationServerUrl] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [locales, setLocales] = useState<ILocaleEntry[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const orgName = useAppSelector((state) => state.organization.orgInfo?.name)

  useEffect(() => {
    if (!orgId) {
      return
    }

    let cancelled = false

    getOrganizationById(orgId)
      .then((response) => {
        if (cancelled || typeof response === 'string') {
          return
        }

        const { data } = response as AxiosResponse
        const endpoint = data?.data?.org_agents?.[0]?.agentEndPoint

        if (typeof endpoint === 'string' && endpoint.trim()) {
          setAuthorizationServerUrl(endpoint.trim())
        }
      })
      .catch(() => {
        // Leave the field editable if the agent endpoint cannot be loaded.
      })

    return () => {
      cancelled = true
    }
  }, [orgId])

  useEffect(() => {
    if (!success && !error) {
      return
    }

    const timer = setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [success, error])

  const errors = useMemo(
    () =>
      getCreateIssuerErrors({
        name,
        description,
        logoLink,
        authorizationServerUrl,
        locales,
      }),
    [authorizationServerUrl, description, locales, logoLink, name],
  )

  const getFieldError = (key: string): string | undefined => {
    if (submitted || touched[key]) {
      return errors[key]
    }
    return undefined
  }

  const markTouched = (key: string): void =>
    setTouched((previous) => ({ ...previous, [key]: true }))

  const addLocale = (): void =>
    setLocales((previous) => [
      ...previous,
      { name: '', description: '', locale: 'fr' },
    ])

  const updateLocale = (
    index: number,
    field: keyof ILocaleEntry,
    value: string,
  ): void =>
    setLocales((previous) =>
      previous.map((entry, entryIndex) => {
        if (entryIndex === index) {
          return { ...entry, [field]: value }
        }
        return entry
      }),
    )

  const removeLocale = (index: number): void =>
    setLocales((previous) =>
      previous.filter((_, entryIndex) => entryIndex !== index),
    )

  const resetForm = (): void => {
    setName('')
    setDescription('')
    setLogoLink('')
    setLocales([])
    setAdvancedOpen(false)
    setTouched({})
    setSubmitted(false)
  }

  const handleSubmit = async (): Promise<void> => {
    setSubmitted(true)
    setError(null)
    setSuccess(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      setLoading(true)

      const fields = {
        name,
        description,
        logoLink,
        authorizationServerUrl,
        locales,
      }
      const payload = buildCreateIssuerPayload(orgName ?? '', fields)
      const response = await createIssuer(orgId, payload)
      const { data } = response as AxiosResponse<ICreateIssuerResponse>

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        dispatch(addIssuer(data.data?.id ?? payload.issuerId))
        setSuccess(data.message ?? 'Issuer created successfully')
        resetForm()
      } else {
        setError(data?.message ?? 'Failed to create issuer')
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Failed to create issuer',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in-up mx-8">
      {(Boolean(error) || Boolean(success)) && (
        <AlertComponent
          message={success ?? error}
          type={success ? 'success' : 'failure'}
          onAlertClose={() => {
            setError(null)
            setSuccess(null)
          }}
        />
      )}
      <Card className="p-8">
        <h2 className="text-2xl font-bold tracking-tight">Create Issuer</h2>
        <p className="text-muted-foreground">Create new issuer for OID4VC</p>
        <div className="space-y-6">
          {/* Name & Logo row */}
          <div className="grid grid-cols-2 items-center gap-6">
            <div className="space-y-2">
              <Label htmlFor="issuer-name" className="text-base font-medium">
                Name
              </Label>
              <Input
                id="issuer-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => markTouched('name')}
                placeholder="Enter issuer name"
              />
              {getFieldError('name') && (
                <p className="text-destructive text-xs font-medium">
                  {getFieldError('name')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer-logo" className="text-base font-medium">
                Logo
              </Label>
              <div className="border-input bg-background flex items-center gap-4 rounded-md border p-3">
                <div className="border-border bg-accent text-muted-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed">
                  <ImageIcon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    id="issuer-logo"
                    value={logoLink}
                    placeholder="https://..."
                    className="h-8 text-xs"
                    onChange={(event) => setLogoLink(event.target.value)}
                    onBlur={() => markTouched('logo')}
                  />
                  {getFieldError('logo') && (
                    <p className="text-destructive text-xs font-medium">
                      {getFieldError('logo')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="issuer-desc" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="issuer-desc"
              value={description}
              placeholder="Enter issuer description"
              rows={4}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => markTouched('description')}
            />
            {getFieldError('description') && (
              <p className="text-destructive text-xs font-medium">
                {getFieldError('description')}
              </p>
            )}
          </div>

          {/* Authorization server URL */}
          <div className="space-y-2">
            <Label
              htmlFor="issuer-authorization-server"
              className="text-base font-medium"
            >
              Authorization server URL
            </Label>
            <Input
              id="issuer-authorization-server"
              value={authorizationServerUrl}
              placeholder="https://agent.example.com"
              onChange={(event) =>
                setAuthorizationServerUrl(event.target.value)
              }
              onBlur={() => markTouched('authorizationServerUrl')}
            />
            <p className="text-muted-foreground text-xs">
              Pre-filled from your organization&apos;s agent endpoint.
            </p>
            {getFieldError('authorizationServerUrl') && (
              <p className="text-destructive text-xs font-medium">
                {getFieldError('authorizationServerUrl')}
              </p>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-foreground text-md flex items-center gap-2 font-bold"
            >
              Advanced Options
              {advancedOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <hr />

            {advancedOpen && (
              <div className="border-border mt-4 space-y-6 rounded-lg border p-4">
                {/* Locales */}
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Add Issuer&apos;s display info in other locales
                  </p>

                  {locales.map((locale, index) => (
                    <div
                      key={`locale-${index}`}
                      className="border-border space-y-3 rounded-md border p-4 shadow"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`locale-${index}-name`}
                            className="text-base font-medium"
                          >
                            Name
                          </Label>
                          <Input
                            id={`locale-${index}-name`}
                            value={locale.name}
                            onChange={(event) =>
                              updateLocale(index, 'name', event.target.value)
                            }
                            onBlur={() => markTouched(`locale-${index}-name`)}
                            className="h-8 text-xs"
                          />
                          {getFieldError(`locale-${index}-name`) && (
                            <p className="text-destructive text-xs font-medium">
                              {getFieldError(`locale-${index}-name`)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`locale-${index}-locale`}
                            className="text-base font-medium"
                          >
                            Locale
                          </Label>
                          <Select
                            value={locale.locale}
                            onValueChange={(value) =>
                              updateLocale(index, 'locale', value)
                            }
                          >
                            <SelectTrigger
                              id={`locale-${index}-locale`}
                              className="h-8 text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(localeOptions).map((label) => (
                                <SelectItem
                                  key={label}
                                  value={localeOptions[label]}
                                >
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {getFieldError(`locale-${index}-locale`) && (
                            <p className="text-destructive text-xs font-medium">
                              {getFieldError(`locale-${index}-locale`)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`locale-${index}-description`}
                          className="text-base font-medium"
                        >
                          Description
                        </Label>
                        <Textarea
                          id={`locale-${index}-description`}
                          value={locale.description}
                          onChange={(event) =>
                            updateLocale(
                              index,
                              'description',
                              event.target.value,
                            )
                          }
                          onBlur={() =>
                            markTouched(`locale-${index}-description`)
                          }
                          rows={2}
                        />
                        {getFieldError(`locale-${index}-description`) && (
                          <p className="text-destructive text-xs font-medium">
                            {getFieldError(`locale-${index}-description`)}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end text-base">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => removeLocale(index)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLocale}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Locale
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader size={20} />}Create Issuer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
