'use client'

import { IConnectionList, LocalOrgs } from '../type/interface'
import {
  IConnectionListAPIParameter,
  getConnectionsByOrg,
} from '@/app/api/connection'
import {
  ITableMetadata,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { JSX, useEffect, useState } from 'react'
import {
  resetSelectedConnections,
  resetSelectedUser,
  setSelectedConnections,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import DateTooltip from '@/components/DateTooltip'
import { ITableData } from '@/components/DataTable/interface'
import { dateConversion } from '@/utils/DateConversion'
import { generateColumns } from './ConnectionHelperData'

const initialPageState = {
  itemPerPage: 10,
  page: 1,
  search: '',
  sortBy: 'createDateTime',
  sortingOrder: 'desc',
  allSearch: '',
}

const ConnectionList = (props: {
  selectConnection: (connections: IConnectionList[]) => void
}): JSX.Element => {
  const [connectionList, setConnectionList] = useState<IConnectionList[]>([])
  const [, setConnectionsTableData] = useState<ITableData[]>([])
  const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([])
  const [selectedConnectionList, setSelectedConnectionList] = useState<
    IConnectionList[]
  >([])

  const [listAPIParameter, setListAPIParameter] =
    useState<IConnectionListAPIParameter>(initialPageState)
  const [totalItem, setTotalItem] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [, setPageInfo] = useState({
    totalItem: 0,
    nextPage: 0,
    lastPage: 0,
  })

  const dispatch = useAppDispatch()
  const selectedConnections = useAppSelector(
    (state) => state.verification.selectedConnections,
  )

  const orgId = useAppSelector((state) => state.organization.orgId)

  const extractConnectionFields = (
    item: IConnectionList,
  ): { connectionId: string; theirLabel: string; createDateTime: string } => {
    const connectionId = item?.connectionId || 'Not available'
    const theirLabel = item?.theirLabel || 'Not available'
    const createDateTime = item?.createDateTime || 'Not available'
    return { connectionId, theirLabel, createDateTime }
  }

  const isConnectionChecked = (connectionId: string): boolean =>
    localOrgs.map((item) => item.connectionId).includes(connectionId)

  const selectOrganization = async (
    item: IConnectionList,
    checked: boolean,
  ): Promise<void> => {
    try {
      const { connectionId, theirLabel, createDateTime } =
        extractConnectionFields(item)
      const index =
        localOrgs?.findIndex((ele) => ele.connectionId === connectionId) ?? -1

      if (index === -1) {
        setLocalOrgs((prev: LocalOrgs[]) => [
          ...prev,
          { connectionId, theirLabel, createDateTime },
        ])
      } else if (!checked) {
        const updateLocalOrgs = [...localOrgs]
        updateLocalOrgs.splice(index, 1)
        setLocalOrgs(updateLocalOrgs)
      }
    } catch (error) {
      console.error('SELECTED ORGANIZATION:::', error)
    }
  }
  const renderCheckbox = (
    ele: IConnectionList,
    isChecked: boolean,
    connections: IConnectionList[],
  ): JSX.Element => (
    <div className="flex items-center" id="issuance_checkbox">
      <input
        id="default-checkbox"
        type="checkbox"
        name="connection"
        defaultChecked={ele.checked || isChecked}
        onClick={async (event: React.MouseEvent) => {
          const inputElement = event.target as HTMLInputElement

          const updateConnectionList = connections.map((item) => {
            if (item.connectionId === ele.connectionId) {
              selectOrganization(item, inputElement.checked)
              return {
                ...item,
                checked: inputElement.checked,
              }
            }
            return item
          })
          setConnectionList(updateConnectionList)
        }}
        className="h-4 w-4 cursor-pointer rounded-lg"
      />
    </div>
  )
  const generateTable = async (
    connections: IConnectionList[],
  ): Promise<void> => {
    try {
      const connectionsData =
        connections?.length > 0
          ? connections.map((ele: IConnectionList) => {
              const { connectionId, theirLabel, createDateTime } =
                extractConnectionFields(ele)
              const isChecked = isConnectionChecked(connectionId)

              return {
                data: [
                  { data: renderCheckbox(ele, isChecked, connections) },
                  { data: theirLabel },
                  { data: connectionId },

                  {
                    data: (
                      <DateTooltip date={createDateTime}>
                        <div> {dateConversion(createDateTime)}</div>
                      </DateTooltip>
                    ),
                  },
                ],
              }
            })
          : []

      setConnectionsTableData(connectionsData)
    } catch (err) {
      console.error('Error generating table:', err)
    }
  }

  useEffect(() => {
    props.selectConnection(localOrgs)
  }, [localOrgs])

  useEffect(() => {
    generateTable(connectionList)
  }, [connectionList, localOrgs])

  const updateLocalOrgs = async (): Promise<void> => {
    const selectedOrg = selectedConnections || []
    setLocalOrgs(selectedOrg)
  }

  useEffect(() => {
    ;(async (): Promise<void> => {
      dispatch(setSelectedConnections(localOrgs))
    })()
  }, [localOrgs])

  const getConnectionsVerification = async (
    apiParameter: IConnectionListAPIParameter,
  ): Promise<void> => {
    try {
      const response = await getConnectionsByOrg({
        ...apiParameter,
        orgId,
      })

      if (response && typeof response === 'object') {
        const {
          totalItems,
          nextPage,
          lastPage,
          data: connectionsDataByOrgId,
        } = response

        setPageInfo({
          totalItem: totalItems,
          nextPage,
          lastPage,
        })

        setConnectionList(connectionsDataByOrgId)
        setTotalItem(totalItems)
        setError(null)
      } else {
        setConnectionList([])
        setError('Failed to fetch connections.')
      }
    } catch (error) {
      setConnectionList([])
      setError((error as Error).message)
    }
  }
  useEffect(() => {
    let getConnectionsData: NodeJS.Timeout | null = null

    if (listAPIParameter?.search?.length >= 1) {
      getConnectionsData = setTimeout(() => {
        getConnectionsVerification(listAPIParameter)
      }, 1000)

      return (): void => {
        if (getConnectionsData !== null) {
          clearTimeout(getConnectionsData)
        }
      }
    } else {
      getConnectionsVerification(listAPIParameter)
    }

    return (): void => {
      if (getConnectionsData !== null) {
        clearTimeout(getConnectionsData)
      }
    }
  }, [listAPIParameter])

  useEffect(() => {
    let getConnectionsData: ReturnType<typeof setTimeout> | null = null
    updateLocalOrgs()
    if (listAPIParameter?.search?.length >= 1) {
      getConnectionsData = setTimeout(() => {
        getConnectionsVerification(listAPIParameter)
      }, 1000)
      return (): void => clearTimeout(getConnectionsData!)
    } else {
      getConnectionsVerification(listAPIParameter)
    }
    return (): void => clearTimeout(getConnectionsData!)
  }, [listAPIParameter])

  useEffect(() => {
    updateLocalOrgs()
  }, [])

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const columns = getColumns<IConnectionList>({
    metadata,
    columnData: generateColumns(setListAPIParameter, selectOrganization),
  })

  const refreshPage = (): void => {
    setSelectedConnectionList([])
    getConnectionsVerification(listAPIParameter)
  }

  useEffect(() => {
    props.selectConnection(selectedConnectionList)
  }, [selectedConnectionList])

  useEffect(() => {
    const clearStorageAndRefresh = async (): Promise<void> => {
      refreshPage()
      setLocalOrgs([])
      dispatch(resetSelectedConnections())
      dispatch(resetSelectedUser())
    }

    clearStorageAndRefresh()
  }, [])

  return (
    <div id="verification_connection_list">
      <div
        className="mb-4 flex items-center justify-between"
        id="verification-list"
      >
        <h1 className="ml-1 text-xl font-semibold">Connection List</h1>
      </div>
      <AlertComponent
        message={error}
        type={'failure'}
        onAlertClose={() => {
          setError(null)
        }}
      />
      <DataTable
        placeHolder="Search Connections"
        data={connectionList}
        columns={columns}
        index="connectionId"
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
