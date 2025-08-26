'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import type {
  IConnectionList,
  ITableData,
  ITableHtml,
} from '../type/Connections'
import React, { JSX, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConnectionList from './ConnectionList'
import DataTable from '@/components/DataTable'
import DateTooltip from '@/components/DateTooltip'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { dateConversion } from '@/utils/DateConversion'
import { pathRoutes } from '@/config/pathRoutes'
import { setSelectedUser } from '@/lib/storageKeys'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'

const Connections = (): JSX.Element => {
  const [selectedConnections, setSelectedConnections] = useState<
    ITableData[] | ITableHtml[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)

  const [isBackLoading, setIsBackLoading] = useState(false)

  const selectedConnectionHeader = [
    { columnName: 'User' },
    { columnName: 'Connection ID' },
    { columnName: 'Created on' },
  ]

  const router = useRouter()

  const dispatch = useDispatch()
  useEffect(() => {
    setSelectedConnections([])
  }, [])

  const selectConnection = (connections: IConnectionList[]): void => {
    setSelectedConnections([])
    try {
      const connectionsData =
        connections?.length > 0
          ? connections?.map((ele: IConnectionList) => {
              const createdOn = ele?.createDateTime
                ? ele?.createDateTime
                : 'Not available'
              const connectionId = ele.connectionId
                ? ele.connectionId
                : 'Not available'
              const userName = ele?.theirLabel
                ? ele.theirLabel
                : 'Not available'

              return {
                data: [
                  { data: userName },
                  { data: connectionId },
                  {
                    data: (
                      <DateTooltip
                        date={createdOn}
                        id="issuance_connection_list"
                      >
                        <div> {dateConversion(createdOn)} </div>
                      </DateTooltip>
                    ),
                  },
                ],
              }
            })
          : []
      setSelectedConnections(connectionsData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('ERROR IN TABLE GENERATION::', error)
    }
  }

  const continueToIssue = async (): Promise<void> => {
    setLoading(true)
    try {
      const selectedConnectionData = selectedConnections.map((ele) => ({
        userName: String(ele.data[0].data),
        connectionId: String(ele.data[1].data),
      }))
      dispatch(setSelectedUser(selectedConnectionData))
      router.push(pathRoutes.organizations.Issuance.issuance)
    } catch (err) {
      console.error('Navigation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackClick = (): void => {
    setIsBackLoading(true)
    router.push(pathRoutes.back.issuance.issue)
  }

  return (
    <PageContainer>
      <div className="pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex items-center justify-end px-4">
            <Button onClick={handleBackClick} disabled={isBackLoading}>
              {isBackLoading ? (
                <Loader size={20} />
              ) : (
                <>
                  <ArrowLeft />
                  Back
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mb-4 border-b">
          <div
            className="mb-4 flex items-center justify-between"
            id="issued-credentials-list"
          >
            <h1 className="ml-1 text-xl font-semibold sm:text-2xl">
              Connection List
            </h1>
          </div>
        </div>
        <div id="myTabContent">
          <Card
            className="rounded-lg"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <ConnectionList selectConnection={selectConnection} />
            <div className="m-4 mb-4 flex items-center justify-between pt-6">
              <h1 className="ml-1 text-xl font-semibold sm:text-2xl">
                Selected Users
              </h1>
            </div>
            <div className="m-4 rounded-lg 2xl:col-span-2">
              <DataTable
                header={selectedConnectionHeader}
                data={selectedConnections}
                loading={false}
              ></DataTable>
              {selectedConnections.length ? (
                <div className="flex justify-end pt-3">
                  <Button
                    onClick={continueToIssue}
                    disabled={loading}
                    className="bg-primary hover:!bg-primary/90 hover:bg-accent-00 rounded-lg text-center text-base sm:w-auto"
                  >
                    {loading ? (
                      <Loader size={20} />
                    ) : (
                      <>
                        <div className="">
                          <ArrowRight />
                        </div>
                        Continue
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                ''
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default Connections
