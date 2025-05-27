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
import { ConnectionApiSortFields } from '@/features/connections/types/connections-interface'
import { DataTable } from '../../../../components/ui/generic-table-component/data-table'
import DateTooltip from '@/components/DateTooltip'
import { DidMethod } from '@/features/common/enum'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import { IssuedCredential } from '../type/Issuance'
import PageContainer from '@/components/layout/page-container'
import RoleViewButton from '@/components/RoleViewButton'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { getIssuedCredentials } from '@/app/api/Issuance'
import { getOrganizationById } from '@/app/api/organization'
import { issuanceSvgComponent } from '@/config/issuanceSvgComponent'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
  searchTerm: string
  sortBy: string
  sortOrder: SortActions
}

const Credentials = (): JSX.Element => {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [issuedCredList, setIssuedCredList] = useState<IssuedCredential[]>([])
  const [walletCreated, setWalletCreated] = useState(false)
  const [isW3C, setIsW3C] = useState(false)

  // Consolidated pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

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

      if (
        orgDid.includes(DidMethod.POLYGON) ||
        orgDid.includes(DidMethod.KEY) ||
        orgDid.includes(DidMethod.WEB)
      ) {
        setIsW3C(true)
      } else {
        setIsW3C(false)
      }

      if (orgId && isWalletCreated) {
        const response = await getIssuedCredentials({
          itemPerPage: pagination.pageSize,
          page: pagination.pageIndex + 1,
          search: pagination.searchTerm,
          sortBy: pagination.sortBy,
          sortingOrder: pagination.sortOrder,
          orgId,
        })

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setIssuedCredList(data?.data?.data ?? [])
          setPagination((prev) => ({
            ...prev,
            pageCount: data?.data.lastPage ?? 1,
          }))
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
  }, [
    orgId,
    pagination.pageIndex,
    pagination.pageSize,
    pagination.sortBy,
    pagination.searchTerm,
    pagination.sortOrder,
  ])

  useEffect(() => {
    if (!orgId) {
      return
    }
    // Reset all params when org changes
    setPagination({
      pageIndex: 0,
      pageSize: 10,
      pageCount: 1,
      searchTerm: '',
      sortBy: 'createDateTime',
      sortOrder: 'desc',
    })
  }, [orgId])

  const columnData: IColumnData[] = [
    {
      id: 'credentialExchangeId',
      title: 'credential Exchange Id',
      accessorKey: 'credentialExchangeId',
      columnFunction: [
        'hide',
        {
          sortCallBack: async (order): Promise<void> => {
            setPagination((prev) => ({
              ...prev,
              sortBy: 'credentialExchangeId',
              sortOrder: order,
            }))
          },
        },
      ],
    },
    {
      id: 'connectionId',
      title: 'Issued to',
      accessorKey: 'connectionId',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPagination((prev) => ({
              ...prev,
              sortBy: 'connectionId',
              sortOrder: order,
            }))
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
      id: 'schemaName',
      title: 'Schema Name',
      accessorKey: 'schemaName',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPagination((prev) => ({
              ...prev,
              sortBy: 'schemaName',
              sortOrder: order,
            }))
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
        const { schemaName, schemaId } = row.original

        if (!schemaName) {
          return (
            <span className="text-muted-foreground text-sm">Not Available</span>
          )
        }

        return (
          <a
            onClick={() => {
              if (schemaId && !isW3C) {
                router.push(`/organizations/schemas/${schemaId}`)
              } else {
                router.push('/organizations/schemas')
              }
            }}
            className="text-primary-600 cursor-pointer text-sm hover:underline"
            role="button"
          >
            {schemaName}
          </a>
        )
      },
    },

    {
      id: 'createDateTime',
      title: 'Issued On',
      accessorKey: 'createDateTime',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPagination((prev) => ({
              ...prev,
              sortBy: ConnectionApiSortFields.CREATE_DATE_TIME,
              sortOrder: order,
            }))
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
        const rawDate: string = row.original.createDateTime
        const safeDate = rawDate || new Date().toISOString()

        return (
          <DateTooltip date={safeDate}>
            <span className="text-muted-foreground text-sm">
              {dateConversion(safeDate)}
            </span>
          </DateTooltip>
        )
      },
    },
    {
      id: 'state',
      title: 'Status',
      accessorKey: 'state',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setPagination((prev) => ({
              ...prev,
              sortBy: 'state',
              sortOrder: order,
            }))
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
        const { state } = row.original
        return (
          <span
            className={`${
              state === IssueCredential.offerSent
                ? 'badges-warning text-foreground'
                : state === IssueCredential.done
                  ? 'badges-success text-foreground'
                  : state === IssueCredential.abandoned
                    ? 'badges-error text-foreground'
                    : state === IssueCredential.requestReceived
                      ? 'bg-primary text-foreground'
                      : state === IssueCredential.proposalReceived
                        ? 'status-proposal-received'
                        : 'badges-secondary text-foreground'
            } mr-0.5 flex w-fit items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium`}
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
            Here&apos;s a list of issued credentials
          </p>
        </div>
        {walletCreated && (
          <RoleViewButton
            buttonTitle="Issue"
            feature={Features.ISSUANCE}
            svgComponent={issuanceSvgComponent()}
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
            placeHolder="Filter by Connection Id and Schema Name"
            data={issuedCredList}
            columns={column}
            index={'credentialExchangeId'}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={pagination.pageCount}
            onPageChange={(index) =>
              setPagination((prev) => ({ ...prev, pageIndex: index }))
            }
            onPageSizeChange={(size) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: size,
                pageIndex: 0,
              }))
            }}
            onSearchTerm={(term) =>
              setPagination((prev) => ({ ...prev, searchTerm: term }))
            }
          />
        </div>
      )}
    </PageContainer>
  )
}

export default Credentials
