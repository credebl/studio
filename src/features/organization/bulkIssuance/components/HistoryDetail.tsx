'use client'

import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { type JSX, useEffect, useState } from 'react'
import { AlertComponent } from '@/components/AlertComponent'
import { ArrowLeft } from 'lucide-react'
import { AxiosResponse } from 'axios'
import { BulkIssuanceStatus } from '@/features/common/enum'
import { Button } from '@/components/ui/button'
import { CellContext } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { IConnectionListAPIParameter } from '@/app/api/connection'
import { ITableData } from '@/features/connections/types/connections-interface'
import Loader from '@/components/Loader'
import { RootState } from '@/lib/store'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getFilesDataHistory } from '@/app/api/BulkIssuance'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface IProps {
  requestId: string
}

type StatusRow = {
  isError: boolean
  status: string
}

function statusCell(ctx: CellContext<StatusRow, unknown>): JSX.Element {
  const { isError, status } = ctx.row.original

  return (
    <p
      className={`${
        !isError
          ? 'badges-success text-foreground'
          : 'badges-error text-foreground'
      } text-md flex w-fit justify-center rounded-md px-2 py-0.5 font-medium`}
    >
      {status}
    </p>
  )
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

  function getHistoryErrorMessage(history?: { error?: string }): string {
    if (!history?.error) {
      return '-'
    }

    if (history.error === 'Http Exception') {
      return 'Credential Issuance failed due to error in Wallet Agent'
    }

    return history.error.replace(/[[\]"{},]/g, ' ')
  }

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
          error: getHistoryErrorMessage(history),
        }),
      )
      setHistoryList(historyData)
    } else {
      setError(response as string)
    }
    setLoading(false)
  }

  useEffect(() => {
    const getData = setTimeout(() => {
      getHistoryDetails(listAPIParameter)
    }, 500)

    return () => clearTimeout(getData)
  }, [
    listAPIParameter.search,
    listAPIParameter.page,
    listAPIParameter.sortingOrder,
    listAPIParameter.itemPerPage,
  ])

  const searchInputChange = (
    value: string | React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const searchTerm =
      typeof value === 'string' ? value : (value?.target?.value ?? '')

    setListAPIParameter({
      ...listAPIParameter,
      search: searchTerm,
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
      cell: (row) => statusCell({ ...row }),
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

  const handleClick = (): void => {
    setLoading(true)
    router.push(pathRoutes.organizations.Issuance.history)
  }

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<ITableData>(tableStyling)

  return (
    <div className="p-4" id="connection_list">
      <div className="flex items-center justify-end">
        <Button onClick={handleClick} disabled={loading}>
          {loading ? <Loader size={20} /> : <ArrowLeft />}
          {!loading && 'Back'}
        </Button>
      </div>
      <div
        className="mb-4 flex items-center justify-between"
        id="connection-list"
      >
        <h1 className="ml-1">
          <p className="text-xl font-semibold">History Details</p>
          <p className="text-sm">Bulk Issuance History Details</p>
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
        onSearchTerm={(value) => searchInputChange(value)}
        isLoading={loading}
      />
    </div>
  )
}

export default HistoryDetails
