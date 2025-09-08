'use client'

import {
  DateCell,
  ProofState,
} from '@/features/organization/connectionIssuance/components/CredentialTableCells'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { ISidebarSliderData, RequestProof } from '../type/interface'
import { JSX, useEffect, useState } from 'react'
import {
  getVerificationList,
  getVerifiedProofDetails,
  verifyPresentation,
} from '@/app/api/verification'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { ConnectionApiSortFields } from '@/features/connections/types/connections-interface'
import { DataTable } from '../../../components/ui/generic-table-component/data-table'
import { Features } from '@/common/enums'
import PageContainer from '@/components/layout/page-container'
import ProofRequest from './ProofRequestPopup'
import { ProofRequestState } from '@/features/common/enum'
import { RefreshCw } from 'lucide-react' // Import refresh icon
import RoleViewButton from '@/components/RoleViewButton'
import SidePanelComponent from '@/config/SidePanelCommon'
import { apiStatusCodes } from '@/config/CommonConstant'
import { decryptValue } from './SchemaListUtils'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { verificationSvgComponent } from '@/config/verificationSvgComponent'

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
  searchTerm: string
  sortBy: string
  sortOrder: SortActions
}

interface ProofStateCellProps {
  state: string
}

const VerificationCredentialList = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null)
  const [verificationList, setVerificationList] = useState<RequestProof[]>([])
  const [isWalletCreated, setIsWalletCreated] = useState(false)
  const [reloading, setReloading] = useState<boolean>(false) // Add reloading state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [fields, setSelectedFields] = useState<ISidebarSliderData[]>([])

  // Modal state
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [requestId, setRequestId] = useState<string>('')
  const [userData, setUserData] = useState(null)
  const [view, setView] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string[]>([])

  // Consolidated pagination state
  const [proofPagination, setProofPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const orgRoles = useAppSelector((state) => state.organization.orgInfo)

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = (await getOrganizationById(orgId)) as AxiosResponse
      const { data } = response
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (
          data?.data?.org_agents?.length > 0 &&
          data?.data?.org_agents[0]?.orgDid
        ) {
          setIsWalletCreated(true)
        }
      }
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const getProofPresentationData = async (proofId: string): Promise<void> => {
    setVerifyLoading(true)
    try {
      const response = await getVerifiedProofDetails(proofId, orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {
        setUserData(data?.data)
      } else {
        setError(response as string)
      }
    } catch (error) {
      setError(error as string)
    } finally {
      setVerifyLoading(false)
    }
  }

  const getVerificationListData = async (
    isReload: boolean = false,
  ): Promise<void> => {
    if (isReload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

    try {
      if (!orgId) {
        setLoading(false)
        return
      }
      const response = await getVerificationList(orgId, {
        itemPerPage: proofPagination.pageSize,
        page: proofPagination.pageIndex + 1,
        search: proofPagination.searchTerm,
        sortBy: proofPagination.sortBy,
        sortingOrder: proofPagination.sortOrder,
      })

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setVerificationList(data?.data?.data ?? [])
        setProofPagination((prev) => ({
          ...prev,
          pageCount: data?.data.lastPage ?? 1,
        }))
      } else {
        setVerificationList([])
      }
    } catch (error) {
      setError(error as string)
    } finally {
      if (isReload) {
        setReloading(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Handle reload button click
  const handleReload = async (): Promise<void> => {
    await getVerificationListData(true)
  }

  const openProofRequestModel = (
    flag: boolean,
    requestId: string,
    state: string,
  ): void => {
    setRequestId(requestId)
    setOpenModal(flag)
    setView(state === 'done')
    if (flag) {
      getProofPresentationData(requestId)
    }
  }

  const ProofStateCell = ({ state }: ProofStateCellProps): JSX.Element => (
    <ProofState state={state} />
  )

  const presentProofById = async (id: string): Promise<void> => {
    try {
      const response = await verifyPresentation(id, orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
        setOpenModal(false)
        setProofReqSuccess(data.message)
        await getVerificationListData()
      } else {
        setError(response as string)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error presenting proof:', error.message)
        setError(error.message)
      } else {
        console.error('Unknown error:', error)
        setError('An unknown error occurred while processing the presentation.')
      }
    } finally {
      setVerifyLoading(false)
      setTimeout(() => {
        setProofReqSuccess('')
        setError('')
      }, 4000)
    }
  }

  const requestProof = async (proofVericationId: string): Promise<void> => {
    if (proofVericationId) {
      await presentProofById(proofVericationId)
    }
  }

  const schemeSelection = (): void => {
    router.push('/verification/verify-credentials')
  }

  useEffect(() => {
    if (orgId) {
      getVerificationListData()
    }
  }, [
    orgId,
    proofPagination.pageIndex,
    proofPagination.pageSize,
    proofPagination.sortBy,
    proofPagination.searchTerm,
    proofPagination.sortOrder,
  ])

  useEffect(() => {
    if (orgId) {
      setProofPagination({
        pageIndex: 0,
        pageSize: 10,
        pageCount: 1,
        searchTerm: '',
        sortBy: 'createDateTime',
        sortOrder: 'desc',
      })
    }
  }, [orgId])

  useEffect(() => {
    const getUserRoles = (): void => {
      setUserRoles(orgRoles?.roles || [])
    }
    getUserRoles()
    fetchOrganizationDetails()
  }, [orgId])

  const columnData: IColumnData[] = [
    {
      id: 'connectionDetail',
      title: 'Holder',
      accessorKey: 'connectionDetail',
      columnFunction: [],
      cell: ({ row }): JSX.Element => {
        const isEncrypted = (value: string): boolean =>
          typeof value === 'string' && value.startsWith('U2FsdGVkX1')
        let email = row.original.emailId
        const connection = String(
          row.original.connections?.theirLabel ?? '--/--',
        )
        if (email && email !== 'Not Available' && isEncrypted(email)) {
          email = decryptValue(String(email))
        }
        return (
          <button
            className="url-link"
            onClick={() => {
              setSelectedFields(() => {
                const data = [
                  {
                    label: 'Request Id',
                    value: row.original.presentationId || 'Not Available',
                    copyable: true,
                  },
                  {
                    label: 'Holder',
                    value:
                      row.original.connections?.theirLabel || 'Not Available',
                  },
                  {
                    label: 'Requested On',
                    value: row.original.createDateTime ? (
                      <DateCell date={row.original.createDateTime} />
                    ) : (
                      'Not Available'
                    ),
                  },
                  {
                    label: 'Status',
                    value: row.original.state ? (
                      <ProofState state={row.original.state} />
                    ) : (
                      'Not Available'
                    ),
                  },
                ]
                if (row.original.connections?.theirLabel) {
                  data.push({
                    label: 'Connection Id',
                    value: row.original.connectionId,
                    copyable: true,
                  })
                }
                return data
              })
              setIsDrawerOpen(true)
            }}
          >
            {String(
              email && email !== 'Not Available'
                ? `**${email.slice(2)}`
                : connection,
            )}
          </button>
        )
      },
    },
    {
      id: 'createDateTime',
      title: 'Requested On',
      accessorKey: 'createDateTime',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setProofPagination((prev) => ({
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
            setProofPagination((prev) => ({
              ...prev,
              sortBy: 'state',
              sortOrder: order,
            }))
          },
        },
      ],
      cell: ({
        row,
      }: {
        row: { original: { state: string } }
      }): JSX.Element => <ProofStateCell state={row.original.state} />,
    },
    {
      id: 'action',
      title: 'Action',
      accessorKey: 'action',
      columnFunction: [],
      cell: ({ row }): JSX.Element => {
        const { presentationId, state } = row.original
        const canView =
          state === ProofRequestState.presentationReceived ||
          state === ProofRequestState.done

        return (
          <Button
            disabled={!canView}
            className="h-8 w-16 px-3 py-1 text-sm"
            onClick={() => openProofRequestModel(true, presentationId, state)}
          >
            {state === ProofRequestState.done ? 'View' : 'Verify'}
          </Button>
        )
      },
    },
  ]

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<RequestProof>(tableStyling)

  return (
    <PageContainer>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verification</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of verification requests
          </p>
        </div>
        {isWalletCreated && (
          <div className="flex items-center gap-2">
            {/* Reload Button */}
            <button
              onClick={handleReload}
              disabled={reloading}
              className="text-secondary-foreground bg-secondary focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              title="Reload table data"
            >
              <RefreshCw
                className={`h-5 w-5 ${reloading ? 'animate-spin' : ''}`}
              />
            </button>

            <RoleViewButton
              buttonTitle="Request"
              feature={Features.VERIFICATION}
              svgComponent={verificationSvgComponent()}
              onClickEvent={schemeSelection}
            />
          </div>
        )}
      </div>
      {proofReqSuccess && (
        <div className="w-full" role="alert">
          <AlertComponent
            message={proofReqSuccess}
            type={'success'}
            onAlertClose={() => {
              if (setProofReqSuccess) {
                setProofReqSuccess(null)
              }
            }}
          />
        </div>
      )}
      {error && (
        <div className="w-full" role="alert">
          <AlertComponent
            message={error}
            type={'failure'}
            onAlertClose={() => {
              if (setError) {
                setError(null)
              }
            }}
          />
        </div>
      )}

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <DataTable
          isLoading={loading}
          placeHolder="Filter by Connection Id and Schema Name"
          data={verificationList ?? []}
          columns={column}
          index={'presentationId'}
          pageIndex={proofPagination.pageIndex}
          pageSize={proofPagination.pageSize}
          pageCount={proofPagination.pageCount}
          onPageChange={(index) =>
            setProofPagination((prev) => ({ ...prev, pageIndex: index }))
          }
          onPageSizeChange={(size) => {
            setProofPagination((prev) => ({
              ...prev,
              pageSize: size,
              pageIndex: 0,
            }))
          }}
          onSearchTerm={(term) =>
            setProofPagination((prev) => ({ ...prev, searchTerm: term }))
          }
        />
      </div>
      <SidePanelComponent
        title={'Verification Details'}
        description={'Detailed view of the selected Verification'}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        fields={fields}
      />
      {userData && (
        <ProofRequest
          openModal={openModal}
          closeModal={() => {
            openProofRequestModel(false, '', '')

            getVerificationListData()
          }}
          onSuccess={(proofVericationId: string) => {
            requestProof(proofVericationId)
          }}
          requestId={requestId}
          userData={userData}
          view={view}
          verifyLoading={verifyLoading}
          userRoles={userRoles}
        />
      )}
    </PageContainer>
  )
}

export default VerificationCredentialList
