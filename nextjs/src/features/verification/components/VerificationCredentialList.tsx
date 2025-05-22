'use client'

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

  // Table state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createDateTime')
  const [sortOrder, setsortOrder] = useState<SortActions>('desc')
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
      setError('An error occurred while fetching proof details')
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
        itemPerPage: pageSize,
        page: pageIndex + 1,
        search: searchTerm,
        sortBy,
        sortingOrder: sortOrder,
      })

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setVerificationList(data?.data?.data ?? [])
        setPageCount(data?.data.lastPage ?? 1)
      } else {
        setVerificationList([])
      }
    } catch (error) {
      setVerificationList([])
      setError('An error occurred while fetching the verification list.')
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
  }, [orgId, pageIndex, pageSize, sortBy, searchTerm, sortOrder])

  useEffect(() => {
    if (orgId) {
      setPageIndex(0)
      setPageSize(10)
      setPageCount(1)
      setSortBy('createDateTime')
      setSearchTerm('')
      setsortOrder('desc')
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
            setSortBy('presentationId')
            setsortOrder(order)
          },
        },
      ],
      cell: ({ row }): JSX.Element => {
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
      id: 'createDateTime',
      title: 'Requested on',
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
              state === ProofRequestState.requestSent &&
              'border border-orange-100 bg-orange-100 text-orange-800 dark:border-orange-300 dark:bg-gray-700 dark:text-orange-300'
            } ${
              state === ProofRequestState.done &&
              'border border-green-100 bg-green-100 text-green-800 dark:border-green-500 dark:bg-gray-700 dark:text-green-400'
            } ${
              state === ProofRequestState.abandoned &&
              'border border-red-100 bg-red-100 text-red-800 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
            } ${
              state === ProofRequestState.requestReceived &&
              'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 mr-2 rounded px-2.5 py-0.5 text-sm font-medium'
            } ${
              state === ProofRequestState.presentationReceived &&
              'text-primary-900 border border-sky-100 bg-sky-300 dark:border-sky-700 dark:bg-gray-700 dark:text-sky-500'
            } mr-0.5 flex w-fit items-center justify-center rounded-md border px-0.5 px-2 py-0.5 text-xs font-medium`}
          >
            {state === ProofRequestState.requestSent
              ? ProofRequestStateUserText.requestSent
              : state === ProofRequestState.done
                ? ProofRequestStateUserText.done
                : state === ProofRequestState.abandoned
                  ? ProofRequestStateUserText.abandoned
                  : state === ProofRequestState.requestReceived
                    ? ProofRequestStateUserText.requestReceived
                    : state === ProofRequestState.presentationReceived
                      ? ProofRequestStateUserText.requestReceived
                      : ProofRequestStateUserText.requestReceived}
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
            Here&apos;s a list of verification requests!
          </p>
        </div>
        {isWalletCreated && (
          <RoleViewButton
            buttonTitle="Request"
            feature={Features.VERIFICATION}
            svgComponent={
              <svg
                className="mt-1 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: '20px', width: '30px' }}
                fill="none"
                viewBox="0 0 25 25"
              >
                <path
                  fill="currentColor"
                  d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"
                />
              </svg>
            }
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
            data={verificationList}
            columns={column}
            index={'presentationId'}
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
