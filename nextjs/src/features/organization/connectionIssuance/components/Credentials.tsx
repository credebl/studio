'use client'

import {
  Features,
  IssueCredential,
  IssueCredentialUserText,
} from '@/common/enums'
import {
  IConnectionListAPIParameter,
  getIssuedCredentials,
} from '@/app/api/Issuance'
import React, { ChangeEvent, JSX, useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import DateTooltip from '@/components/DateTooltip'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import { ITableData } from '../type/Connections'
import { IssuedCredential } from '../type/Issuance'
import RoleViewButton from '@/components/RoleViewButton'
import { RootState } from '@/lib/store'
import SortDataTable from './connectionsTables/SortDataTable'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

const Credentials = (): JSX.Element => {
  const initialPageState = {
    itemPerPage: 10,
    page: 1,
    search: '',
    sortBy: 'createDateTime',
    sortingOrder: 'desc',
    allSearch: '',
    orgId: '',
  }
  const router = useRouter()

  const schemeSelection = async (): Promise<void> => {
    router.push(pathRoutes.organizations.Issuance.issue)
  }
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [issuedCredList, setIssuedCredList] = useState<ITableData[]>([])
  const [walletCreated, setWalletCreated] = useState(false)
  const [listAPIParameter, setListAPIParameter] =
    useState<IConnectionListAPIParameter>(initialPageState)
  const [totalItem, setTotalItem] = useState(0)
  const [pageInfo, setPageInfo] = useState({
    totalItem: 0,
    nextPage: 0,
    lastPage: 0,
  })
  const [searchText, setSearchText] = useState('')
  const orgId = useSelector((state: RootState) => state.organization.orgId)

  const getIssuedCredDefs = async (
    listAPIParameter: IConnectionListAPIParameter,
  ): Promise<void> => {
    setLoading(true)
    try {
      const response = (await getOrganizationById(orgId)) as AxiosResponse
      const { data } = response
      const orgDid = data?.data?.org_agents[0]?.orgDid
      const isWalletCreated = Boolean(orgDid)
      setWalletCreated(isWalletCreated)

      if (orgId && isWalletCreated) {
        const response = await getIssuedCredentials({
          ...listAPIParameter,
          orgId,
        })
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setTotalItem(data?.data.totalItems)
          const { totalItems, nextPage, lastPage } = data.data

          setPageInfo({
            totalItem: Number(totalItems),
            nextPage: Number(nextPage),
            lastPage: Number(lastPage),
          })
          const credentialList = data?.data?.data?.map(
            (issuedCredential: IssuedCredential) => {
              const schemaName = issuedCredential?.schemaName ?? 'Not available'
              return {
                data: [
                  {
                    data: issuedCredential.connectionId
                      ? issuedCredential.connectionId
                      : 'Not available',
                  },
                  { data: schemaName },
                  {
                    data: (
                      <DateTooltip date={issuedCredential.createDateTime}>
                        <div>
                          {' '}
                          {dateConversion(issuedCredential.createDateTime)}{' '}
                        </div>
                      </DateTooltip>
                    ),
                  },
                  {
                    data: (
                      <span
                        className={` ${
                          issuedCredential.state ===
                            IssueCredential.offerSent &&
                          'border border-orange-100 bg-orange-100 text-orange-800 dark:border-orange-300 dark:bg-gray-700 dark:text-orange-300'
                        } ${
                          issuedCredential?.state === IssueCredential.done &&
                          'border border-green-100 bg-green-100 text-green-800 dark:border-green-500 dark:bg-gray-700 dark:text-green-400'
                        } ${
                          issuedCredential?.state ===
                            IssueCredential.abandoned &&
                          'border border-red-100 bg-red-100 text-red-800 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
                        } ${
                          issuedCredential?.state ===
                            IssueCredential.requestReceived &&
                          'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 mr-2 rounded px-2.5 py-0.5 text-sm font-medium'
                        } ${
                          issuedCredential?.state ===
                            IssueCredential.proposalReceived &&
                          'bg-secondary-700 text-primary-600 border-secondary-100 dark:border-secondary-700 dark:text-secondary-800 border dark:bg-gray-700'
                        } ${
                          issuedCredential?.state ===
                            IssueCredential.credentialIssued &&
                          'text-primary-900 border border-sky-100 bg-sky-300 dark:border-sky-700 dark:bg-gray-700 dark:text-sky-500'
                        } mr-0.5 flex w-fit items-center justify-center rounded-md border px-0.5 px-2 py-0.5 text-xs font-medium`}
                      >
                        {issuedCredential.state === IssueCredential.offerSent
                          ? IssueCredentialUserText.offerSent
                          : issuedCredential.state === IssueCredential.done
                            ? IssueCredentialUserText.done
                            : issuedCredential.state ===
                                IssueCredential.abandoned
                              ? IssueCredentialUserText.abandoned
                              : issuedCredential.state ===
                                  IssueCredential.requestReceived
                                ? IssueCredentialUserText.received
                                : issuedCredential.state ===
                                    IssueCredential.proposalReceived
                                  ? IssueCredentialUserText.proposalReceived
                                  : IssueCredentialUserText.credIssued}
                      </span>
                    ),
                  },
                ],
              }
            },
          )
          setIssuedCredList(credentialList)
          setError(null)
        } else {
          setIssuedCredList([])
        }
      }
    } catch (error) {
      setIssuedCredList([])
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let getData: NodeJS.Timeout | null = null

    if (listAPIParameter.search.length >= 1) {
      getData = setTimeout(() => {
        getIssuedCredDefs(listAPIParameter)
      }, 1000)
      return (): void => clearTimeout(getData ?? undefined)
    } else {
      getIssuedCredDefs(listAPIParameter)
    }

    return (): void => clearTimeout(getData ?? undefined)
  }, [listAPIParameter])

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
    getIssuedCredDefs(listAPIParameter)
  }

  const header = [
    { columnName: 'Connection Id' },
    { columnName: 'Schema Name' },
    { columnName: 'Date' },
    { columnName: 'Status' },
    // { columnName: 'Action' },
  ]
  return (
    <div className="px-4 pt-2">
      <div className="mb-4 flex flex-col flex-wrap justify-between gap-4 sm:flex-row">
        <h1 className="mr-auto ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Credentials
        </h1>
        <div className="flex items-center gap-4">
          {walletCreated && (
            <RoleViewButton
              buttonTitle="Issue"
              feature={Features.ISSUANCE}
              svgComponent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="18"
                  fill="none"
                  viewBox="0 0 27 18"
                  className="mr-1"
                  style={{ height: '20px', width: '30px' }}
                >
                  <path
                    fill="currentColor"
                    d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 5.985-5.48-5.277.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277L15.27 16.57Z"
                  />
                </svg>
              }
              onClickEvent={schemeSelection}
            />
          )}
        </div>
      </div>
      <div>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <AlertComponent
            message={error}
            type={'failure'}
            onAlertClose={() => {
              setError(null)
            }}
          />
          {!walletCreated && !loading ? (
            <div className="flex items-center justify-center">
              <EmptyListMessage
                message={'No Wallet Details Found'}
                description={'The owner is required to create a wallet'}
                buttonContent={''}
              />
            </div>
          ) : (
            <div>
              {issuedCredList && (
                <div
                  className="Flex-wrap"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <SortDataTable
                    onInputChange={searchInputChange}
                    searchValue={searchText}
                    refresh={refreshPage}
                    header={header}
                    data={issuedCredList}
                    loading={loading}
                    currentPage={listAPIParameter?.page}
                    onPageChange={(page: number) => {
                      setListAPIParameter(
                        (prevState: IConnectionListAPIParameter) => ({
                          ...prevState,
                          page,
                        }),
                      )
                    }}
                    totalPages={Math.ceil(
                      totalItem / listAPIParameter?.itemPerPage,
                    )}
                    pageInfo={pageInfo}
                    searchSortByValue={searchSortByValue}
                    isHeader={true}
                    isSearch={true}
                    isRefresh={true}
                    isSort={true}
                    isPagination={true}
                    message={'No Issuance Records'}
                    discription={'You have no issuance record yet'}
                  ></SortDataTable>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Credentials
