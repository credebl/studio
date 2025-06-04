'use client'

import {
  ConnectionIdCell,
  DateCell,
  SchemaNameCell,
  StatusCellForCredential,
} from './CredentialTableCells'
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
import { DidMethod } from '@/features/common/enum'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import { Features } from '@/common/enums'
import { IssuedCredential } from '../type/Issuance'
import PageContainer from '@/components/layout/page-container'
import RoleViewButton from '@/components/RoleViewButton'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getIssuedCredentials } from '@/app/api/Issuance'
import { getOrganizationById } from '@/app/api/organization'
import { issuanceSvgComponent } from '@/config/svgs/issuanceSvgComponent'
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
      if (!orgDid) {
        setWalletCreated(false)
        return
      }
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
      cell: ({ row }) => (
        <ConnectionIdCell connectionId={row.original.connectionId} />
      ),
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
      cell: ({ row }) => (
        <SchemaNameCell
          schemaName={row.original.schemaName}
          schemaId={row.original.schemaId}
          isW3C={isW3C}
        />
      ),
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
      cell: ({ row }) => <DateCell date={row.original.createDateTime} />,
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
      cell: ({ row }) => <StatusCellForCredential state={row.original.state} />,
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

      {error && (
        <AlertComponent
          message={typeof error === 'string' ? error : 'Something Went Wrong'}
          type={'failure'}
          onAlertClose={() => {
            setError(null)
          }}
        />
      )}

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
