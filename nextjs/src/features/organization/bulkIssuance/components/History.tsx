'use client'

import 'react-toastify/dist/ReactToastify.css'

import { ArrowLeft, Eye } from 'lucide-react'
import {
  BulkIssuanceHistory,
  BulkIssuanceHistoryData,
} from '@/features/common/enum'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { JSX, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import {
  apiStatusCodes,
  createDateTime,
  successfulRecords,
  totalRecords,
} from '@/config/CommonConstant'
import { getFilesHistory, retryBulkIssuance } from '@/app/api/BulkIssuance'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { DateCell } from '@/features/organization/connectionIssuance/components/CredentialTableCells'
import { ITableData } from '@/features/connections/types/connections-interface'
import PageContainer from '@/components/layout/page-container'
import { RootState } from '@/lib/store'
import SOCKET from '@/config/SocketConfig'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const HistoryBulkIssuance = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true)
  const [failure, setFailure] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const socketId = useAppSelector((state: RootState) => state.socket.SOCKET_ID)
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)
  const router = useRouter()

  const [paginationForTable, setPaginationForTable] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc' as SortActions,
  })

  const [connectionList, setConnectionList] = useState<ITableData[]>([])

  async function getHistory(): Promise<void> {
    setLoading(true)
    const response = await getFilesHistory({
      itemPerPage: paginationForTable.pageSize,
      page: paginationForTable.pageIndex + 1,
      search: paginationForTable.searchTerm,
      sortBy: paginationForTable.sortBy,
      sortingOrder: paginationForTable.sortOrder,
      orgId,
    })

    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
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
        }) => ({
          id: ele?.id,
          name: ele?.name ? ele.name : 'Not available',
          createDateTime: ele?.createDateTime
            ? ele?.createDateTime
            : 'Not available',
          totalRecords: ele.totalRecords ? ele.totalRecords : 0,
          successfulRecords: ele.successfulRecords ? ele.successfulRecords : 0,
          failedRecords: ele.failedRecords ? ele.failedRecords : 0,
          status: ele?.status ? ele?.status : 'Not available',
        }),
      )
      setConnectionList(connections)
      setPaginationForTable((prev) => ({
        ...prev,
        pageCount: data?.data.lastPage ?? 1,
      }))
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
        getHistory()
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

  useEffect(() => {
    SOCKET.emit('bulk-connection')
    SOCKET.on('bulk-issuance-process-retry-completed', () => {
      setSuccess(null)
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
      getHistory()
    })

    SOCKET.on('error-in-bulk-issuance-retry-process', () => {
      setFailure(null)
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
      getHistory()
    })

    let getData: NodeJS.Timeout | null = null

    if (paginationForTable.searchTerm.length >= 1) {
      getData = setTimeout(() => {
        getHistory()
      }, 1000)
      return () => clearTimeout(getData ?? undefined)
    } else {
      getHistory()
    }

    return () => clearTimeout(getData ?? undefined)
  }, [paginationForTable])

  const columnData: IColumnData[] = [
    {
      id: 'name',
      title: 'File Name',
      accessorKey: 'name',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPaginationForTable((prev) => ({
              ...prev,
              sortBy: 'name',
              sortOrder: order,
            }))
          },
        },
      ],
    },
    {
      id: createDateTime,
      title: 'Uploaded Date',
      accessorKey: createDateTime,
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPaginationForTable((prev) => ({
              ...prev,
              sortBy: createDateTime,
              sortOrder: order,
            }))
          },
        },
      ],
      cell: ({ row }) => <DateCell date={row.original.createDateTime} />,
    },

    {
      id: totalRecords,
      title: 'Total Records',
      accessorKey: totalRecords,
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPaginationForTable((prev) => ({
              ...prev,
              sortBy: totalRecords,
              sortOrder: order,
            }))
          },
        },
      ],
    },

    {
      id: successfulRecords,
      title: 'Successful Records',
      accessorKey: successfulRecords,
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPaginationForTable((prev) => ({
              ...prev,
              sortBy: successfulRecords,
              sortOrder: order,
            }))
          },
        },
      ],
    },

    {
      id: 'failedRecords',
      title: 'Failed Records',
      accessorKey: 'failedRecords',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPaginationForTable((prev) => ({
              ...prev,
              sortBy: 'failedRecords',
              sortOrder: order,
            }))
          },
        },
      ],
    },
    {
      id: 'status',
      title: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <p
          className={`${
            row.original.failedRecords > 0
              ? 'border border-orange-100 bg-orange-100 text-orange-800 dark:border-orange-400 dark:bg-gray-700 dark:text-orange-400'
              : 'border border-green-100 bg-green-100 text-green-800 dark:border-green-500 dark:bg-gray-700 dark:text-green-400'
          } mr-0.5 flex w-fit items-center justify-center rounded-md px-2 py-0.5 text-sm font-medium`}
        >
          {row.original.failedRecords > 0
            ? BulkIssuanceHistoryData.interrupted
            : BulkIssuanceHistoryData.completed}
        </p>
      ),
      columnFunction: [],
    },
    {
      id: 'actions',
      title: 'Action',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex">
          <Button
            disabled={row.original.status === BulkIssuanceHistory.started}
            onClick={() => {
              router.push(
                `${pathRoutes.organizations.Issuance.history}/${row.original.id}`,
              )
            }}
            className=""
            style={{ height: '2.5rem', minWidth: '4rem' }}
          >
            <Eye />
            <p className="flex items-center justify-center pr-1 text-center">
              <span className="pl-1">View</span>{' '}
            </p>
          </Button>
          {row.original.failedRecords > 0 && (
            <Button
              onClick={() => handleRetry(row.original.id)}
              className="hover:!bg-secondary-700 hover:bg-secondary-700 bg-secondary-700 focus:ring-primary-300 ring-primary-700 bg-white-700 text-primary-600 border-primary-650 hover:text-primary-600 dark:text-primary-450 dark:border-primary-450 dark:hover:text-primary-450 dark:hover:bg-secondary-700 mr-2 ml-4 rounded-md py-2 text-center text-base font-medium focus:ring-4 lg:px-3 lg:py-2.5 dark:bg-transparent"
              style={{ height: '2.5rem', minWidth: '4rem' }}
            >
              <p className="flex items-center justify-center pr-1 text-center">
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
      columnFunction: [],
    },
  ]

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<ITableData>(tableStyling)

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

        <DataTable
          isLoading={loading}
          placeHolder="Filter by File Name"
          data={connectionList}
          columns={column}
          index={'id'}
          pageIndex={paginationForTable.pageIndex}
          pageSize={paginationForTable.pageSize}
          pageCount={paginationForTable.pageCount}
          onPageChange={(index) =>
            setPaginationForTable((prev) => ({
              ...prev,
              pageIndex: index,
            }))
          }
          onPageSizeChange={(size) => {
            setPaginationForTable((prev) => ({
              ...prev,
              pageSize: size,
              pageIndex: 0,
            }))
          }}
          onSearchTerm={(term) =>
            setPaginationForTable((prev) => ({
              ...prev,
              searchTerm: term,
            }))
          }
        />
      </div>
    </PageContainer>
  )
}

export default HistoryBulkIssuance
