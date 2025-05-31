'use client'

import type {
  IConnectionList,
  ITableData,
  ITableHtml,
} from '../type/Connections'

import {
  type IConnectionListAPIParameter,
  getConnectionsByOrg,
} from '@/app/api/connection'
import React, { ChangeEvent, JSX, useEffect, useState } from 'react'
import {
  clearSelectedConnection,
  clearSelectedUser,
  setSelectedConnection,
} from '@/lib/storageKeys'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { AlertComponent } from '@/components/AlertComponent'
import { Card } from '@/components/ui/card'
import DateTooltip from '@/components/DateTooltip'

import NewDataTable from './connectionsTables/SortDataTable'
import { RootState } from '@/lib/store'
import { dateConversion } from '@/utils/DateConversion'

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
  const [tableData, setTableData] = useState<ITableData[] | ITableHtml[]>([])
  const [connectionList, setConnectionList] = useState<IConnectionList[]>([])
  const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [totalItem, setTotalItem] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState({
    totalItem: 0,
    nextPage: 0,
    lastPage: 0,
  })
  const dispatch = useAppDispatch()
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)
  useEffect(() => {
    setTableData([])
  }, [])

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

  const generateTable = async (
    connections: IConnectionList[],
  ): Promise<void> => {
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

              const isChecked = localOrgs
                .map((item) => item.connectionId)
                .includes(ele.connectionId)

              return {
                data: [
                  {
                    data: (
                      <div className="flex items-center" id="issuance_checkbox">
                        <input
                          id="default-checkbox"
                          type="checkbox"
                          name="connection"
                          defaultChecked={ele.checked || isChecked}
                          onClick={async (
                            event: React.MouseEvent<HTMLInputElement>,
                          ) => {
                            const inputElement =
                              event.target as HTMLInputElement

                            const updateConnectionList = connections?.map(
                              (item) => {
                                if (item.connectionId === ele.connectionId) {
                                  selectOrganization(item, inputElement.checked)
                                  return {
                                    ...item,
                                    checked: inputElement.checked,
                                  }
                                }
                                return item
                              },
                            )
                            setConnectionList(updateConnectionList)
                          }}
                          // checked={ele.checked || isChecked}
                          className="h-4 w-4 cursor-pointer rounded-lg border-gray-300 bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                        />
                      </div>
                    ),
                  },
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

      setTableData(connectionsData)
    } catch (err) {
      console.error('Error in Connection List', err)
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
        const { totalItems, nextPage, lastPage } = response
        setTotalItem(totalItems)
        setPageInfo({
          totalItem: Number(totalItems),
          nextPage: Number(nextPage),
          lastPage: Number(lastPage),
        })
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

  const header = [
    { columnName: '', width: 'w-0.5' },
    { columnName: 'User' },
    { columnName: 'Connection ID' },
    { columnName: 'Created on' },
  ]

  //onChange of Search input text
  const searchInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
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
    generateTable(connectionList)
  }, [connectionList, localOrgs])

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

  return (
    <div id=" issuance_connection_list" className="px-4">
      <div
        className="mb-4 flex items-center justify-between"
        id="issued-credentials-list"
      >
      </div>
      {error && (
        <AlertComponent
          message={JSON.stringify(error)}
          type={'failure'}
          onAlertClose={() => {
            setError(null)
          }}
        />
      )}
      <Card className="p-1">
        <NewDataTable
          isHeader={true}
          searchValue={searchText}
          isSearch={true}
          isRefresh={true}
          isSort={true}
          onInputChange={searchInputChange}
          refresh={refreshPage}
          header={header}
          data={tableData}
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
          message={'No Connections'}
          discription={'You don"t have any connections yet'}
        ></NewDataTable>
      </Card>
    </div>
  )
}

export default ConnectionList
