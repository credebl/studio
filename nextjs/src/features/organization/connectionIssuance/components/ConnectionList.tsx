'use client'

import {
  ConnectionIdCell,
  CreatedOnCell,
  TheirLabelCell,
} from '@/features/verification/components/ConnectionListCells'
import {
  IColumnData,
  ITableMetadata,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import {
  type IConnectionListAPIParameter,
  getConnectionsByOrg,
} from '@/app/api/connection'
import React, { JSX, useEffect, useState } from 'react'
import {
  clearSelectedConnection,
  clearSelectedUser,
  setSelectedConnection,
} from '@/lib/storageKeys'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { AlertComponent } from '@/components/AlertComponent'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import type { IConnectionList } from '../type/Connections'

import { RootState } from '@/lib/store'
import { SelectCheckboxCell } from './ConnectionListCells'

const initialPageState = {
  itemPerPage: 10,
  page: 1,
  search: '',
  sortBy: 'createDateTime',
  sortingOrder: 'desc',
  allSearch: '',
}

type LocalOrgs = {
  connectionId: string
  theirLabel: string
  createDateTime: string
}
const ConnectionList = (props: {
  selectConnection: (connections: IConnectionList[]) => void
}): JSX.Element => {
  const [listAPIParameter, setListAPIParameter] = useState(initialPageState)
  const [connectionList, setConnectionList] = useState<IConnectionList[]>([])
  const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [totalItem, setTotalItem] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)

  const selectOrganization = async (
    item: IConnectionList,
    checked: boolean,
  ): Promise<void> => {
    try {
      const index =
        localOrgs?.length > 0
          ? localOrgs.findIndex((ele) => ele.connectionId === item.connectionId)
          : -1

      const { connectionId, theirLabel, createDateTime } = item ?? {}
      if (index === -1) {
        setLocalOrgs((prev: LocalOrgs[]) => [
          ...prev,
          {
            connectionId,
            theirLabel,
            createDateTime,
          },
        ])
      } else {
        const updateLocalOrgs = [...localOrgs]
        if (!checked) {
          updateLocalOrgs.splice(index, 1)
        }
        setLocalOrgs(updateLocalOrgs)
      }
    } catch (error) {
      console.error('SELECTED ORGANIZATION:::', error)
    }
  }

  const getConnections = async (
    apiParameter: IConnectionListAPIParameter,
  ): Promise<void> => {
    setLoading(true)
    try {
      const response = await getConnectionsByOrg({ ...apiParameter, orgId })
      if (!response) {
        return
      }
      const { data } = response
      if (Array.isArray(data)) {
        const { totalItems } = response
        setTotalItem(totalItems)
        setConnectionList(data)
        setError(null)
      } else {
        setConnectionList([])
      }
    } catch (error) {
      setConnectionList([])
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const refreshPage = (): void => {
    setLocalOrgs([])
    getConnections(listAPIParameter)
  }

  useEffect(() => {
    const clearStorageAndRefresh = async (): Promise<void> => {
      refreshPage()
      dispatch(clearSelectedConnection())
      dispatch(clearSelectedUser())
      dispatch(setSelectedConnection([]))
      setConnectionList([])
      setLocalOrgs([])
    }

    clearStorageAndRefresh()
  }, [])

  useEffect(() => {
    props.selectConnection(localOrgs)
  }, [localOrgs])

  useEffect(() => {
    dispatch(setSelectedConnection(localOrgs))
  }, [localOrgs])

  useEffect(() => {
    let getData: NodeJS.Timeout | null = null
    if (listAPIParameter?.search?.length >= 1) {
      getData = setTimeout(() => {
        getConnections(listAPIParameter)
      }, 1000)
      return () => clearTimeout(getData ?? undefined)
    } else {
      getConnections(listAPIParameter)
    }
    return () => clearTimeout(getData ?? undefined)
  }, [listAPIParameter])

  const generateColumns = (): IColumnData[] => [
    {
      id: 'select',
      title: '',
      accessorKey: 'select',
      columnFunction: ['hide'],
      cell: ({ row }) => (
        <SelectCheckboxCell
          connection={row.original}
          getIsSelected={row.getIsSelected}
          getToggleSelectedHandler={row.getToggleSelectedHandler}
          onSelect={selectOrganization}
        />
      ),
    },
    {
      id: 'theirLabel',
      title: 'User',
      accessorKey: 'theirLabel',
      columnFunction: [
        {
          sortCallBack: async (order) =>
            setListAPIParameter((prev) => ({
              ...prev,
              sortBy: 'theirLabel',
              sortingOrder: order,
            })),
        },
      ],
      cell: ({ row }) => <TheirLabelCell label={row.original.theirLabel} />,
    },
    {
      id: 'connectionId',
      title: 'Connection ID',
      accessorKey: 'connectionId',
      columnFunction: [
        {
          sortCallBack: async (order) =>
            setListAPIParameter((prev) => ({
              ...prev,
              sortBy: 'connectionId',
              sortingOrder: order,
            })),
        },
      ],
      cell: ({ row }) => (
        <ConnectionIdCell connectionId={row.original.connectionId} />
      ),
    },
    {
      id: 'createDateTime',
      title: 'Created on',
      accessorKey: 'createDateTime',
      columnFunction: [
        {
          sortCallBack: async (order) =>
            setListAPIParameter((prev) => ({
              ...prev,
              sortBy: 'createDateTime',
              sortingOrder: order,
            })),
        },
      ],
      cell: ({ row }) => <CreatedOnCell date={row.original.createDateTime} />,
    },
  ]
  const metadata: ITableMetadata = {
    enableSelection: false,
  }
  const columns = getColumns<IConnectionList>({
    metadata,
    columnData: generateColumns(),
  })

  return (
    <div id=" issuance_connection_list" className="px-4">
      <div
        className="mb-4 flex items-center justify-between"
        id="issued-credentials-list"
      ></div>
      {error && (
        <AlertComponent
          message={JSON.stringify(error)}
          type={'failure'}
          onAlertClose={() => {
            setError(null)
          }}
        />
      )}

      <DataTable
        placeHolder="Search Connections"
        data={connectionList}
        columns={columns}
        index="connectionId"
        isLoading={loading}
        pageIndex={listAPIParameter.page - 1}
        pageSize={listAPIParameter.itemPerPage}
        pageCount={Math.ceil(totalItem / listAPIParameter.itemPerPage)}
        onPageChange={(index) =>
          setListAPIParameter((prev) => ({ ...prev, page: index + 1 }))
        }
        onPageSizeChange={(size) =>
          setListAPIParameter((prev) => ({
            ...prev,
            itemPerPage: size,
            page: 1,
          }))
        }
        onSearchTerm={(term) =>
          setListAPIParameter((prev) => ({
            ...prev,
            search: term,
            page: 1,
          }))
        }
      />
    </div>
  )
}

export default ConnectionList
