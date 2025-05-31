'use client'

import 'react-toastify/dist/ReactToastify.css'

import { ArrowLeft, Eye } from 'lucide-react'
import {
  BulkIssuanceHistory,
  BulkIssuanceHistoryData,
} from '@/features/common/enum'
import { type ChangeEvent, JSX, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { getFilesHistory, retryBulkIssuance } from '@/app/api/BulkIssuance'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DateTooltip from '@/components/DateTooltip'
import { IConnectionListAPIParameter } from '@/app/api/connection'
import { ITableData } from '@/features/connections/types/connections-interface'
import PageContainer from '@/components/layout/page-container'
import { RootState } from '@/lib/store'
import SOCKET from '@/config/SocketConfig'
import SortDataTable from '../../connectionIssuance/components/connectionsTables/SortDataTable'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const HistoryBulkIssuance = (): JSX.Element => {
  const initialPageState = {
    itemPerPage: 10,
    page: 1,
    search: '',
    sortBy: 'createDateTime',
    sortingOrder: 'desc',
  }
  const [listAPIParameter, setListAPIParameter] = useState(initialPageState)
  const [connectionList, setConnectionList] = useState<ITableData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [failure, setFailure] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [totalItem, setTotalItem] = useState(0)
  const [pageInfo, setPageInfo] = useState({
    totalItem: 0,
    nextPage: 0,
    lastPage: 0,
  })
  const socketId = useAppSelector((state: RootState) => state.socket.SOCKET_ID)
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)
  const router = useRouter()

  const searchInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setListAPIParameter({
      ...listAPIParameter,
      search: e.target.value,
      page: 1,
    })
  }

  async function getHistory(
    apiParameter: IConnectionListAPIParameter,
  ): Promise<void> {
    setLoading(true)
    const response = await getFilesHistory({ ...apiParameter, orgId })

    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setTotalItem(data?.data.totalItems)
      const { totalItems, nextPage, lastPage } = data.data
      setPageInfo({
        totalItem: totalItems,
        nextPage,
        lastPage,
      })
      const connections = data?.data?.data?.map(
        (ele: {
          totalRecords: number
          successfulRecords: number
          failedRecords: number
          status: string
          createDateTime: string
          name: string
          theirLabel: string
          id: string
          createdAt: string
        }) => {
          const fileId = ele?.id
          const userName = ele?.name ? ele.name : 'Not available'
          const totalRecords = ele.totalRecords ? ele.totalRecords : 0
          const successfulRecords = ele.successfulRecords
            ? ele.successfulRecords
            : 0
          const failedRecords = ele.failedRecords ? ele.failedRecords : 0
          const createdOn = ele?.createDateTime
            ? ele?.createDateTime
            : 'Not available'

          const status = ele?.status ? ele?.status : 'Not available'

          return {
            data: [
              { data: userName },
              {
                data: (
                  <DateTooltip date={createdOn} id="issuance_connection_list">
                    <div> {dateConversion(createdOn)} </div>
                  </DateTooltip>
                ),
              },
              { data: totalRecords },
              { data: successfulRecords },
              { data: failedRecords },
              {
                data: (
                  <p
                    className={`${
                      failedRecords > 0
                        ? 'border border-orange-100 bg-orange-100 text-orange-800 dark:border-orange-400 dark:bg-gray-700 dark:text-orange-400'
                        : 'border border-green-100 bg-green-100 text-green-800 dark:border-green-500 dark:bg-gray-700 dark:text-green-400'
                    }text-sm mr-0.5 flex w-fit items-center justify-center rounded-md px-2 py-0.5 font-medium`}
                  >
                    {failedRecords > 0
                      ? BulkIssuanceHistoryData.interrupted
                      : BulkIssuanceHistoryData.completed}
                  </p>
                ),
              },
              {
                data: (
                  <div className="flex">
                    <Button
                      disabled={status === BulkIssuanceHistory.started}
                      onClick={() => {
                        router.push(
                          `${pathRoutes.organizations.Issuance.history}/${ele?.id}`,
                        )
                      }}
                      className=""
                      style={{ height: '2.5rem', minWidth: '4rem' }}
                    >
                      <Eye />
                      <p className="item-center flex justify-center pr-1 text-center">
                        <span className="pl-1">View</span>{' '}
                      </p>
                    </Button>
                    {failedRecords > 0 && (
                      <Button
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        onClick={() => handleRetry(fileId)}
                        className="hover:!bg-secondary-700 hover:bg-secondary-700 bg-secondary-700 focus:ring-primary-300 ring-primary-700 bg-white-700 text-primary-600 border-primary-650 hover:text-primary-600 dark:text-primary-450 dark:border-primary-450 dark:hover:text-primary-450 dark:hover:bg-secondary-700 mr-2 ml-4 rounded-md py-2 text-center text-base font-medium focus:ring-4 lg:px-3 lg:py-2.5 dark:bg-transparent"
                        style={{ height: '2.5rem', minWidth: '4rem' }}
                      >
                        <p className="item-center flex justify-center pr-1 text-center">
                          {' '}
                          <svg
                            className="mt-0.5 flex items-center pr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="15"
                            fill="none"
                            viewBox="0 0 24 20"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"
                            />
                          </svg>
                          <span>Retry</span>{' '}
                        </p>
                      </Button>
                    )}
                  </div>
                ),
              },
            ],
          }
        },
      )
      setConnectionList(connections)
    } else if (response?.toString()?.toLowerCase() !== 'history not found') {
      setFailure(response as string)
    }
    setLoading(false)
  }
  async function handleRetry(fileId: string): Promise<void> {
    setSuccess('Issuance process reinitiated. Please wait a moment.')
    setLoading(true)
    const retryIssunace = await retryBulkIssuance(fileId, socketId, orgId)
    const { data } = retryIssunace as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      if (data?.data) {
        setLoading(false)
        getHistory(listAPIParameter)
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
      setFailure(retryIssunace as string)
      setTimeout(() => {
        setFailure(null)
      }, 4000)
    }
  }

  const searchSortByValue = (value: string): void => {
    setListAPIParameter({
      ...listAPIParameter,
      page: 1,
      sortingOrder: value,
    })
  }

  useEffect(() => {
    SOCKET.emit('bulk-connection')
    SOCKET.on('bulk-issuance-process-retry-completed', () => {
      setSuccess(null)
      // eslint-disable-next-line no-console
      console.log('bulk-issuance-process-retry-completed')
      toast.success('Issuance process completed', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      })
      getHistory(listAPIParameter)
    })

    SOCKET.on('error-in-bulk-issuance-retry-process', () => {
      setFailure(null)
      // eslint-disable-next-line no-console
      console.log('error-in-bulk-issuance-retry-process-initiated')
      toast.error('Issuance process failed. Please retry', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      })
      getHistory(listAPIParameter)
    })

    let getData: NodeJS.Timeout | null = null

    if (listAPIParameter.search.length >= 1) {
      getData = setTimeout(() => {
        getHistory(listAPIParameter)
      }, 1000)
      return () => clearTimeout(getData ?? undefined)
    } else {
      getHistory(listAPIParameter)
    }

    return () => clearTimeout(getData ?? undefined)
  }, [listAPIParameter])

  const header = [
    { columnName: 'File Name' },
    { columnName: 'Uploaded Date' },
    { columnName: 'Total Records' },
    { columnName: 'Successful Records' },
    { columnName: 'Failed Records' },
    { columnName: 'Status' },
    { columnName: 'Action' },
  ]

  const refreshPage = (): void => {
    getHistory(listAPIParameter)
  }

  return (
    <PageContainer>
      <div className="p-4" id="connection_list">
        <ToastContainer />
        <div className="flex items-center justify-end">
          <div className="flex items-center justify-end">
            <Button
              onClick={() =>
                router.push(pathRoutes.organizations.Issuance.bulkIssuance)
              }
            >
              <ArrowLeft />
              Back
            </Button>
          </div>
        </div>
        <div
          className="mb-4 flex items-center justify-between"
          id="connection-list"
        >
          <h1 className="ml-1">
            <p className="text-xl font-semibold sm:text-2xl">History</p>
            <p className="text-sm">Bulk Issuance History</p>
          </h1>
        </div>

        {(success || failure) && (
          <AlertComponent
            message={success ?? failure}
            type={success ? 'success' : 'failure'}
            onAlertClose={() => {
              setSuccess(null)
              setFailure(null)
            }}
          />
        )}
        <Card className="p-1">
          <SortDataTable
            isHeader={true}
            isSearch={true}
            isRefresh={true}
            isSort={true}
            onInputChange={searchInputChange}
            refresh={refreshPage}
            header={header}
            data={connectionList}
            loading={loading}
            currentPage={listAPIParameter?.page}
            onPageChange={(page: number) => {
              setListAPIParameter((prevState) => ({
                ...prevState,
                page,
              }))
            }}
            searchValue={listAPIParameter?.search}
            searchSortByValue={searchSortByValue}
            totalPages={Math.ceil(totalItem / listAPIParameter?.itemPerPage)}
            pageInfo={pageInfo}
            message={'No History'}
            discription={"You don't have any activities yet"}
          ></SortDataTable>
        </Card>
      </div>
    </PageContainer>
  )
}

export default HistoryBulkIssuance
