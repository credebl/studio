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
import { Copy } from 'lucide-react'
import CustomQRCode from '@/features/wallet/CustomQRCode'
import DIDList from '@/features/wallet/DidListComponent'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createConnection } from '@/app/api/organization'
import { dateConversion } from '@/utils/DateConversion'

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

  const CopyDid = ({
    value,
    className,
    hideValue = false,
  }: {
    value: string
    className?: string
    hideValue?: boolean
  }): React.JSX.Element => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          {!hideValue && <span className="max-w-xs truncate">{value}</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => navigator.clipboard.writeText(value)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy to clipboard</p>
      </TooltipContent>
    </Tooltip>
  )

  const DateTooltip = ({
    date,
    children,
  }: {
    date: string
    children: React.ReactNode
  }): React.JSX.Element => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{children}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{new Date(date).toLocaleString()}</p>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div className="">
      <h2 className="pb-4 text-2xl font-bold">Wallet Details</h2>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-96">
          {/* Wallet Details */}
          <div className="gap-y-4">
            <div className="space-y-8">
              <div className="flex items-center">
                <span className="w-40">Wallet Name</span>
                <span className="mx-2">:</span>
                <span className="font-semibold">{agentData?.walletName}</span>
              </div>

              <div className="flex items-center">
                <span className="w-40">Org DID</span>
                <span className="mx-2">:</span>
                {agentData?.orgDid ? (
                  <CopyDid
                    value={agentData?.orgDid}
                    className="font-mono font-semibold"
                  />
                ) : (
                  <span className="font-semibold">Not available</span>
                )}
              </div>

              <div className="flex items-center">
                <span className="w-40">Network</span>
                <span className="mx-2">:</span>
                <span className="font-semibold">
                  {agentData?.ledgers?.name || '-'}
                </span>
              </div>

              <div className="flex items-center">
                <span className="w-40">Agent Type</span>
                <span className="mx-2">:</span>
                <span className="font-semibold">
                  {agentData?.org_agent_type?.agent
                    ? agentData.org_agent_type.agent.charAt(0).toUpperCase() +
                      agentData.org_agent_type.agent.slice(1).toLowerCase()
                    : ''}
                </span>
              </div>

              <div className="flex items-center">
                <span className="w-40">Created On</span>
                <span className="mx-2">:</span>
                <span className="font-semibold">
                  {agentData?.createDateTime ? (
                    <DateTooltip date={agentData.createDateTime}>
                      {dateConversion(agentData.createDateTime)}
                    </DateTooltip>
                  ) : (
                    <DateTooltip date={new Date().toISOString()}>
                      {dateConversion(new Date().toISOString())}
                    </DateTooltip>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code - aligned inline with details */}
          <div className={`w-48 ${loading ? 'border' : ''}`}>
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
        </div>

        <div className="mt-10">
          <DIDList orgId={orgId} />
        </div>
      </Card>

      {agentData?.orgDid?.startsWith('did:web') && (
        <Card className="p-6">
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

            <div className="rounded-md p-4">
              <div className="flex items-start justify-between">
                <pre className="overflow-x-auto">
                  <code className="text-sm">
                    {JSON.stringify(agentData?.didDocument, undefined, 4)}
                  </code>
                </pre>
                <CopyDid
                  value={JSON.stringify(agentData?.didDocument)}
                  hideValue={true}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default OrganizationDetails
