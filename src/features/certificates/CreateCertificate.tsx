'use client'

import { ArrowLeft, Loader2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  KEY_TYPES,
  URL_REGEX_PATTERN,
  apiStatusCodes,
} from '@/config/CommonConstant'
import React, { FormEvent, JSX, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCertificate } from '@/app/api/x509'
import { useAppSelector } from '@/lib/hooks'

interface CreateCertificateProps {
  onCancel: () => void
  onSuccess: (message: string) => void
  onFailure: (message: string) => void
}

const CreateCertificate = ({
  onCancel,
  onSuccess,
  onFailure,
}: CreateCertificateProps): JSX.Element => {
  const [formData, setFormData] = useState({
    type: 'Issuer Root',
    keyType: 'P-256',
    countryCode: 'NL',
    commonName: '',
    alternativeUrl: '',
  })

  const [creating, setCreating] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [countryError, setCountryError] = useState<string | null>(null)

  const orgId = useAppSelector((state) => state?.organization.orgId)
  const URL_REGEX = URL_REGEX_PATTERN

  const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/

  const extractDomainFromUrl = (url: string): string | null => {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()

    setSuccess(null)
    setFailure(null)
    setUrlError(null)
    setCountryError(null)

    // URL validation
    if (!URL_REGEX.test(formData.alternativeUrl)) {
      setUrlError('Enter a valid URL (e.g. https://example.com)')
      return
    }

    // Country code validation
    if (!COUNTRY_CODE_REGEX.test(formData.countryCode)) {
      setCountryError('Country code must be 2 uppercase letters (e.g. US, IN)')
      return
    }

    const domain = extractDomainFromUrl(formData.alternativeUrl)
    if (!domain) {
      setUrlError('Unable to extract domain from URL')
      return
    }

    setCreating(true)

    const keyType =
      formData.keyType === KEY_TYPES.P_256 ? KEY_TYPES.P256 : KEY_TYPES.ED25519
    const now = new Date()
    const notBefore = new Date(now)
    const notAfter = new Date(now)
    notAfter.setFullYear(notAfter.getFullYear() + 1)

    const payload = {
      authorityKey: {
        keyType,
      },
      issuer: {
        countryName: formData.countryCode,
        commonName: formData.commonName,
      },
      validity: {
        notBefore: notBefore.toISOString(),
        notAfter: notAfter.toISOString(),
      },
      extensions: {
        keyUsage: {
          usages: [1, 4, 64],
          markAsCritical: true,
        },
        extendedKeyUsage: {
          usages: ['1.0.18013.5.1.2'],
          markAsCritical: true,
        },
        authorityKeyIdentifier: {
          include: true,
          markAsCritical: true,
        },
        subjectKeyIdentifier: {
          include: true,
          markAsCritical: true,
        },
        issuerAlternativeName: {
          name: [
            { type: 'dns', value: domain },
            { type: 'url', value: formData.alternativeUrl },
          ],
          markAsCritical: true,
        },
        subjectAlternativeName: {
          name: [
            { type: 'dns', value: domain },
            { type: 'url', value: formData.alternativeUrl },
          ],
          markAsCritical: true,
        },
        basicConstraints: {
          ca: true,
          pathLenConstraint: 0,
          markAsCritical: true,
        },
      },
    }

    try {
      const response = await createCertificate(orgId || '', payload)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const message = data?.message as string
        setSuccess(message)
        setFormData({
          type: 'Issuer Root',
          keyType: 'P-256',
          countryCode: 'NL',
          commonName: '',
          alternativeUrl: '',
        })

        setTimeout(() => {
          onSuccess(message)
        }, 1500)
      } else {
        const errorMessage = data?.message as string
        setFailure(errorMessage)
        onFailure(errorMessage)
      }
    } catch {
      const errorMessage = 'An unexpected error occurred'
      setFailure(errorMessage)
      setSuccess(null)
      onFailure(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = (): void => {
    setFormData({
      type: 'Issuer Root',
      keyType: 'P-256',
      countryCode: 'NL',
      commonName: '',
      alternativeUrl: '',
    })
    setSuccess(null)
    setFailure(null)
    onCancel()
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
              Create Certificate
            </h2>
            <p className="text-muted-foreground mt-1">
              Configure and generate a new X.509 certificate
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
            Certificates list
          </Button>
        </div>

        {success && (
          <div
            className="animate-in fade-in slide-in-from-top-2 mb-6 w-full duration-300"
            role="alert"
          >
            <AlertComponent
              message={success}
              type="success"
              onAlertClose={() => setSuccess(null)}
            />
          </div>
        )}

        {failure && (
          <div
            className="animate-in fade-in slide-in-from-top-2 mb-6 w-full duration-300"
            role="alert"
          >
            <AlertComponent
              message={failure}
              type="failure"
              onAlertClose={() => setFailure(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Certificate Type</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Choose the type of certificate you want to create. Root
                  certificates are used to establish trust chains.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Certificate Details</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Provide the necessary information for certificate generation.
                  All required fields must be completed.
                </p>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="bg-card space-y-6 rounded-lg border p-6">
                <div className="space-y-3">
                  <Label htmlFor="keyType" className="text-base font-medium">
                    Key Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.keyType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, keyType: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select key algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P-256">{KEY_TYPES.P_256}</SelectItem>
                      <SelectItem value="Ed25519">
                        {KEY_TYPES.ED25519}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    The cryptographic algorithm used for key generation
                  </p>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="countryCode"
                    className="text-base font-medium"
                  >
                    Country Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="countryCode"
                    className="h-11 uppercase"
                    placeholder="US"
                    maxLength={2}
                    value={formData.countryCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countryCode: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  {countryError && (
                    <p className="text-destructive text-xs">{countryError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="commonName" className="text-base font-medium">
                    Common Name
                  </Label>
                  <Input
                    id="commonName"
                    className="h-11"
                    placeholder="e.g., My Organization CA"
                    value={formData.commonName}
                    onChange={(e) =>
                      setFormData({ ...formData, commonName: e.target.value })
                    }
                  />
                  <p className="text-muted-foreground text-xs">
                    The name that identifies this certificate
                  </p>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="alternativeUrl"
                    className="text-base font-medium"
                  >
                    Alternative URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="alternativeUrl"
                    className="h-11"
                    placeholder="https://example.com"
                    value={formData.alternativeUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        alternativeUrl: e.target.value,
                      })
                    }
                  />
                  {urlError && (
                    <p className="text-destructive text-xs">{urlError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handleCancel}
              disabled={creating}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px] gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Certificate</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateCertificate
