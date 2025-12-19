'use client'

import { CheckCircle2, MoreVertical, Trash2, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import React, { Dispatch, JSX, SetStateAction } from 'react'
import { activateCertificate, deactivateCertificate } from '@/app/api/x509'
import {
  apiStatusCodes,
  confirmationCertificateMessages,
} from '@/config/CommonConstant'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConfirmationModal from '@/components/confirmation-modal'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { dateConversion } from '@/utils/DateConversion'
import { useAppSelector } from '@/lib/hooks'

export interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
  searchTerm: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface Certificate {
  id: string
  commonName: string
  type: string
  keyType: string
  countryName: string
  issuerAlternativeName?: string
  createdAt?: string
  status?: string
  validFrom?: string
  expiry?: string
}

interface CertificateListProps {
  certificates: Certificate[]
  loading: boolean
  paginationState: PaginationState
  onPaginationChange: Dispatch<SetStateAction<PaginationState>>
  onRefresh: () => void
  onSuccess: (message: string | null) => void
  onFailure: (message: string | null) => void
}

const CertificateList = ({
  certificates,
  loading,
  paginationState,
  onPaginationChange,
  onRefresh,
  onSuccess,
  onFailure,
}: CertificateListProps): JSX.Element => {
  const orgId = useAppSelector((state) => state?.organization.orgId)
  const [showConfirmModal, setShowConfirmModal] = React.useState(false)
  const [selectedCert, setSelectedCert] = React.useState<Certificate | null>(
    null,
  )
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const [actionType, setActionType] = React.useState<
    'activate' | 'deactivate' | 'delete' | null
  >(null)
  const [actionLoading, setActionLoading] = React.useState(false)

  const openConfirmation = (
    cert: Certificate,
    action: 'activate' | 'deactivate' | 'delete',
  ): void => {
    // 🔥 CLEAR OLD ALERTS
    setSuccessMessage(null)
    setErrorMessage(null)

    setSelectedCert(cert)
    setActionType(action)
    setShowConfirmModal(true)
  }

  const handleActivate = async (certificateId: string): Promise<boolean> => {
    try {
      const response = await activateCertificate(orgId || '', certificateId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccessMessage(data.message)
        setErrorMessage(null)
        onRefresh()
        // Notify parent component of success
        onSuccess(data.message)
        return true
      }

      setErrorMessage(data?.message)
      setSuccessMessage(null)
      // Notify parent component of failure
      onFailure(data?.message)
      return false
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      const apiError =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to activate certificate'

      setErrorMessage(apiError)
      setSuccessMessage(null)
      // Notify parent component of failure
      onFailure(apiError)
      return false
    }
  }

  const handleDeactivate = async (certificateId: string): Promise<boolean> => {
    try {
      const response = await deactivateCertificate(orgId || '', certificateId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccessMessage(data.message)
        setErrorMessage(null)
        onRefresh()
        // Notify parent component of success
        onSuccess(data.message)
        return true
      }

      setErrorMessage(data?.message)
      setSuccessMessage(null)
      // Notify parent component of failure
      onFailure(data?.message)
      return false
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      const apiError =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to deactivate certificate'

      setErrorMessage(apiError)
      setSuccessMessage(null)
      // Notify parent component of failure
      onFailure(apiError)
      return false
    }
  }

  const handleConfirmedAction = async (): Promise<void> => {
    if (!selectedCert || !actionType) {
      return
    }

    setActionLoading(true)

    let isSuccess = false

    if (actionType === 'activate') {
      isSuccess = await handleActivate(selectedCert.id)
    }

    if (actionType === 'deactivate') {
      isSuccess = await handleDeactivate(selectedCert.id)
    }

    setActionLoading(false)

    if (isSuccess) {
      setShowConfirmModal(false)
      setSelectedCert(null)
      setActionType(null)
    }
  }

  const getStatusClass = (status?: string): string => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  }

  const confirmationMessage: string = ((): string => {
    switch (actionType) {
      case 'activate':
        return confirmationCertificateMessages.activateCertificateConfirmation
      case 'deactivate':
        return confirmationCertificateMessages.deactivateCertificateConfirmation
      default:
        return 'Are you sure you want to delete this certificate?'
    }
  })()

  const confirmationButtonTitles = ((): string[] => {
    switch (actionType) {
      case 'activate':
        return ['Cancel', 'Activate']
      case 'deactivate':
        return ['Cancel', 'Deactivate']
      default:
        return ['Cancel', 'Delete']
    }
  })()

  const statusCell = ({
    row,
  }: {
    row: { original: Certificate }
  }): JSX.Element => {
    const { status } = row.original

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(status)}`}
        >
          {status}
        </span>
      </div>
    )
  }

  const actionCell = ({
    row,
  }: {
    row: { original: Certificate }
  }): JSX.Element => {
    const cert = row.original
    const isActive = cert.status === 'Active'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            disabled={isActive}
            onClick={() => openConfirmation(cert, 'activate')}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!isActive}
            onClick={() => openConfirmation(cert, 'deactivate')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <Trash2 className="text-muted-foreground mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const columnData: IColumnData[] = [
    {
      id: 'commonName',
      title: 'Common Name',
      accessorKey: 'commonName',
      cell: ({ row }): JSX.Element => (
        <span className="max-w-[220px] truncate text-sm font-medium">
          {row.original.commonName || '—'}
        </span>
      ),
      columnFunction: [],
    },
    {
      id: 'validFrom',
      title: 'Valid From',
      accessorKey: 'validFrom',
      cell: ({ row }): JSX.Element => (
        <span className="text-sm">
          {row.original.validFrom
            ? dateConversion(row.original.validFrom)
            : '—'}
        </span>
      ),
      columnFunction: [],
    },
    {
      id: 'expiry',
      title: 'Expiry',
      accessorKey: 'expiry',
      cell: ({ row }): JSX.Element => (
        <span className="text-sm">
          {row.original.expiry ? dateConversion(row.original.expiry) : '—'}
        </span>
      ),
      columnFunction: [],
    },
    {
      id: 'status',
      title: 'Status',
      accessorKey: 'status',
      cell: statusCell,
      columnFunction: [],
    },
    {
      id: 'actions',
      title: 'Actions',
      accessorKey: 'actions',
      cell: actionCell,
      columnFunction: [],
    },
  ]

  const metadata: ITableMetadata = { enableSelection: false }
  const tableStyling: TableStyling = { metadata, columnData }
  const columns = getColumns<Certificate>(tableStyling)

  return (
    <Card className="p-4">
      {showConfirmModal && selectedCert && actionType && (
        <ConfirmationModal
          openModal={showConfirmModal}
          buttonTitles={confirmationButtonTitles}
          loading={actionLoading}
          closeModal={() => {
            setShowConfirmModal(false)
            setSelectedCert(null)
            setActionType(null)
            setSuccessMessage(null)
            setErrorMessage(null)
          }}
          onSuccess={(confirmed: boolean): void => {
            if (confirmed) {
              handleConfirmedAction()
            }
          }}
          message={confirmationMessage}
          isProcessing={actionLoading}
          success={successMessage}
          failure={errorMessage}
          setSuccess={setSuccessMessage}
          setFailure={setErrorMessage}
        />
      )}

      <DataTable
        isLoading={loading}
        placeHolder="Search certificates..."
        data={certificates}
        columns={columns}
        index="id"
        pageIndex={paginationState.pageIndex}
        pageSize={paginationState.pageSize}
        pageCount={paginationState.pageCount}
        onPageChange={(index: number): void =>
          onPaginationChange((prev) => ({
            ...prev,
            pageIndex: index,
          }))
        }
        onPageSizeChange={(size: number): void =>
          onPaginationChange((prev) => ({
            ...prev,
            pageSize: size,
            pageIndex: 0,
          }))
        }
        onSearchTerm={(term: string): void =>
          onPaginationChange((prev) => ({
            ...prev,
            searchTerm: term,
            pageIndex: 0,
          }))
        }
      />
    </Card>
  )
}

export default CertificateList
