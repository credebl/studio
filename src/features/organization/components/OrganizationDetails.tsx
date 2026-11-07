import { CopyValue, Detail, StatusPill } from '@/features/wallet/DetailParts'
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

import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import CustomQRCode from '@/features/wallet/CustomQRCode'
import DidDocumentPanel from '@/features/wallet/DidDocumentPanel'
import { FileJson } from 'lucide-react'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createConnection } from '@/app/api/organization'
import { dateConversion } from '@/utils/DateConversion'
import { getAgentHealth } from '@/app/api/Agent'
import { getDidMethod } from '@/lib/did'

type HealthState = 'checking' | 'online' | 'unreachable'

// Mirrors AgentSpinUpStatus in the platform: the wallet is created first, then its DID.
const SPIN_UP_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Wallet created',
  2: 'Ready',
}

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
  const [didDocOpen, setDidDocOpen] = useState<boolean>(false)
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
  // A did:web document has to be hosted by the organization, so it is offered next to the DID. It is only formatted when
  // the panel is opened.
  const isDidWeb = getDidMethod(agentData?.orgDid) === 'web'

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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CopyValue value={agentData.orgDid} />
              </div>
              {isDidWeb && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDidDocOpen(true)}
                >
                  <FileJson className="h-4 w-4" />
                  DID document
                </Button>
              )}
            </div>
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

      {isDidWeb && agentData?.orgDid && (
        <DidDocumentPanel
          open={didDocOpen}
          onOpenChange={setDidDocOpen}
          did={agentData.orgDid}
          didDocument={agentData.didDocument}
        />
      )}
    </div>
  )
}

export default OrganizationDetails
