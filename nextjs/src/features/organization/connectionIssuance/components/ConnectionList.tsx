'use client'

import {
  type IConnectionListAPIParameter,
  getConnectionsByOrg,
} from '@/app/api/connection'
import {
  ITableMetadata,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
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
import { generateColumns } from '@/features/verification/components/ConnectionHelperData'

const initialPageState = {
  itemPerPage: 10,
  page: 1,
  search: '',
  sortBy: 'createDateTime',
  sortingOrder: 'desc',
}

type LocalOrgs = {
  connectionId: string
  theirLabel: string
  createDateTime: string
}
const ConnectionList = (props: {
  selectConnection: (connections: IConnectionList[]) => void
}): JSX.Element => {
  const [listAPIParameterIssuance, setListAPIParameterIssuance] =
    useState(initialPageState)
  const [connectionListIssuance, setConnectionListIssuance] = useState<
    IConnectionList[]
  >([])
  const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([])
  const [loadingIssuance, setLoadingIssuance] = useState<boolean>(false)
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
    setLoadingIssuance(true)
    try {
      const response = await getConnectionsByOrg({ ...apiParameter, orgId })
      if (!response) {
        return
      }
      const { data } = response
      if (Array.isArray(data)) {
        const { totalItems } = response
        setTotalItem(totalItems)
        setConnectionListIssuance(data)
        setError(null)
      } else {
        setConnectionListIssuance([])
      }
    } catch (error) {
      setConnectionListIssuance([])
      setError(error as string)
    } finally {
      setLoadingIssuance(false)
    }
  }

  const refreshPage = (): void => {
    setLocalOrgs([])
  }

  useEffect(() => {
    const clearStorageAndRefresh = async (): Promise<void> => {
      refreshPage()
      dispatch(clearSelectedConnection())
      dispatch(clearSelectedUser())
      dispatch(setSelectedConnection([]))
      setConnectionListIssuance([])
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
    if (listAPIParameterIssuance?.search?.length >= 1) {
      getData = setTimeout(() => {
        getConnections(listAPIParameterIssuance)
      }, 1000)
      return () => clearTimeout(getData ?? undefined)
    } else {
      getConnections(listAPIParameterIssuance)
    }
    return () => clearTimeout(getData ?? undefined)
  }, [listAPIParameterIssuance])

  const metadata: ITableMetadata = {
    enableSelection: false,
  }
  const columnsIssuance = getColumns<IConnectionList>({
    metadata,
    columnData: generateColumns(
      setListAPIParameterIssuance,
      selectOrganization,
    ),
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
        placeHolder="Search Connections ..."
        data={connectionListIssuance}
        columns={columnsIssuance}
        index="connectionId"
        isLoading={loadingIssuance}
        pageIndex={listAPIParameterIssuance.page - 1}
        pageSize={listAPIParameterIssuance.itemPerPage}
        pageCount={Math.ceil(totalItem / listAPIParameterIssuance.itemPerPage)}
        onPageChange={(index) =>
          setListAPIParameterIssuance((prev) => {
            const newPage = index + 1
            if (prev.page === newPage) {
              return prev
            }
            return { ...prev, page: newPage }
          })
        }
        onPageSizeChange={(size) =>
          setListAPIParameterIssuance((prev) => {
            if (prev.itemPerPage === size && prev.page === 1) {
              return prev
            }
            return { ...prev, itemPerPage: size, page: 1 }
          })
        }
        onSearchTerm={(term) =>
          setListAPIParameterIssuance((prev) => {
            if (prev.search === term && prev.page === 1) {
              return prev
            }
            return { ...prev, search: term, page: 1 }
          })
        }
      />
    </div>
  )
}

export default ConnectionList
