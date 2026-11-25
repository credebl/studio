'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IApiResponse,
  ICreateOfferPayload,
  ICreateOfferResponseData,
  ICredentialRequest,
  ITemplate,
} from '@/app/oid4vc/interface/interface'
import { JSX, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getErrorMessage,
  isSuccessStatus,
  parseJsonObject,
} from '@/features/oid4vc/utils/lifecycle'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createCredentialOffer } from '@/app/api/oid4vc'

interface CredentialRow {
  templateId: string
  payload: string
  validFrom: string
  validUntil: string
}

interface OfferFormDialogProps {
  open: boolean
  orgId: string
  issuerId: string
  templates: ITemplate[]
  onClose: () => void
  onSaved: (message: string, credentialOfferUri?: string) => void
}

const emptyRow = (templateId = ''): CredentialRow => ({
  templateId,
  payload: '{}',
  validFrom: '',
  validUntil: '',
})

export default function OfferFormDialog({
  open,
  orgId,
  issuerId,
  templates,
  onClose,
  onSaved,
}: OfferFormDialogProps): JSX.Element {
  const [rows, setRows] = useState<CredentialRow[]>([emptyRow()])
  const [authorizationType, setAuthorizationType] = useState<
    'preAuthorizedCodeFlow' | 'authorizationCodeFlow'
  >('preAuthorizedCodeFlow')
  const [noticeUrl, setNoticeUrl] = useState('')
  const [isRevocable, setIsRevocable] = useState(false)
  const [credentialVersion, setCredentialVersion] = useState<'v1.0' | 'v2.0'>(
    'v1.0',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setRows([emptyRow(templates[0]?.id ?? '')])
    setAuthorizationType('preAuthorizedCodeFlow')
    setNoticeUrl('')
    setIsRevocable(false)
    setCredentialVersion('v1.0')
    setError(null)
    setSubmitted(false)
  }, [open, templates])

  const updateRow = (index: number, patch: Partial<CredentialRow>): void =>
    setRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex === index) {
          return { ...row, ...patch }
        }
        return row
      }),
    )

  const validate = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {}

    if (rows.length === 0) {
      validationErrors.rows = 'Add at least one credential'
    }

    rows.forEach((row, index) => {
      if (!row.templateId) {
        validationErrors[`template-${index}`] = 'Select a template'
      }

      const parsed = parseJsonObject(
        row.payload,
        `Credential ${index + 1} payload`,
      )
      if (parsed.error) {
        validationErrors[`payload-${index}`] = parsed.error
      }

      if (
        (row.validFrom && !row.validUntil) ||
        (!row.validFrom && row.validUntil)
      ) {
        validationErrors[`validity-${index}`] =
          'Provide both valid from and valid until dates'
      }
    })

    if (noticeUrl.trim()) {
      try {
        const { protocol } = new URL(noticeUrl.trim())
        if (protocol !== 'http:' && protocol !== 'https:') {
          validationErrors.noticeUrl = 'Please enter a valid URL'
        }
      } catch {
        validationErrors.noticeUrl = 'Please enter a valid URL'
      }
    }

    return validationErrors
  }

  const errors = submitted ? validate() : {}
  const getError = (key: string): string | undefined => errors[key]

  const handleSubmit = async (): Promise<void> => {
    setSubmitted(true)
    setError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      setLoading(true)

      const credentials: ICredentialRequest[] = rows.map((row) => {
        const parsed = parseJsonObject(row.payload, 'Credential payload')
          .data as Record<string, unknown> | undefined

        const credential: ICredentialRequest = {
          templateId: row.templateId,
          payload: parsed ?? {},
        }

        if (row.validFrom && row.validUntil) {
          credential.validityInfo = {
            validFrom: new Date(row.validFrom).toISOString(),
            validUntil: new Date(row.validUntil).toISOString(),
          }
        }

        return credential
      })

      const payload: ICreateOfferPayload = {
        credentials,
        authorizationType,
        credentialVersion,
        isRevocable,
        noticeUrl: noticeUrl.trim() || undefined,
      }

      const response = (await createCredentialOffer(
        orgId,
        issuerId,
        payload,
      )) as AxiosResponse<IApiResponse<unknown>>

      if (!isSuccessStatus(response.status, [200, 201])) {
        throw new Error(
          response.data?.message ?? 'Failed to create credential offer',
        )
      }

      const data = response.data?.data as ICreateOfferResponseData | undefined
      onSaved(
        response.data?.message ?? 'Credential offer created',
        data?.issuanceSession?.credentialOfferUri ?? data?.credentialOffer,
      )
    } catch (caught) {
      setError(getErrorMessage(caught, 'Failed to create credential offer'))
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
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create credential offer</DialogTitle>
        </DialogHeader>

        {error && (
          <AlertComponent
            message={error}
            type="failure"
            onAlertClose={() => setError(null)}
          />
        )}

        {templates.length === 0 && (
          <AlertComponent
            message="Create at least one credential template for this issuer before creating an offer."
            type="warning"
            onAlertClose={() => undefined}
          />
        )}

        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Credentials</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setRows((previous) => [
                    ...previous,
                    emptyRow(templates[0]?.id ?? ''),
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add credential
              </Button>
            </div>

            {getError('rows') && (
              <p className="text-destructive text-xs">{getError('rows')}</p>
            )}

            {rows.map((row, index) => (
              <div
                key={`credential-${index}`}
                className="space-y-3 rounded-md border p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`offer-template-${index}`}>Template</Label>
                    <Select
                      value={row.templateId}
                      onValueChange={(value) =>
                        updateRow(index, { templateId: value })
                      }
                    >
                      <SelectTrigger id={`offer-template-${index}`}>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.format})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getError(`template-${index}`) && (
                      <p className="text-destructive text-xs">
                        {getError(`template-${index}`)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end justify-end">
                    {rows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive gap-1.5"
                        onClick={() =>
                          setRows((previous) =>
                            previous.filter(
                              (_, rowIndex) => rowIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`offer-payload-${index}`}>
                    Claims payload (JSON)
                  </Label>
                  <Textarea
                    id={`offer-payload-${index}`}
                    value={row.payload}
                    rows={5}
                    className="font-mono text-xs"
                    onChange={(event) =>
                      updateRow(index, { payload: event.target.value })
                    }
                  />
                  {getError(`payload-${index}`) && (
                    <p className="text-destructive text-xs">
                      {getError(`payload-${index}`)}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`offer-valid-from-${index}`}>
                      Valid from (optional)
                    </Label>
                    <Input
                      id={`offer-valid-from-${index}`}
                      type="datetime-local"
                      value={row.validFrom}
                      onChange={(event) =>
                        updateRow(index, { validFrom: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`offer-valid-until-${index}`}>
                      Valid until (optional)
                    </Label>
                    <Input
                      id={`offer-valid-until-${index}`}
                      type="datetime-local"
                      value={row.validUntil}
                      onChange={(event) =>
                        updateRow(index, { validUntil: event.target.value })
                      }
                    />
                  </div>
                </div>
                {getError(`validity-${index}`) && (
                  <p className="text-destructive text-xs">
                    {getError(`validity-${index}`)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offer-auth-type">Authorization type</Label>
              <Select
                value={authorizationType}
                onValueChange={(value) =>
                  setAuthorizationType(
                    value as 'preAuthorizedCodeFlow' | 'authorizationCodeFlow',
                  )
                }
              >
                <SelectTrigger id="offer-auth-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preAuthorizedCodeFlow">
                    Pre-authorized code
                  </SelectItem>
                  <SelectItem value="authorizationCodeFlow">
                    Authorization code
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-version">Credential version</Label>
              <Select
                value={credentialVersion}
                onValueChange={(value) =>
                  setCredentialVersion(value as 'v1.0' | 'v2.0')
                }
              >
                <SelectTrigger id="offer-version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1.0">v1.0</SelectItem>
                  <SelectItem value="v2.0">v2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-notice-url">Notice URL (optional)</Label>
            <Input
              id="offer-notice-url"
              value={noticeUrl}
              placeholder="https://example.com/notice"
              onChange={(event) => setNoticeUrl(event.target.value)}
            />
            {getError('noticeUrl') && (
              <p className="text-destructive text-xs">
                {getError('noticeUrl')}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="offer-revocable">Allow revocation</Label>
            <Switch
              id="offer-revocable"
              checked={isRevocable}
              onCheckedChange={setIsRevocable}
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || templates.length === 0}
            >
              {loading && <Loader size={16} />}
              Create offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
