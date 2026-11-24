'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { CopyValue, Detail, StatusPill } from './DetailParts'
import {
  DidResolveSource,
  IDidDetails,
  IDidResolution,
} from '@/features/organization/components/interfaces/organization'
import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { didWebToUrl, getDidMethod } from '@/lib/did'
import { getDidDetails, resolveDid } from '@/app/api/Agent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import DidDocumentView from './DidDocumentView'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { cn } from '@/lib/utils'
import { dateConversion } from '@/utils/DateConversion'

interface DidDetailsPanelProps {
  orgId: string
  /** The DID to show; the panel is open while this is set. */
  did: string | null
  onOpenChange: (open: boolean) => void
}

const JsonBlock = ({
  title,
  value,
}: {
  title: string
  value: unknown
}): React.JSX.Element => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold">{title}</h4>
    <pre className="bg-muted max-h-72 overflow-auto rounded-md p-3 text-xs">
      <code>{JSON.stringify(value, undefined, 2)}</code>
    </pre>
  </div>
)

const SOURCE_OPTIONS: {
  value: DidResolveSource
  label: string
  hint: string
}[] = [
  {
    value: 'local',
    label: 'Agent record',
    hint: 'What the wallet agent holds for this DID.',
  },
  {
    value: 'network',
    label: 'Hosted address',
    hint: 'What anyone else gets when they resolve this DID over HTTPS.',
  },
]

type ResolveState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; result: IDidResolution }

const ResolveTab = ({
  orgId,
  did,
}: {
  orgId: string
  did: string
}): React.JSX.Element => {
  const isWeb = getDidMethod(did) === 'web'
  const [source, setSource] = useState<DidResolveSource>('local')
  const [state, setState] = useState<ResolveState>({ status: 'idle' })

  const resolve = async (): Promise<void> => {
    setState({ status: 'loading' })
    const response = await resolveDid(orgId, did, source)
    if (typeof response === 'string') {
      setState({ status: 'error', message: response })
      return
    }
    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setState({ status: 'done', result: data.data as IDidResolution })
    } else {
      setState({
        status: 'error',
        message: data?.message || 'Unable to resolve this DID.',
      })
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">
        Resolve the DID to see the document it currently resolves to and whether
        it matches the document stored for this organization.
      </p>

      {isWeb && (
        <div
          role="radiogroup"
          aria-label="Resolve from"
          className="bg-muted flex gap-1 rounded-lg p-1"
        >
          {SOURCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={source === option.value}
              title={option.hint}
              onClick={() => {
                setSource(option.value)
                setState({ status: 'idle' })
              }}
              className={cn(
                'focus-visible:ring-ring flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                source === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {isWeb && (
        <p className="text-muted-foreground text-xs">
          {SOURCE_OPTIONS.find((option) => option.value === source)?.hint}
        </p>
      )}

      <Button onClick={resolve} disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'Resolving…' : 'Resolve'}
      </Button>

      {state.status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription className="break-words">
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      {state.status === 'done' && (
        <div className="space-y-4">
          <StatusPill tone={state.result.matchesStored ? 'good' : 'warn'}>
            {state.result.matchesStored
              ? 'Matches the stored document'
              : 'Differs from the stored document'}
          </StatusPill>
          {state.result.didResolutionMetadata && (
            <JsonBlock
              title="Resolution metadata"
              value={state.result.didResolutionMetadata}
            />
          )}
          <JsonBlock
            title="Resolved document"
            value={state.result.didDocument}
          />
        </div>
      )}
    </div>
  )
}

const UsageRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}): React.JSX.Element => (
  <div className="flex justify-between gap-4 py-1.5">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-medium">{value}</dd>
  </div>
)

const OverviewTab = ({
  details,
}: {
  details: IDidDetails
}): React.JSX.Element => {
  const hostedUrl = didWebToUrl(details.did)
  const { usage, deletion } = details

  let statusPill = <StatusPill tone="neutral">Active</StatusPill>
  if (details.isArchived) {
    statusPill = <StatusPill tone="warn">Archived</StatusPill>
  } else if (details.isPrimaryDid) {
    statusPill = <StatusPill tone="good">Primary</StatusPill>
  }

  return (
    <div className="space-y-6">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Detail label="DID" wide>
          <CopyValue value={details.did} />
        </Detail>
        <Detail label="Method">did:{details.method}</Detail>
        <Detail label="Status">{statusPill}</Detail>
        <Detail label="Created">
          {dateConversion(details.createDateTime)}
        </Detail>
        <Detail label="Last changed">
          {dateConversion(details.lastChangedDateTime)}
        </Detail>
        {hostedUrl && (
          <Detail label="Hosted at" wide>
            <CopyValue value={hostedUrl} />
          </Detail>
        )}
      </dl>

      <section className="space-y-2">
        <h3 className="text-base font-semibold">Usage</h3>
        <dl className="divide-y rounded-md border px-3 text-sm">
          <UsageRow
            label="Has been the primary DID"
            value={usage.wasPrimary ? 'Yes' : 'No'}
          />
          <UsageRow label="Schemas published" value={usage.schemas} />
          <UsageRow label="Status lists" value={usage.statusLists} />
          <UsageRow
            label="Holder notifications"
            value={usage.holderNotifications}
          />
          <UsageRow label="Connection invitations" value={usage.invitations} />
        </dl>
      </section>

      <section className="space-y-2 text-sm">
        <h3 className="text-base font-semibold">Deleting this DID</h3>
        {deletion.allowed ? (
          <p className="text-muted-foreground">
            This DID has never been the primary DID and nothing refers to it, so
            it can be deleted.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">This DID cannot be deleted:</p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-5">
              {deletion.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            {!details.isPrimaryDid && !details.isArchived && (
              <p className="text-muted-foreground">
                You can archive it instead to stop it from being used.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}

const DidDetailsBody = ({
  orgId,
  did,
}: {
  orgId: string
  did: string
}): React.JSX.Element => {
  const [details, setDetails] = useState<IDidDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async (): Promise<void> => {
      const response = await getDidDetails(orgId, did)
      if (cancelled) {
        return
      }
      if (typeof response === 'string') {
        setError(response)
        return
      }
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setDetails(data.data as IDidDetails)
      } else {
        setError(data?.message || 'Unable to load the DID details.')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgId, did])

  if (error) {
    return (
      <div className="px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  if (!details) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    )
  }

  return (
    <Tabs defaultValue="overview" className="min-h-0 flex-1 px-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="document">Document</TabsTrigger>
        <TabsTrigger value="resolve">Resolve</TabsTrigger>
      </TabsList>
      <div className="overflow-y-auto pt-4 pb-6">
        <TabsContent value="overview">
          <OverviewTab details={details} />
        </TabsContent>
        <TabsContent value="document">
          <DidDocumentView
            did={details.did}
            didDocument={details.didDocument}
          />
        </TabsContent>
        <TabsContent value="resolve">
          <ResolveTab orgId={orgId} did={details.did} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

export default function DidDetailsPanel({
  orgId,
  did,
  onOpenChange,
}: DidDetailsPanelProps): React.JSX.Element {
  return (
    <Sheet open={Boolean(did)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">DID details</SheetTitle>
          <SheetDescription className="font-mono text-xs break-all">
            {did}
          </SheetDescription>
        </SheetHeader>
        {did && <DidDetailsBody key={did} orgId={orgId} did={did} />}
      </SheetContent>
    </Sheet>
  )
}
