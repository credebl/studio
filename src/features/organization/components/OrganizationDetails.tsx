import { Check, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IConnection,
  IOrgAgent,
  IOrganisation,
} from './interfaces/organization'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import CustomQRCode from '@/features/wallet/CustomQRCode'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { cn } from '@/lib/utils'
import { createConnection } from '@/app/api/organization'
import { dateConversion } from '@/utils/DateConversion'
import { getAgentHealth } from '@/app/api/Agent'

type HealthState = 'checking' | 'online' | 'unreachable'

// Mirrors AgentSpinUpStatus in the platform: the wallet is created first, then its DID.
const SPIN_UP_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Wallet created',
  2: 'Ready',
}

// Status chips use the theme-aware classes from globals.css, so they stay readable in light and dark mode.
const STATUS_CLASSES = {
  good: 'status-accepted',
  warn: 'status-pending',
  bad: 'status-rejected',
  neutral: 'bg-muted text-muted-foreground',
} as const

const StatusPill = ({
  tone,
  children,
}: {
  tone: keyof typeof STATUS_CLASSES
  children: React.ReactNode
}): React.JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      STATUS_CLASSES[tone],
    )}
  >
    {children}
  </span>
)

const CopyValue = ({
  value,
  mono = true,
}: {
  value: string
  mono?: boolean
}): React.JSX.Element => {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-start gap-2">
      <span className={cn('min-w-0 break-all', mono && 'font-mono text-sm')}>
        {value}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            aria-label="Copy to clipboard"
            onClick={() => {
              navigator.clipboard
                .writeText(value)
                .then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                })
                .catch((error) =>
                  console.error('could not copy to clipboard', error),
                )
            }}
          >
            {copied ? (
              <Check className="text-success h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

const Detail = ({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: React.ReactNode
}): React.JSX.Element => (
  <div
    className={cn('min-w-0 space-y-1', wide && 'sm:col-span-2 lg:col-span-3')}
  >
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className="text-sm font-medium">{children}</dd>
  </div>
)

const OrganizationDetails = ({
  orgData,
}: {
  orgData: IOrganisation | null
}): React.JSX.Element => {
  const orgId = orgData ? orgData?.id : ''
  // eslint-disable-next-line camelcase
  const { org_agents } = orgData as IOrganisation
  const agentData: IOrgAgent | null =
    // eslint-disable-next-line camelcase
    org_agents.length > 0 ? org_agents[0] : null

  const [loading, setLoading] = useState<boolean>(true)
  const [connectionData, setConnectionData] = useState<IConnection | null>(null)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [copyDoc, setCopyDoc] = useState(false)
  const [health, setHealth] = useState<HealthState>('checking')

  const createQrConnection = async (): Promise<void> => {
    setLoading(true)
    const response = await createConnection(orgId, orgData?.name as string)
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setConnectionData(data?.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    createQrConnection()
  }, [])

  useEffect(() => {
    if (!orgId || !agentData?.agentEndPoint) {
      setHealth('unreachable')
      return
    }

    let cancelled = false
    setHealth('checking')
    getAgentHealth(orgId)
      .then((response) => {
        if (cancelled) {
          return
        }
        const { data } = response as AxiosResponse
        const online =
          data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS &&
          data?.data?.isInitialized !== false
        setHealth(online ? 'online' : 'unreachable')
      })
      .catch(() => {
        if (!cancelled) {
          setHealth('unreachable')
        }
      })

    return () => {
      cancelled = true
    }
  }, [orgId, agentData?.agentEndPoint])

  const agentType = agentData?.org_agent_type?.agent
    ? agentData.org_agent_type.agent.charAt(0).toUpperCase() +
      agentData.org_agent_type.agent.slice(1).toLowerCase()
    : null
  const spinUpStatus = agentData?.agentSpinUpStatus
  const hasTenant = Boolean(agentData?.tenantId)

  let healthPill: React.ReactNode = (
    <StatusPill tone="neutral">Checking…</StatusPill>
  )
  if (health === 'online') {
    healthPill = <StatusPill tone="good">Online</StatusPill>
  } else if (health === 'unreachable') {
    healthPill = <StatusPill tone="bad">Unreachable</StatusPill>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <h2 className="text-2xl font-bold">Wallet Details</h2>
        <Button variant="outline" onClick={() => setOpenModal(true)}>
          Scan QR
        </Button>
      </div>

      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Wallet name">
          {agentData?.walletName || 'Not available'}
        </Detail>
        <Detail label="Agent type">{agentType ?? 'Not available'}</Detail>
        <Detail label="Network">{agentData?.ledgers?.name || '-'}</Detail>
        <Detail label="Agent status">
          <div className="flex flex-wrap items-center gap-2">
            {healthPill}
            {spinUpStatus !== undefined && (
              <StatusPill tone={spinUpStatus === 2 ? 'good' : 'warn'}>
                {SPIN_UP_LABELS[spinUpStatus] ?? `Status ${spinUpStatus}`}
              </StatusPill>
            )}
          </div>
        </Detail>
        <Detail label="Created">
          {agentData?.createDateTime
            ? dateConversion(agentData.createDateTime)
            : 'Not available'}
        </Detail>
        {hasTenant && (
          <Detail label="Tenant ID">
            <CopyValue value={String(agentData?.tenantId)} />
          </Detail>
        )}
        {agentData?.agentEndPoint && (
          <Detail label="Agent endpoint" wide>
            <CopyValue value={agentData.agentEndPoint} />
          </Detail>
        )}
        <Detail label="Org DID" wide>
          {agentData?.orgDid ? (
            <CopyValue value={agentData.orgDid} />
          ) : (
            'Not available'
          )}
        </Detail>
      </dl>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent
          className="h-90 w-90 sm:max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center">Scan QR</DialogTitle>
          </DialogHeader>
          <div className={`w-48 ${loading ? 'border' : ''} m-auto`}>
            {loading ? (
              <div className="flex h-48 w-48 items-center justify-center">
                <Loader />
              </div>
            ) : (
              connectionData && (
                <div className="flex flex-col items-center">
                  <CustomQRCode
                    value={connectionData.connectionInvitation as string}
                    size={180}
                  />
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {agentData?.orgDid?.startsWith('did:web') && (
        <Card className="mt-5 p-6">
          <h3 className="mb-4 text-xl font-bold">DID Document</h3>

          <div className="space-y-8">
            <div>
              <h4 className="mb-2 text-lg font-semibold">Instructions:</h4>
              <ul className="space-y-1">
                <li>
                  1. Kindly provide the DID document for hosting purposes in
                  order to facilitate its publication
                </li>
                <li>
                  2. Failure to host the DID document will result in the
                  inability to publish your DID
                </li>
              </ul>
            </div>

            <div className="rounded-md">
              <div className="flex items-start justify-between">
                <pre className="bg-muted relative w-full overflow-x-auto rounded-md p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-6 w-6"
                    aria-label="Copy DID document"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(
                          JSON.stringify(agentData?.didDocument, undefined, 4),
                        )
                        .catch((error) =>
                          console.error('could not copy to clipboard', error),
                        )
                      setCopyDoc(true)
                      setTimeout(() => {
                        setCopyDoc(false)
                      }, 2000)
                    }}
                  >
                    {copyDoc ? (
                      <Check className="text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <code className="text-sm">
                    {JSON.stringify(agentData?.didDocument, undefined, 4)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default OrganizationDetails
