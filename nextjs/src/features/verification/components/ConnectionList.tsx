'use client'

import { ChangeEvent, JSX, useEffect, useState } from 'react'
import { IConnectionList, LocalOrgs } from '../type/interface'
import {
  IConnectionListAPIParameter,
  getConnectionsByOrg,
} from '@/app/api/connection'
import {
  resetSelectedConnections,
  resetSelectedUser,
  setSelectedConnections,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import DateTooltip from '@/components/DateTooltip'
import { ITableData } from '@/components/DataTable/interface'
import SortDataTable from './SortDataTable'
import { dateConversion } from '@/utils/DateConversion'

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
  const [connectionsTableData, setConnectionsTableData] = useState<
    ITableData[]
  >([])
  const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedConnectionList, setSelectedConnectionList] = useState<
    IConnectionList[]
  >([])

  const [loading, setLoading] = useState<boolean>(false)
  const [listAPIParameter, setListAPIParameter] =
    useState<IConnectionListAPIParameter>(initialPageState)
  const [totalItem, setTotalItem] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState({
    totalItem: 0,
    nextPage: 0,
    lastPage: 0,
  })

  const dispatch = useAppDispatch()
  const selectedConnections = useAppSelector(
    (state) => state.verification.selectedConnections,
  )

  const orgId = useAppSelector((state) => state.organization.orgId)

  const searchInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target
    setSearchText(value)
    setListAPIParameter({
      ...listAPIParameter,
      search: value,
      page: 1,
    })
  }

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
    setLoading(true)
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
        // If API returned void or unexpected structure
        setConnectionList([])
        setError('Failed to fetch connections.')
      }
    } catch (error) {
      setConnectionList([])
      setError((error as Error).message)
    } finally {
      setLoading(false)
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

  const verificationHeader = [
    { columnName: '', width: 'w-0.5' },
    { columnName: 'User' },
    { columnName: 'Connection ID' },
    { columnName: 'Created on' },
  ]

  const searchSortByValue = (value: string): void => {
    setListAPIParameter({
      ...listAPIParameter,
      page: 1,
      sortingOrder: value,
    })
  }

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
      <SortDataTable
        onInputChange={searchInputChange}
        searchValue={searchText}
        refresh={refreshPage}
        header={verificationHeader}
        data={connectionsTableData}
        loading={loading}
        currentPage={listAPIParameter?.page}
        onPageChange={(page: number) => {
          setListAPIParameter((prevState) => ({
            ...prevState,
            page,
          }))
        }}
        totalPages={Math.ceil(totalItem / listAPIParameter?.itemPerPage)}
        pageInfo={pageInfo}
        searchSortByValue={searchSortByValue}
        isHeader={true}
        isSearch={true}
        isRefresh={true}
        isSort={true}
        isPagination={true}
        message={'No Connections'}
        discription={'You dont have any connections yet'}
      ></SortDataTable>
    </div>
  )
}

export default ConnectionList
