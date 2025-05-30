import {
  IDidListData,
  IUpdatePrimaryDid,
} from '../organization/components/interfaces/organization'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getDids, updatePrimaryDid } from '@/app/api/Agent'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import CreateDidComponent from './CreateDidComponent'
import { Roles } from '@/common/enums'
import { apiStatusCodes } from '@/config/CommonConstant'

const DIDList = ({ orgId }: { orgId: string }): React.JSX.Element => {
  const [didList, setDidList] = useState<IDidListData[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  // Note: set the roles from redux store
  const [userRoles] = useState<string[]>([])

  const setPrimaryDid = async (id: string, did: string): Promise<void> => {
    try {
      const payload: IUpdatePrimaryDid = {
        id,
        did,
      }
      const response = await updatePrimaryDid(orgId, payload)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        window.location.reload()
      } else {
        setErrorMsg(response as string)
      }
    } catch (error) {
      console.error('Error setting primary DID:', error)
    }
  }

  const getData = async (): Promise<void> => {
    try {
      const response = await getDids(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const sortedDids = data?.data.sort(
          (a: { isPrimaryDid: boolean }, b: { isPrimaryDid: boolean }) => {
            if (a.isPrimaryDid && !b.isPrimaryDid) {
              return -1
            }
            if (!a.isPrimaryDid && b.isPrimaryDid) {
              return 1
            }
            return 0
          },
        )
        setDidList(sortedDids)
      }
    } catch (error) {
      console.error('Error fetching DIDs:', error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const CopyDid = ({
    value,
    className,
  }: {
    value: string
    className?: string
  }): React.JSX.Element => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          <span className="truncate font-mono">{value}</span>
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

  return (
    <div className="w-full space-y-4">
      {successMsg && (
        <div className="w-full" role="alert">
          <AlertComponent
            message={successMsg}
            type={'success'}
            onAlertClose={() => {
              if (setSuccessMsg) {
                setSuccessMsg(null)
              }
            }}
          />
        </div>
      )}
      {errorMsg && (
        <div className="w-full" role="alert">
          <AlertComponent
            message={errorMsg}
            type={'failure'}
            onAlertClose={() => {
              if (setErrorMsg) {
                setErrorMsg(null)
              }
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">DID Details</h3>
        <Button
          onClick={() => setShowPopup(true)}
          disabled={
            userRoles.includes(Roles.MEMBER) ||
            userRoles.includes(Roles.ISSUER) ||
            userRoles.includes(Roles.VERIFIER)
          }
          className=""
        >
          Create DID
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {didList.map((item: IDidListData, index: number) => (
          <div key={item.id} className={`p-4 ${item.isPrimaryDid ? '' : ''} h-20 grid items-center `}>
            <div className="flex items-center justify-between gap-4">
              <span className="w-16 shrink-0">DID {index + 1}</span>
              <span>:</span>

              {item?.did ? (
                <CopyDid value={item.did} className="flex-1 font-mono" />
              ) : (
                <span className="flex-1 font-mono">Not available</span>
              )}

              {item.isPrimaryDid ? (
                <Badge variant="default" className="ml-auto h-9 w-34 text-sm">
                  Primary DID
                </Badge>
              ) : (
                <Button
                  onClick={() => setPrimaryDid(item.id, item.did)}
                  variant="outline"
                  className="ml-auto"
                >
                  Set Primary DID
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateDidComponent
        orgId={orgId}
        setOpenModal={(value) => setShowPopup(value)}
        openModal={showPopup}
        setMessage={setSuccessMsg}
      />
    </div>
  )
}

export default DIDList
