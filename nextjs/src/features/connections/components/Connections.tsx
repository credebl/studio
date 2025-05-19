'use client'

import {
  Connection,
  ConnectionApiSortFields,
} from '../types/connections-interface'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '../../../components/ui/generic-table-component/columns'
import { JSX, useEffect, useState } from 'react'

import { DataTable } from '../../../components/ui/generic-table-component/data-table'
import PageContainer from '@/components/layout/page-container'
import { getConnectionsByOrg } from '@/app/api/connection'
import { useAppSelector } from '@/lib/hooks'

export default function Connections(): JSX.Element {
  const metadata: ITableMetadata = {
    enableSelection: true,
  }
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [connectionData, setConnectionData] = useState<Connection[]>([
    {
      createDateTime: '',
      createdBy: '',
      orgId: '',
      state: '',
      theirLabel: '',
      connectionId: '',
    },
  ])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createDateTime')
  const [sortOrder, setsortOrder] = useState<SortActions>('desc')

  useEffect(() => {
    if (!orgId) {
      return
    }
    async function fetchConnections(): Promise<void> {
      try {
        const connectionList = await getConnectionsByOrg({
          itemPerPage: pageSize,
          page: pageIndex + 1,
          search: searchTerm,
          sortBy,
          sortingOrder: sortOrder,
          orgId,
        })

        if (connectionList && Array.isArray(connectionList.data)) {
          setConnectionData(connectionList.data ?? [])
          setPageCount(connectionList.lastPage ?? 1)
        } else {
          setConnectionData([])
          setPageCount(1)
        }
      } catch (error) {
        console.error('Failed to fetch connections:', error)
        setConnectionData([])
      }
    }

    fetchConnections()
    // Can add terms according to us
  }, [orgId, pageIndex, pageSize, sortBy, searchTerm, sortOrder])

  useEffect(() => {
    if (!orgId) {
      return
    }
    // Reset all params
    setPageIndex(0)
    setPageSize(10)
    setPageCount(1)
    setSortBy('createDateTime')
    setSearchTerm('')
    setsortOrder('desc')
  }, [orgId]) // Rerun with default config on org data change

  const columnData: IColumnData[] = [
    {
      id: 'theirLabel',
      title: 'Their Label',
      accessorKey: 'theirLabel',
      columnFunction: [
        'hide',
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy(ConnectionApiSortFields.THEIR_LABEL)
            setsortOrder(order)
          },
        },
      ],
    },
    {
      id: 'connectionId',
      title: 'Connection Id',
      accessorKey: 'connectionId',
      columnFunction: [
        'hide',
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy(ConnectionApiSortFields.CONNECTIONID)
            setsortOrder(order)
          },
        },
      ],
    },
    {
      id: 'state',
      title: 'state',
      accessorKey: 'state',
      columnFunction: ['hide'],
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'orgId',
      title: 'orgId',
      accessorKey: 'orgId',
      columnFunction: ['hide'],
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'createdBy',
      title: 'createdBy',
      accessorKey: 'createdBy',
      columnFunction: ['hide'],
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'createDateTime',
      title: 'createDateTime',
      accessorKey: 'createDateTime',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy(ConnectionApiSortFields.CREATE_DATE_TIME)
            setsortOrder(order)
          },
        },
      ],
      // cell:<div></div> // Optional if we want to send our own cell
    },
  ]

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<Connection>(tableStyling)

  return (
    <PageContainer>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Connections</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of Connection!
          </p>
        </div>
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <DataTable
          data={connectionData} // data to be sent according to column structure
          columns={column} // Define the column stucture according to
          index={'connectionId'} // Unique index for the rows
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          onPageChange={setPageIndex} // Function to handle pageIndex change
          onPageSizeChange={(size) => {
            // Function to handle pageSize change
            setPageSize(size)
            setPageIndex(0)
          }}
          onSearchTerm={setSearchTerm} // Function to handle searchTerm change
        />
      </div>
    </PageContainer>
  )
}
