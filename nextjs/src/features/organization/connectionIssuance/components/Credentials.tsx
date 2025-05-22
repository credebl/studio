'use client'

import {
  Features,
  IssueCredential,
  IssueCredentialUserText,
} from '@/common/enums'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '../../../../components/ui/generic-table-component/columns'
import React, { JSX, useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { DataTable } from '../../../../components/ui/generic-table-component/data-table'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import { IssuedCredential } from '../type/Issuance'
import PageContainer from '@/components/layout/page-container'
import RoleViewButton from '@/components/RoleViewButton'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getIssuedCredentials } from '@/app/api/Issuance'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const Credentials = (): JSX.Element => {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [issuedCredList, setIssuedCredList] = useState<IssuedCredential[]>([])
  const [walletCreated, setWalletCreated] = useState(false)

  // Table state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createDateTime')
  const [sortOrder, setsortOrder] = useState<SortActions>('desc')

  const schemeSelection = async (): Promise<void> => {
    router.push(pathRoutes.organizations.Issuance.issue)
  }

  const getIssuedCredDefs = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = (await getOrganizationById(orgId)) as AxiosResponse
      const { data } = response
      const orgDid = data?.data?.org_agents[0]?.orgDid
      const isWalletCreated = Boolean(orgDid)
      setWalletCreated(isWalletCreated)

      if (orgId && isWalletCreated) {
        const response = await getIssuedCredentials({
          itemPerPage: pageSize,
          page: pageIndex + 1,
          search: searchTerm,
          sortBy,
          sortingOrder: sortOrder,
          orgId,
        })

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setIssuedCredList(data?.data?.data ?? [])
          setPageCount(data?.data.lastPage ?? 1)
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
    if (!orgId) {
      return
    }
    getIssuedCredDefs()
  }, [orgId, pageIndex, pageSize, sortBy, searchTerm, sortOrder])

  useEffect(() => {
    if (!orgId) {
      return
    }
    // Reset all params when org changes
    setPageIndex(0)
    setPageSize(10)
    setPageCount(1)
    setSortBy('createDateTime')
    setSearchTerm('')
    setsortOrder('desc')
  }, [orgId])

  const columnData: IColumnData[] = [
    {
      id: 'connectionId',
      title: 'Connection Id',
      accessorKey: 'connectionId',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy('connectionId')
            setsortOrder(order)
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
        const { connectionId } = row.original
        return (
          <span className="text-muted-foreground text-sm">
            {connectionId ?? 'Not Available'}
          </span>
        )
      },
    },
    {
      id: 'credentialExchangeId',
      title: 'credentialExchange Id',
      accessorKey: 'credentialExchangeId',
      columnFunction: [
        'hide',
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy('credentialExchangeId')
            setsortOrder(order)
          },
        },
      ],
    },
    {
      id: 'schemaName',
      title: 'Schema Name',
      accessorKey: 'schemaName',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy('schemaName')
            setsortOrder(order)
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
        const { schemaName } = row.original
        return (
          <span className="text-muted-foreground text-sm">
            {schemaName || 'Not Available'}
          </span>
        )
      },
    },

    {
      id: 'createDateTime',
      title: 'createDateTime',
      accessorKey: 'createDateTime',
      columnFunction: [
        'hide',
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy('createDateTime')
            setsortOrder(order)
          },
        },
      ],
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'state',
      title: 'Status',
      accessorKey: 'state',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setSortBy('state')
            setsortOrder(order)
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
        const { state } = row.original
        return (
          <span
            className={` ${
              state === IssueCredential.offerSent &&
              'border border-orange-100 bg-orange-100 text-orange-800 dark:border-orange-300 dark:bg-gray-700 dark:text-orange-300'
            } ${
              state === IssueCredential.done &&
              'border border-green-100 bg-green-100 text-green-800 dark:border-green-500 dark:bg-gray-700 dark:text-green-400'
            } ${
              state === IssueCredential.abandoned &&
              'border border-red-100 bg-red-100 text-red-800 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
            } ${
              state === IssueCredential.requestReceived &&
              'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 mr-2 rounded px-2.5 py-0.5 text-sm font-medium'
            } ${
              state === IssueCredential.proposalReceived &&
              'bg-secondary-700 text-primary-600 border-secondary-100 dark:border-secondary-700 dark:text-secondary-800 border dark:bg-gray-700'
            } ${
              state === IssueCredential.credentialIssued &&
              'text-primary-900 border border-sky-100 bg-sky-300 dark:border-sky-700 dark:bg-gray-700 dark:text-sky-500'
            } mr-0.5 flex w-fit items-center justify-center rounded-md border px-0.5 px-2 py-0.5 text-xs font-medium`}
          >
            {state === IssueCredential.offerSent
              ? IssueCredentialUserText.offerSent
              : state === IssueCredential.done
                ? IssueCredentialUserText.done
                : state === IssueCredential.abandoned
                  ? IssueCredentialUserText.abandoned
                  : state === IssueCredential.requestReceived
                    ? IssueCredentialUserText.received
                    : state === IssueCredential.proposalReceived
                      ? IssueCredentialUserText.proposalReceived
                      : IssueCredentialUserText.credIssued}
          </span>
        )
      },
    },
  ]

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<IssuedCredential>(tableStyling)

  return (
    <PageContainer>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credentials</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of issued credentials!
          </p>
        </div>
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
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <DataTable
            data={issuedCredList}
            columns={column}
            index={'credentialExchangeId'}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={pageCount}
            onPageChange={setPageIndex}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPageIndex(0)
            }}
            onSearchTerm={setSearchTerm}
          />
        </div>
      )}
    </PageContainer>
  )
}

export default Credentials
