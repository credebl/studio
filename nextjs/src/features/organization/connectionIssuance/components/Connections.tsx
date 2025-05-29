'use client'

import { ArrowLeft, CircleArrowRight } from 'lucide-react'
import type {
  IConnectionList,
  ITableData,
  ITableHtml,
} from '../type/Connections'
import React, { JSX, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import ConnectionList from './ConnectionList'
import DataTable from './ConnectionIssueTable'
import DateTooltip from '@/components/DateTooltip'
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
    const selectedConnectionData = selectedConnections.map((ele) => ({
      userName: String(ele.data[0].data),
      connectionId: String(ele.data[1].data),
    }))
    dispatch(setSelectedUser(selectedConnectionData))
    router.push(pathRoutes.organizations.Issuance.issuance)
  }

  return (
    <PageContainer>
      <div className="pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex items-center justify-end px-4">
            <Button
              onClick={() =>
                router.push(pathRoutes.back.credentials.credentials)
              }
            >
              <ArrowLeft />
              Back
            </Button>
          </div>
        </div>
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul
            className="-mb-px flex flex-wrap text-center text-sm font-medium"
            id="myTab"
            data-tabs-toggle="#myTabContent"
            role="tablist"
          >
            <li className="mr-2" role="presentation">
              <button
                className="inline-block rounded-t-lg border-b-2 p-4 text-xl"
                id="profile-tab"
                data-tabs-target="#profile"
                type="button"
                role="tab"
                aria-controls="profile"
                aria-selected="false"
              >
                Connection
              </button>
            </li>
          </ul>
        </div>
        <div id="myTabContent">
          <div
            className="rounded-lg bg-gray-50 dark:bg-gray-900"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <ConnectionList selectConnection={selectConnection} />
            <div className="m-4 mb-4 flex items-center justify-between pt-6">
              <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Selected Users
              </h1>
            </div>
            <div className="m-4 rounded-lg border border-gray-200 bg-white shadow-sm sm:p-4 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
              <DataTable
                header={selectedConnectionHeader}
                data={selectedConnections}
                loading={false}
              ></DataTable>
              {selectedConnections.length ? (
                <div className="flex justify-end pt-3">
                  <Button
                    onClick={continueToIssue}
                    className="bg-primary hover:!bg-primary/90 hover:bg-accent-00 rounded-lg text-center text-base sm:w-auto"
                  >
                    <div className="">
                      <CircleArrowRight />
                    </div>
                    Continue
                  </Button>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Connections
