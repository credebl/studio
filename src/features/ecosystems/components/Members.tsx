'use client'

import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '../../../components/ui/generic-table-component/columns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ReactElement, useEffect, useState } from 'react'
import { RefreshCw, SquarePen, UserRoundX } from 'lucide-react'
import { apiStatusCodes, confirmationMessages } from '@/config/CommonConstant'
import {
  deleteEcosystemMember,
  getEcosystemMembers,
  updateMemberStatus,
} from '@/app/api/ecosystem'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmationModal from '@/components/confirmation-modal'
import { DataTable } from '../../../components/ui/generic-table-component/data-table'
import { DestructiveConfirmation } from '@/config/svgs/Auth'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { EcosystemOrgStatus } from '@/common/enums'
import { ILeadsInvitationTable } from '../Interface/ecosystemInterface'
import { dateConversion } from '@/utils/DateConversion'
import { useAppSelector } from '@/lib/hooks'

export function Members(): ReactElement {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tableData, setTableData] = useState<ILeadsInvitationTable[]>([])
  const [tableLoading, settableLoading] = useState(false)

  const [deletionId, setDeletionId] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const ecosystemId = useAppSelector((state) => state.ecosystem.id)
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const fetchMembersForEcosystem = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await getEcosystemMembers(ecosystemId, pagination)
      const { data } = response as AxiosResponse
      if (data?.data?.totalPages) {
        setPagination((prev) => ({ ...prev, totalPages: data.data.totalPages }))
      } else {
        setPagination((prev) => ({ ...prev, totalPages: 0 }))
      }
      if (data?.data?.data) {
        setTableData(data.data.data)
      } else {
        setTableData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMemberStatus = async (
    status: EcosystemOrgStatus,
    orgId: string,
  ): Promise<void> => {
    settableLoading(true)
    try {
      const payload = {
        orgIds: [orgId],
        ecosystemId,
      }
      const response = await updateMemberStatus(status, payload)
      const { data } = response as AxiosResponse
      if (data && data.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess('Successfully updated the ecosystem member status')
        fetchMembersForEcosystem()
      }
    } catch (err) {
      console.error('failed to update member status', err)
      setError('Failed to update status for member')
    } finally {
      settableLoading(false)
    }
  }
  const handleDeleteEcosystemMember = async (): Promise<void> => {
    settableLoading(true)
    try {
      const payload = {
        orgIds: [deletionId],
        ecosystemId,
      }
      const response = await deleteEcosystemMember(payload)
      const { data } = response as AxiosResponse
      if (data && data.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess('Ecosystem member deleted successfully')
        fetchMembersForEcosystem()
      }
    } catch (err) {
      console.error('Failed to delete member', err)
      setError('Failed to delete member')
    } finally {
      settableLoading(false)
      setDeletionId('')
      setShowConfirmation(false)
    }
  }

  const columnData: IColumnData[] = [
    {
      id: 'organisation',
      title: 'Organisation',
      accessorKey: 'organisation',
      columnFunction: [],
      cell: ({
        row,
      }: {
        row: { original: { organisation: { name: string } } }
      }) => (
        <div className="text-muted-foreground cursor-default">
          {row.original.organisation.name}
        </div>
      ),
    },
    {
      id: 'email',
      title: 'Email',
      accessorKey: 'email',
      columnFunction: [],
      cell: ({ row }: { row: { original: { user: { email: string } } } }) => (
        <div className="cursor-default">{row.original.user.email}</div>
      ),
    },
    {
      id: 'date',
      title: 'Date',
      accessorKey: 'date',
      columnFunction: [],
      cell: ({ row }: { row: { original: { createDateTime: string } } }) => (
        <div className="text-muted-foreground cursor-default">
          {dateConversion(row.original.createDateTime)}
        </div>
      ),
    },
    {
      id: 'status',
      title: 'Status',
      accessorKey: 'status',
      columnFunction: [],
      cell: ({ row }: { row: { original: { status: string } } }) => (
        <div className="text-muted-foreground cursor-default">
          {row.original.status === EcosystemOrgStatus.INACTIVE && (
            <Badge className="text-muted-foreground bg-gray-200">
              inactive
            </Badge>
          )}
          {row.original.status === EcosystemOrgStatus.ACTIVE && (
            <Badge className="status-accepted">active</Badge>
          )}
        </div>
      ),
    },
    {
      id: 'action',
      title: 'Action',
      accessorKey: 'action',
      columnFunction: [],
      cell: ({
        row,
      }: {
        row: { original: { status: string; organisation: { id: string } } }
      }) => (
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={'ghost'}>
                <DotsVerticalIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="flex w-50 flex-col items-center justify-start p-2"
              align="start"
            >
              <Button
                variant={'ghost'}
                className="text-muted-foreground flex w-full justify-start gap-2"
                onClick={() => {
                  setDeletionId(row.original.organisation.id)
                  setShowConfirmation(true)
                }}
              >
                <UserRoundX />
                Delete
              </Button>
              <hr className="w-full" />
              <Button
                variant={'ghost'}
                className="text-muted-foreground flex w-full justify-start gap-2"
                onClick={() =>
                  handleUpdateMemberStatus(
                    row.original.status === EcosystemOrgStatus.ACTIVE
                      ? EcosystemOrgStatus.INACTIVE
                      : EcosystemOrgStatus.ACTIVE,
                    row.original.organisation.id,
                  )
                }
              >
                <SquarePen />
                <span>
                  {row.original.status === EcosystemOrgStatus.ACTIVE
                    ? 'Deactivate'
                    : 'Activate'}
                </span>
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
  ]

  useEffect(() => {
    const delay = pagination.searchTerm ? 500 : 0

    const timer = setTimeout(() => {
      fetchMembersForEcosystem()
    }, delay)

    return () => clearTimeout(timer)
  }, [pagination.pageNumber, pagination.pageSize, pagination.searchTerm, orgId])

  useEffect(() => {
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 3000)
  }, [success, error])

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }

  const column = getColumns<ILeadsInvitationTable>(tableStyling)
  return (
    <div className="">
      <ConfirmationModal
        loading={false}
        success={success}
        failure={error}
        openModal={showConfirmation}
        closeModal={() => setShowConfirmation(false)}
        onSuccess={handleDeleteEcosystemMember}
        message={'Are you sure to delete this member'}
        buttonTitles={[
          confirmationMessages.cancelConfirmation,
          confirmationMessages.sureConfirmation,
        ]}
        isProcessing={loading}
        setFailure={setError}
        setSuccess={setSuccess}
        image={<DestructiveConfirmation />}
      />
      <div className="mb-2"></div>
      {(Boolean(error) || Boolean(success)) && (
        <AlertComponent
          message={success ?? error}
          type={success ? 'success' : 'failure'}
          onAlertClose={() => {
            setError(null)
            setSuccess(null)
          }}
        />
      )}
      <div className="relative flex justify-end">
        <div className="absolute flex items-center gap-2">
          {/* Reload Button */}
          <button
            onClick={() => fetchMembersForEcosystem()}
            disabled={loading}
            title="Reload table data"
            className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-1 py-4 lg:flex-row lg:space-y-0 lg:space-x-12">
        <DataTable
          isLoading={tableLoading}
          placeHolder="Filter by email, status or organisation"
          data={tableData}
          columns={column}
          index={'id'}
          pageIndex={pagination.pageNumber}
          pageSize={pagination.pageSize}
          pageCount={pagination.totalPages}
          onPageChange={(index: number) =>
            setPagination((prev) => ({ ...prev, pageNumber: index }))
          }
          onPageSizeChange={(size: number) => {
            setPagination((prev) => ({
              ...prev,
              pageSize: size,
              pageNumber: 0,
            }))
          }}
          onSearchTerm={(term: string) =>
            setPagination((prev) => ({ ...prev, searchTerm: term }))
          }
        />
      </div>
    </div>
  )
}
