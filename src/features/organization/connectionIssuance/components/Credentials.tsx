'use client'

import {
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
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { CellContext } from '@tanstack/react-table'
import { ConnectionApiSortFields } from '@/features/connections/types/connections-interface'
import { DataTable } from '../../../../components/ui/generic-table-component/data-table'
import { DidMethod } from '@/features/common/enum'
import { Features } from '@/common/enums'
import { ISidebarSliderData } from '@/features/schemas/type/schemas-interface'
import { IssuedCredential } from '../type/Issuance'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { RefreshCw } from 'lucide-react'
import RoleViewButton from '@/components/RoleViewButton'
import SidePanelComponent from '@/config/SidePanelCommon'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getIssuedCredentials } from '@/app/api/Issuance'
import { getOrganizationById } from '@/app/api/organization'
import { issuanceSvgComponent } from '@/config/svgs/issuanceSvgComponent'
import { pathRoutes } from '@/config/pathRoutes'
import { resetSchemaDetails } from '@/lib/schemaStorageSlice'
import { useRouter } from 'next/navigation'

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
  searchTerm: string
  sortBy: string
  sortOrder: SortActions
}

const connectionIdCell = ({
  row,
  setSelectedFields,
  setIsDrawerOpen,
}: {
  row: CellContext<IssuedCredential, unknown>['row']
  setSelectedFields: React.Dispatch<React.SetStateAction<ISidebarSliderData[]>>
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element => (
  <button
    className="url-link"
    onClick={() => {
      setSelectedFields(() => {
        const data = [
          {
            label: 'Credential Exchange Id',
            value: row.original.credentialExchangeId,
            copyable: true,
          },
          {
            label: 'Issued To',
            value: row.original.connections?.theirLabel || 'Not Available',
          },
          {
            label: 'Schema Name',
            value: row.original.schemaName || 'Not Available',
          },
          {
            label: 'Schema Id',
            value: row.original.schemaId || 'Not Available',
            copyable: true,
          },
          {
            label: 'Issued On',
            value: row.original.createDateTime ? (
              <DateCell date={row.original.createDateTime} />
            ) : (
              'Not Available'
            ),
            copyable: true,
          },
          {
            label: 'Status',
            value: <StatusCellForCredential state={row.original.state} />,
            copyable: true,
          },
          {
            label: 'Connection Id',
            value: row.original.connectionId || 'Not Available',
            copyable: true,
          },
        ]
        return data
      })
      setIsDrawerOpen(true)
    }}
  >
    {row.original.connections
      ? row.original.connections.theirLabel
      : 'Not Available'}
  </button>
)

const schemaName = ({
  row,
  isW3C,
}: {
  row: CellContext<IssuedCredential, unknown>['row']
  isW3C: boolean
}): JSX.Element => (
  <SchemaNameCell
    schemaName={row.original.schemaName}
    schemaId={row.original.schemaId}
    isW3C={isW3C}
  />
)

const createdDateCell = ({
  row,
}: {
  row: { original: { createDateTime: string } }
}): JSX.Element => <DateCell date={row.original.createDateTime} />

const stateCell = ({
  row,
}: {
  row: { original: { state: string } }
}): JSX.Element => <StatusCellForCredential state={row.original.state} />

const Credentials = (): JSX.Element => {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [issuedCredList, setIssuedCredList] = useState<IssuedCredential[]>([])
  const [walletCreated, setWalletCreated] = useState(false)
  const [isW3C, setIsW3C] = useState(false)
  const [reloading, setReloading] = useState<boolean>(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [fields, setSelectedFields] = useState<ISidebarSliderData[]>([])
  const dispatch = useAppDispatch()

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
    setIsIssuing(true)
    try {
      dispatch(resetSchemaDetails())
      router.push(pathRoutes.organizations.Issuance.issue)
    } finally {
      setIsIssuing(false)
    }
  }

  const getIssuedCredDefs = async (
    isReload: boolean = false,
  ): Promise<void> => {
    if (isReload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

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
      if (isReload) {
        setReloading(false)
      } else {
        setLoading(false)
      }
    }
  }
  const handleReload = async (): Promise<void> => {
    await getIssuedCredDefs(true)
  }

  useEffect(() => {
    if (!orgId) {
      setLoading(false)
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
      cell: (row) =>
        connectionIdCell({ ...row, setSelectedFields, setIsDrawerOpen }),
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
      cell: (row) => schemaName({ ...row, isW3C }),
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
      cell: createdDateCell,
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
      cell: stateCell,
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
          <div className="flex items-center gap-2">
            {/* Reload Button */}
            <button
              onClick={handleReload}
              disabled={reloading}
              title="Reload table data"
              className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${reloading ? 'animate-spin' : ''}`}
              />
            </button>

            {/* Issue Button */}
            <RoleViewButton
              buttonTitle={isIssuing ? 'Issuing...' : 'Issue'}
              feature={Features.ISSUANCE}
              svgComponent={isIssuing ? <Loader /> : issuanceSvgComponent()}
              onClickEvent={schemeSelection}
              loading={isIssuing}
            />
          </div>
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

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <DataTable
          isLoading={loading}
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
      <SidePanelComponent
        title={'Credential Details'}
        description={'Detailed view of the selected credential'}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        fields={fields}
      />
    </PageContainer>
  )
}

export default Credentials
