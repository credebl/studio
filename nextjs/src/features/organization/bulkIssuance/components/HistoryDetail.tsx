'use client'

import { type ChangeEvent, JSX, useEffect, useState } from 'react'
import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { AlertComponent } from '@/components/AlertComponent'
import { ArrowLeft } from 'lucide-react'
import { AxiosResponse } from 'axios'
import { BulkIssuanceStatus } from '@/features/common/enum'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { IConnectionListAPIParameter } from '@/app/api/connection'
import { ITableData } from '@/features/connections/types/connections-interface'
import { RootState } from '@/lib/store'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getFilesDataHistory } from '@/app/api/BulkIssuance'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface IProps {
  requestId: string
}

const HistoryDetails = ({ requestId }: IProps): JSX.Element => {
  const initialPageState = {
    itemPerPage: 10,
    page: 1,
    search: '',
    sortBy: 'createDateTime',
    sortingOrder: 'desc',
  }

  const [listAPIParameter, setListAPIParameter] = useState(initialPageState)
  const [historyList, setHistoryList] = useState<ITableData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [, setTotalItem] = useState(0)
  const [pageInfo, setPageInfo] = useState({
    totalItem: 0,
    nextPage: 0,
    lastPage: 0,
  })
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)
  const router = useRouter()

  const getHistoryDetails = async (
    apiParameter: IConnectionListAPIParameter,
  ): Promise<void> => {
    setLoading(true)
    const response = await getFilesDataHistory(
      requestId,
      apiParameter.itemPerPage,
      apiParameter.page,
      apiParameter.search,
      apiParameter.sortBy,
      apiParameter.sortingOrder,
      orgId,
    )

    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setTotalItem(data?.data.totalItems)
      const { totalItems, nextPage, lastPage } = data.data

      setPageInfo({
        totalItem: Number(totalItems),
        nextPage: Number(nextPage),
        lastPage: Number(lastPage),
      })
      const historyData = data?.data?.data?.map(
        (history: {
          isError: boolean
          referenceId: string
          status: string
          email: string
          error: string
        }) => ({
          id: history?.referenceId || 'Not available',
          referenceId: history?.referenceId || 'Not available',
          status:
            history?.isError === false
              ? BulkIssuanceStatus.successful
              : BulkIssuanceStatus.failed,
          isError: history?.isError,
          error: history?.error
            ? history.error === 'Http Exception'
              ? 'Credential Issuance failed due to error in Wallet Agent'
              : history.error.replace(/[[\]"{},]/g, ' ')
            : '-',
        }),
      )
      setHistoryList(historyData)
    } else {
      setError(response as string)
    }
    setLoading(false)
  }

  useEffect(() => {
    let getData: NodeJS.Timeout | null = null

    if (listAPIParameter.search.length >= 1) {
      getData = setTimeout(() => {
        getHistoryDetails(listAPIParameter)
      }, 1000)
      return () => clearTimeout(getData ?? undefined)
    } else {
      getHistoryDetails(listAPIParameter)
    }

    return () => clearTimeout(getData ?? undefined)
  }, [listAPIParameter])

  const searchInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setListAPIParameter({
      ...listAPIParameter,
      search: e.target.value,
      page: 1,
    })
  }

  const searchSortByValue = (value: string): void => {
    setListAPIParameter({
      ...listAPIParameter,
      page: 1,
      sortingOrder: value,
    })
  }

  const columnData: IColumnData[] = [
    {
      id: 'referenceId',
      title: 'User',
      accessorKey: 'referenceId',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            searchSortByValue(order)
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
            row.original.isError === false
              ? 'border border-green-100 bg-green-100 text-green-800 dark:border-green-500 dark:bg-gray-700 dark:text-green-400'
              : 'border border-red-100 bg-red-100 text-red-800 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
          } text-md flex w-fit justify-center rounded-md px-2 py-0.5 font-medium min-[320]:px-3 sm:mr-0 sm:px-3 md:mr-2 lg:px-3`}
        >
          {row.original.status}
        </p>
      ),
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            searchSortByValue(order)
          },
        },
      ],
    },
    {
      id: 'error',
      title: 'Description',
      accessorKey: 'error',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            searchSortByValue(order)
          },
        },
      ],
    },
  ]

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<ITableData>(tableStyling)

  return (
    <div className="p-4" id="connection_list">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => router.push(pathRoutes.organizations.Issuance.history)}
        >
          <ArrowLeft />
          Back
        </Button>
      </div>
      <div
        className="mb-4 flex items-center justify-between"
        id="connection-list"
      >
        <h1 className="ml-1">
          <p className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            History Details
          </p>
          <p className="text-sm text-gray-400">Bulk Issuance History Details</p>
        </h1>
      </div>
      <AlertComponent
        message={error}
        type={'failure'}
        onAlertClose={() => {
          setError(null)
        }}
      />
      <DataTable
        placeHolder="Filter by User"
        data={historyList}
        columns={column}
        index={'id'}
        pageIndex={listAPIParameter.page - 1}
        pageSize={listAPIParameter.itemPerPage}
        pageCount={pageInfo.lastPage}
        onPageChange={(index) =>
          setListAPIParameter((prev) => ({ ...prev, page: index + 1 }))
        }
        onPageSizeChange={(size) => {
          setListAPIParameter((prev) => ({
            ...prev,
            itemPerPage: size,
            page: 1,
          }))
        }}
        onSearchTerm={searchInputChange}
        loading={loading}
      />
    </div>
  )
}

export default HistoryDetails
