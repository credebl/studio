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
import React, { useEffect, useRef, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { AxiosResponse } from 'axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import CustomQRCode from '@/features/wallet/CustomQRCode'
import DIDList from '@/features/wallet/DidListComponent'
import DataTable from '@/components/DataTable'
import DidPanel from './DidPanel'
import { ITableData } from '@/components/DataTable/interface'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createConnection } from '@/app/api/organization'
import { dateConversion } from '@/utils/DateConversion'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

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
  const [copied, setCopied] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const selectedDropdownOrgId = useAppSelector(
    (state) => state.organization.orgId,
  )
  const router = useRouter()

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
    return () => {
      setCopied(false)
    }
  }, [])

  const previousOrgId = useRef<string | null>(null)

  useEffect(() => {
    if (
      previousOrgId.current !== null &&
      previousOrgId.current !== selectedDropdownOrgId
    ) {
      router.push('/dashboard')
    }
    previousOrgId.current = selectedDropdownOrgId
  }, [selectedDropdownOrgId])

  const CopyDid = ({
    value,
    className,
    hideValue = false,
    ellipsis = true,
  }: {
    value: string
    className?: string
    hideValue?: boolean
    ellipsis?: boolean
  }): React.JSX.Element => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          {!hideValue && ellipsis ? (
            <span className="max-w-sm truncate">{value}</span>
          ) : (
            <span className="">{value}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              navigator.clipboard.writeText(value)
              setCopied(true)
              setTimeout(() => {
                setCopied(false)
              }, 2000)
            }}
          >
            {copied ? (
              <Check className="text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
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

  const tableData: ITableData[] = [
    {
      data: [
        {
          data: (
            <div className="ml-8 flex items-center space-x-4">
              {agentData?.walletName || 'Not available'}
            </div>
          ),
        },
        {
          data: (
            <div className="flex gap-2">
              {agentData?.orgDid ? (
                <CopyDid
                  value={agentData?.orgDid}
                  className="font-mono font-semibold"
                  ellipsis={false}
                />
              ) : (
                <span className="font-semibold">Not available</span>
              )}{' '}
              <Badge className="rounded-full border" variant={'outline'}>
                Created :
                {agentData?.createDateTime ? (
                  <DateTooltip date={agentData.createDateTime}>
                    {dateConversion(agentData.createDateTime)}
                  </DateTooltip>
                ) : (
                  <DateTooltip date={new Date().toISOString()}>
                    {dateConversion(new Date().toISOString())}
                  </DateTooltip>
                )}
              </Badge>
            </div>
          ),
        },
        {
          data: agentData?.ledgers?.name || '-',
        },
        {
          data: agentData?.org_agent_type?.agent
            ? agentData.org_agent_type.agent.charAt(0).toUpperCase() +
              agentData.org_agent_type.agent.slice(1).toLowerCase()
            : '',
        },
        {
          data: (
            <Button className="" onClick={() => setOpenModal(true)}>
              Scan QR
            </Button>
          ),
        },
      ],
    },
  ]

  return (
    <div className="">
      <div className="flex justify-between">
        <h2 className="pb-4 text-2xl font-bold">Wallet Details</h2>
        <Button onClick={() => setIsDrawerOpen(true)}>DID List</Button>
      </div>

      <DataTable
        header={[
          { columnName: 'Wallet Name' },
          { columnName: 'Org DID' },
          { columnName: 'Network' },
          { columnName: 'Agent Type' },
          { columnName: '' },
        ]}
        data={tableData}
        loading={loading}
        isEmailVerification={true}
      />

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
      <DidPanel
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title={'DID Details'}
        description={'Detailed view of selected Schema'}
      >
        <DIDList orgId={orgId} />
      </DidPanel>

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
