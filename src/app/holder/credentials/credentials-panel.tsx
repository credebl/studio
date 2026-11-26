'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  HolderActionResult,
  HolderCredential,
  HolderCredentialFormat,
} from '@/features/holder/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { decodeCredentialAction, deleteCredentialAction } from '../actions'
import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormStatus } from '@/features/holder/components/form-status'
import { JsonPanel } from '@/features/holder/components/json-panel'
import { summarizeCredential } from '@/features/holder/credential-details'

interface CredentialsPanelProps {
  credentials: {
    sdJwt: HolderCredential[]
    mdoc: HolderCredential[]
    w3c: HolderCredential[]
  }
}

const tabs: {
  value: HolderCredentialFormat
  label: string
  description: string
}[] = [
  {
    value: 'sd-jwt-vc',
    label: 'SD-JWT',
    description: 'Selectively disclosable JWT credentials.',
  },
  {
    value: 'mso_mdoc',
    label: 'mDoc',
    description: 'ISO mobile documents.',
  },
  {
    value: 'w3c-vc',
    label: 'W3C VC',
    description: 'W3C Verifiable Credentials.',
  },
]

const DetailItem = ({
  label,
  value,
}: {
  label: string
  value: string
}): React.JSX.Element => (
  <div className="min-w-0 space-y-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="text-sm font-medium break-words">{value}</dd>
  </div>
)

export function CredentialsPanel({
  credentials,
}: CredentialsPanelProps): React.JSX.Element {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<HolderActionResult<unknown> | null>(null)
  const [decoded, setDecoded] = useState<Record<string, unknown>>({})

  const handleDecode = (credential: HolderCredential, key: string): void => {
    if (!credential.encoded) {
      setStatus({
        status: 'error',
        message: 'This credential cannot be decoded from the stored data.',
      })
      return
    }
    startTransition(async () => {
      const result = await decodeCredentialAction(
        credential.format,
        credential.encoded as string,
      )
      setStatus(result)
      if (result.status === 'success') {
        setDecoded((current) => ({ ...current, [key]: result.data }))
      }
    })
  }

  const handleDelete = (credential: HolderCredential): void => {
    if (
      !window.confirm(
        `Delete "${credential.title}" from your wallet? This cannot be undone.`,
      )
    ) {
      return
    }
    startTransition(async () => {
      setStatus(await deleteCredentialAction(credential.format, credential.id))
    })
  }

  const renderList = (items: HolderCredential[]): React.JSX.Element => {
    if (items.length === 0) {
      return (
        <p className="text-muted-foreground py-10 text-center text-sm">
          No credentials of this type yet. Redeem an offer to add one.
        </p>
      )
    }

    return (
      <div className="grid gap-3">
        {items.map((credential, index) => {
          const key = credential.id || `${credential.format}-${index}`
          const summary = summarizeCredential(credential)
          return (
            <Card key={key}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {credential.title}
                  </CardTitle>
                  <CardDescription>
                    {credential.issuer
                      ? `Issuer: ${credential.issuer}`
                      : 'Issuer information not provided'}
                  </CardDescription>
                </div>
                <Badge variant="outline">{credential.format}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {credential.encoded && credential.format !== 'w3c-vc' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleDecode(credential, key)}
                    >
                      Decode
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending || !credential.id}
                    onClick={() => handleDelete(credential)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-y-3 rounded-md border p-3">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Credential details
                  </p>
                  <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                    {summary.metadata.map((detail) => (
                      <DetailItem
                        key={detail.label}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                  </dl>
                  {summary.claims.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Credential claims
                      </p>
                      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                        {summary.claims.map((claim) => (
                          <DetailItem
                            key={claim.label}
                            label={claim.label}
                            value={claim.value}
                          />
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
                <JsonPanel value={credential.raw} label="Stored credential" />
                {decoded[key] ? (
                  <JsonPanel value={decoded[key]} label="Decoded credential" />
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Credential vault</h2>
        <p className="text-muted-foreground text-sm">
          Credentials held in your personal wallet, grouped by format.
        </p>
      </div>

      <FormStatus state={status} />

      <Tabs defaultValue="sd-jwt-vc">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} (
              {
                credentials[
                  tab.value === 'sd-jwt-vc'
                    ? 'sdJwt'
                    : tab.value === 'mso_mdoc'
                      ? 'mdoc'
                      : 'w3c'
                ].length
              }
              )
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-4 space-y-3"
          >
            <p className="text-muted-foreground text-sm">{tab.description}</p>
            {renderList(
              credentials[
                tab.value === 'sd-jwt-vc'
                  ? 'sdJwt'
                  : tab.value === 'mso_mdoc'
                    ? 'mdoc'
                    : 'w3c'
              ],
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
