'use client'

import {
  ConnectionIdCell,
  DateCell,
} from '@/features/organization/connectionIssuance/components/CredentialTableCells'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { JSX, useEffect, useState } from 'react'
import {
  ProofRequestState,
  ProofRequestStateUserText,
} from '@/features/common/enum'
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
import { EmptyListMessage } from '@/components/EmptyListComponent'
import { Features } from '@/common/enums'
import PageContainer from '@/components/layout/page-container'
import ProofRequest from './ProofRequestPopup'
import { RequestProof } from '../type/interface'
import RoleViewButton from '@/components/RoleViewButton'
import { apiStatusCodes } from '@/config/CommonConstant'
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

const VerificationCredentialList = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null)
  const [verificationList, setVerificationList] = useState<RequestProof[]>([])
  const [isWalletCreated, setIsWalletCreated] = useState(false)

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
  const orgRoles = useAppSelector((state) => state.organization.orgRoles)

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
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

  const getVerificationListData = async (): Promise<void> => {
    setLoading(true)
    try {
      if (!orgId) {
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
      setLoading(false)
    }
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

  const presentProofById = async (id: string): Promise<void> => {
    try {
      const response = await verifyPresentation(id, orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
        setOpenModal(false)
        setProofReqSuccess(data.message)
        setTimeout(() => getVerificationListData(), 2000)
      } else {
        setError(response as string)
      }
    } catch (error) {
      setError('An error occurred while processing the presentation.')
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
    router.push('/organizations/verification/verify-credentials')
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
      setUserRoles(orgRoles)
    }
    getUserRoles()
    fetchOrganizationDetails()
  }, [orgId])

  const columnData: IColumnData[] = [
    {
      id: 'presentationId',
      title: 'Request Id',
      accessorKey: 'presentationId',
      columnFunction: [
        'hide',
        {
          sortCallBack: async (order): Promise<void> => {
            setProofPagination((prev) => ({
              ...prev,
              sortBy: 'presentationId',
              sortOrder: order,
            }))
          },
        },
      ],
      cell: ({ row }): React.JSX.Element => {
        const { presentationId } = row.original
        return <span>{presentationId || 'Not available'}</span>
      },
    },
    {
      id: 'connectionId',
      title: 'Connection Id',
      accessorKey: 'connectionId',
      columnFunction: [
        {
          sortCallBack: async (order): Promise<void> => {
            setProofPagination((prev) => ({
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
      }): JSX.Element => {
        const state = row.original.state as ProofRequestState

        let badgeClass = ''
        let userText: string = state

        switch (state) {
          case ProofRequestState.requestSent:
            badgeClass = 'badges-warning'
            userText = ProofRequestStateUserText.requestSent
            break
          case ProofRequestState.requestReceived:
            badgeClass = 'badges-primary'
            userText = ProofRequestStateUserText.requestReceived
            break
          case ProofRequestState.done:
            badgeClass = 'badges-success'
            userText = ProofRequestStateUserText.done
            break
          case ProofRequestState.abandoned:
            badgeClass = 'badges-error'
            userText = ProofRequestStateUserText.abandoned
            break
          case ProofRequestState.presentationReceived:
            badgeClass = 'badges-secondary'
            userText = ProofRequestStateUserText.presentationReceived
            break
          default:
            badgeClass = ''
            userText = state
        }

        return (
          <span
            className={`${badgeClass} text-foreground mr-0.5 flex w-fit items-center justify-center rounded-md px-0.5 px-2 text-xs font-medium`}
          >
            {userText}
          </span>
        )
      },
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
          <h2 className="text-2xl font-bold tracking-tight">
            Verification List
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of verification requests
          </p>
        </div>
        {isWalletCreated && (
          <RoleViewButton
            buttonTitle="Request"
            feature={Features.VERIFICATION}
            svgComponent={verificationSvgComponent()}
            onClickEvent={schemeSelection}
          />
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

      {!isWalletCreated && !loading ? (
        <div className="flex items-center justify-center">
          <EmptyListMessage
            message={'No Wallet Details Found'}
            description={'The owner is required to create a wallet'}
          />
        </div>
      ) : (
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <DataTable
            placeHolder="Filter by Connection Id and Schema Name"
            data={verificationList}
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
      )}

      {userData && (
        <ProofRequest
          openModal={openModal}
          closeModal={() => openProofRequestModel(false, '', '')}
          onSucess={requestProof}
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
