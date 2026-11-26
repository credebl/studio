'use client'

import {
  AttributeEditor,
  NamespaceEditor,
} from '@/features/oid4vc/components/TemplateAttributeEditor'
import {
  CredentialFormat,
  IApiResponse,
  ITemplate,
  SignerOption,
} from '@/app/oid4vc/interface/interface'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JSX, useEffect, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TemplateFormState,
  buildTemplatePayload,
  getErrorMessage,
  getTemplateErrors,
  isSuccessStatus,
  templateToFormState,
} from '@/features/oid4vc/utils/lifecycle'
import { createTemplate, updateTemplate } from '@/app/api/oid4vc'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface TemplateFormDialogProps {
  open: boolean
  orgId: string
  issuerId: string
  template?: ITemplate
  onClose: () => void
  onSaved: (templateId: string, message: string) => void
}

const formats: { value: CredentialFormat; label: string }[] = [
  { value: 'dc+sd-jwt', label: 'SD-JWT VC (dc+sd-jwt)' },
  { value: 'mso_mdoc', label: 'ISO mdoc (mso_mdoc)' },
  { value: 'jwt_vc_json-ld', label: 'JWT VC JSON-LD' },
  { value: 'ldp_vc', label: 'Linked data proof VC' },
]

const signerOptions: SignerOption[] = ['DID', 'X509_P256', 'X509_ED25519']

export default function TemplateFormDialog({
  open,
  orgId,
  issuerId,
  template,
  onClose,
  onSaved,
}: TemplateFormDialogProps): JSX.Element {
  const [state, setState] = useState<TemplateFormState>(() =>
    templateToFormState(template),
  )
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setState(templateToFormState(template))
    setTouched({})
    setSubmitted(false)
    setError(null)
  }, [open, template])

  const errors = useMemo(() => getTemplateErrors(state), [state])
  const availableSignerOptions =
    state.format === 'mso_mdoc'
      ? signerOptions.filter((option) => option !== 'DID')
      : signerOptions

  const getFieldError = (key: string): string | undefined => {
    if (submitted || touched[key]) {
      return errors[key]
    }
    return undefined
  }

  const setField = <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ): void => setState((previous) => ({ ...previous, [key]: value }))

  const markTouched = (key: string): void =>
    setTouched((previous) => ({ ...previous, [key]: true }))

  const handleFormatChange = (format: CredentialFormat): void => {
    setState((previous) => ({
      ...previous,
      format,
      signerOption:
        format === 'mso_mdoc' && previous.signerOption === 'DID'
          ? 'X509_P256'
          : previous.signerOption,
    }))
  }

  const handleSubmit = async (): Promise<void> => {
    setSubmitted(true)
    setError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      setLoading(true)
      const payload = buildTemplatePayload(state)
      const response = template
        ? ((await updateTemplate(
            orgId,
            issuerId,
            template.id,
            payload,
          )) as AxiosResponse<IApiResponse<ITemplate>>)
        : ((await createTemplate(orgId, issuerId, payload)) as AxiosResponse<
            IApiResponse<ITemplate>
          >)

      if (!isSuccessStatus(response.status, [200, 201])) {
        throw new Error(
          response.data?.message ??
            `Failed to ${template ? 'update' : 'create'} template`,
        )
      }

      onSaved(
        response.data?.data?.id ?? template?.id ?? state.name,
        response.data?.message ??
          `Template ${template ? 'updated' : 'created'}`,
      )
    } catch (caught) {
      setError(getErrorMessage(caught, 'Failed to save template'))
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
      <DialogContent className="max-h-[88vh] max-w-[min(calc(100vw_-_2rem),96rem)]! overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template
              ? 'Edit credential template'
              : 'Create credential template'}
          </DialogTitle>
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
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={state.name}
                placeholder="University Degree"
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
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={state.description}
                placeholder="Optional description"
                onChange={(event) =>
                  setField('description', event.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-format">Credential format</Label>
              <Select
                value={state.format}
                onValueChange={(value) =>
                  handleFormatChange(value as CredentialFormat)
                }
              >
                <SelectTrigger id="template-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-signer">Signer option</Label>
              <Select
                value={state.signerOption}
                onValueChange={(value) =>
                  setField('signerOption', value as SignerOption)
                }
              >
                <SelectTrigger id="template-signer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSignerOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.format === 'mso_mdoc' && (
                <p className="text-muted-foreground text-xs">
                  mdoc templates require an X.509 signer.
                </p>
              )}
            </div>
          </div>

          {state.format === 'mso_mdoc' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-doctype">Document type</Label>
                <Input
                  id="template-doctype"
                  value={state.doctype}
                  placeholder="org.iso.18013.5.1.mDL"
                  onChange={(event) => setField('doctype', event.target.value)}
                  onBlur={() => markTouched('doctype')}
                />
                {getFieldError('doctype') && (
                  <p className="text-destructive text-xs">
                    {getFieldError('doctype')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Namespaces and attributes</p>
                <NamespaceEditor
                  namespaces={state.namespaces}
                  errors={errors}
                  onChange={(namespaces) => setField('namespaces', namespaces)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template-vct">Credential type (vct)</Label>
                  <Input
                    id="template-vct"
                    value={state.vct}
                    placeholder="UniversityDegreeCredential-sdjwt"
                    onChange={(event) => setField('vct', event.target.value)}
                    onBlur={() => markTouched('vct')}
                  />
                  {getFieldError('vct') && (
                    <p className="text-destructive text-xs">
                      {getFieldError('vct')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-schema-url">
                    Schema URL (optional)
                  </Label>
                  <Input
                    id="template-schema-url"
                    value={state.schemaUrl}
                    placeholder="https://example.com/schema"
                    onChange={(event) =>
                      setField('schemaUrl', event.target.value)
                    }
                    onBlur={() => markTouched('schemaUrl')}
                  />
                  {getFieldError('schemaUrl') && (
                    <p className="text-destructive text-xs">
                      {getFieldError('schemaUrl')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Attributes</p>
                <AttributeEditor
                  idPrefix="template-attribute"
                  attributes={state.attributes}
                  missingAttributeError={getFieldError('attributes')}
                  onChange={(attributes) => setField('attributes', attributes)}
                />
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-md border p-4">
            <p className="text-sm font-medium">Appearance and behavior</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-appearance-name">
                  Display name (optional)
                </Label>
                <Input
                  id="template-appearance-name"
                  value={state.appearanceName}
                  placeholder="Defaults to template name"
                  onChange={(event) =>
                    setField('appearanceName', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-appearance-logo">Logo URL</Label>
                <Input
                  id="template-appearance-logo"
                  value={state.appearanceLogo}
                  placeholder="https://example.com/logo.svg"
                  onChange={(event) =>
                    setField('appearanceLogo', event.target.value)
                  }
                  onBlur={() => markTouched('appearanceLogo')}
                />
                {getFieldError('appearanceLogo') && (
                  <p className="text-destructive text-xs">
                    {getFieldError('appearanceLogo')}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-appearance-description">
                Display description
              </Label>
              <Textarea
                id="template-appearance-description"
                value={state.appearanceDescription}
                rows={2}
                onChange={(event) =>
                  setField('appearanceDescription', event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-notice-url">Notice URL (optional)</Label>
              <Input
                id="template-notice-url"
                value={state.noticeUrl}
                placeholder="https://example.com/notice"
                onChange={(event) => setField('noticeUrl', event.target.value)}
                onBlur={() => markTouched('noticeUrl')}
              />
              {getFieldError('noticeUrl') && (
                <p className="text-destructive text-xs">
                  {getFieldError('noticeUrl')}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="template-revocable">
                Credentials can be revoked
              </Label>
              <Switch
                id="template-revocable"
                checked={state.canBeRevoked}
                onCheckedChange={(checked) => setField('canBeRevoked', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader size={16} />}
              {template ? 'Save changes' : 'Create template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
