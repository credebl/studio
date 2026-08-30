'use client'

import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { JSX, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IDisplayItem } from '@/app/oid4vc/interface/interface'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Textarea } from '@/components/ui/textarea'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createIssuer } from '@/app/api/oid4vc'
import { useAppSelector } from '@/lib/hooks'

interface LocaleEntry {
  name: string
  description: string
  locale: string
}

export default function CreateIssuer(): JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoLink, setLogoLink] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [locales, setLocales] = useState<LocaleEntry[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const orgId = useAppSelector((state) => state.organization.orgId)
  const orgName = useAppSelector((state) => state.organization.orgInfo?.name)
  const localesSelection: Record<string, string> = {
    Fr: 'fr',
    De: 'de',
    Es: 'es',
  }

  useEffect(() => {
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 3000)
  }, [success, error])

  const addLocale = (): void =>
    setLocales((prev) => [...prev, { name: '', description: '', locale: 'fr' }])

  const updateLocale = (
    index: number,
    field: keyof LocaleEntry,
    value: string,
  ): void =>
    setLocales((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    )

  const removeLocale = (index: number): void =>
    setLocales((prev) => prev.filter((_, i) => i !== index))

  const validate = (fieldName?: string): boolean => {
    const newErrors = { ...errors }

    const check = (key: string, condition: boolean, message: string): void => {
      if (condition) {
        newErrors[key] = message
      } else {
        delete newErrors[key]
      }
    }

    if (!fieldName || fieldName === 'name') {
      check('name', !name.trim(), 'Name is required')
    }

    if (!fieldName || fieldName === 'description') {
      check('description', !description.trim(), 'Description is required')
    }

    if (!fieldName || fieldName === 'logo') {
      check('logo', !logoLink.trim(), 'Logo link is required')

      const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i
      check(
        'serverUrl',
        logoLink !== '' && !urlPattern.test(logoLink),
        'Please enter a valid URL',
      )
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateIssuerKey = (orgName: string, issuerName: string): string => {
    const getShortCode = (str: string): string => {
      const words = str.trim().split(/\s+/)
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toLowerCase()
      }
      return str.substring(0, 2).toLowerCase()
    }

    const orgPart = getShortCode(orgName)
    const issuerPart = getShortCode(issuerName)

    const suffix = Math.random().toString(36).substring(2, 6)

    return `${orgPart}-${issuerPart}-${suffix}`
  }

  const handleSubmit = async (): Promise<void> => {
    if (validate()) {
      try {
        setLoading(true)

        const logo = {
          uri: logoLink,
          // eslint-disable-next-line camelcase
          alt_text: 'Issuer logo',
        }
        const formattedLocales = locales.map((value) => ({ ...value, logo }))
        let display = [
          {
            locale: 'en',
            name,
            description,
            logo,
          },
        ]
        if (formattedLocales.length > 0) {
          display = [...display, ...formattedLocales]
        }
        const seen: Record<string, boolean> = {}
        const uniqueData = display.reduce<IDisplayItem[]>((acc, current) => {
          if (!seen[current.locale]) {
            seen[current.locale] = true
            acc.push(current)
          }
          return acc
        }, [])
        const payload = {
          issuerId: `${generateIssuerKey(orgName || '', name)}-jwt-issuer`,
          display: uniqueData,
        }
        const res = await createIssuer(orgId, payload)
        const { data } = res as AxiosResponse
        if (data && data.statusCode === apiStatusCodes.API_STATUS_CREATED) {
          setSuccess('Issuer created successfully')
        }
      } catch (error) {
        setError('Failed to create Issuer')
        console.error('Failed to submit form', error)
      } finally {
        setLoading(false)
      }
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
                className={errors.name ? 'border-destructive' : ''}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) {
                    setErrors({ ...errors, name: '' })
                  } // Clear error on type
                }}
                onBlur={() => {
                  setTouched({ ...touched, name: true })
                  validate('name')
                }}
                placeholder="Enter issuer name"
              />
              {touched.name && errors.name && (
                <p className="text-destructive text-xs font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Logo</Label>
              <div className="border-input bg-background flex items-center gap-4 rounded-md border p-3">
                <div className="border-border bg-accent text-muted-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed text-xs">
                  {logoLink ? (
                    <img
                      src={logoLink}
                      alt="Logo preview"
                      className="h-full w-full rounded-md object-cover"
                    />
                  ) : (
                    'Logo'
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  {/* <p className="text-muted-foreground text-xs">or link</p> */}
                  <Input
                    value={logoLink}
                    placeholder="https://..."
                    className="h-8 text-xs"
                    onChange={(e) => {
                      setLogoLink(e.target.value)
                      if (errors.name) {
                        setErrors({ ...errors, logo: '' })
                      }
                    }}
                    onBlur={() => {
                      setTouched({ ...touched, logo: true })
                      validate('logo')
                    }}
                  />
                  {touched.logo && errors.logo && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.logo}
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
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  setErrors({ ...errors, description: '' })
                }
              }}
              onBlur={() => {
                setTouched({ ...touched, description: true })
                validate('description')
              }}
            />
            {touched.description && errors.description && (
              <p className="text-destructive text-xs font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
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
            <hr className="my-2"></hr>

            {advancedOpen && (
              <div className="border-border mt-4 space-y-6 rounded-lg border p-4">
                {/* Locales */}
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Add Issuer&apos;s display info in other locales
                  </p>

                  {locales.map((locale, i) => (
                    <div
                      key={i}
                      className="border-border space-y-3 rounded-md border p-4 shadow"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Name</Label>
                          <Input
                            value={locale.name}
                            onChange={(e) =>
                              updateLocale(i, 'name', e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="text-base font-medium">
                          <Label className="text-base font-medium">
                            Locale
                          </Label>
                          <Select
                            value={locale.locale}
                            onValueChange={(v) => updateLocale(i, 'locale', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(localesSelection).map((value) => (
                                <SelectItem
                                  key={value}
                                  value={`${localesSelection[value]}`}
                                >
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="text-base font-medium">
                        <Label className="text-base font-medium">
                          Description
                        </Label>
                        <Textarea
                          value={locale.description}
                          onChange={(e) =>
                            updateLocale(i, 'description', e.target.value)
                          }
                          className="text-base font-medium"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end text-base">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => removeLocale(i)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
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
            <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
              {loading && <Loader size={20} />}Create Issuer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
