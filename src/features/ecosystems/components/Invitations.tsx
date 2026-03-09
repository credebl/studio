'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '../../../components/ui/generic-table-component/columns'
import { ReactElement, useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  getOrganizationsForInvite,
  inviteMemberToEcosystem,
} from '@/app/api/ecosystem'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '../../../components/ui/generic-table-component/data-table'
import { ILeadsInvitationTable } from '../Interface/ecosystemInterface'
import { MemberInvitation } from '@/common/enums'
import { RefreshCw } from 'lucide-react'
import { SelectiveSearchEcosystem } from '@/components/SelectiveSearchEcosystem'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { fetchInvitationsSentForMembers } from '../utils/commonFunctions'
import { useAppSelector } from '@/lib/hooks'

export function Invitaitons(): ReactElement {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tableData, setTableData] = useState<ILeadsInvitationTable[]>([])
  const [, setOrgLoading] = useState(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [orgList, setOrgList] = useState<{ id: string; name: string }[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')

  const ecosystemId = useAppSelector((state) => state.ecosystem.id)
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const [paginationOrgList, setPaginationOrgList] = useState({
    pageSize: 10,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const columnData: IColumnData[] = [
    {
      id: 'email',
      title: 'Email',
      accessorKey: 'email',
      columnFunction: [],
      cell: ({ row }: { row: { original: { email: string } } }) => (
        <div className="cursor-default">{row.original.email}</div>
      ),
    },
    {
      id: 'date',
      title: 'Date',
      accessorKey: 'date',
      columnFunction: [],
      cell: ({ row }: { row: { original: { createDateTime: string } } }) => (
        <div className="text-muted-foreground cursor-default">
          <Tooltip>
            <TooltipTrigger asChild>
              <p>{dateConversion(row.original.createDateTime)}</p>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" sideOffset={5}>
              <p>{new Date(row.original.createDateTime).toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
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
          {row.original.status === MemberInvitation.PENDING && (
            <Badge className="status-pending">pending</Badge>
          )}
          {row.original.status === MemberInvitation.ACCEPTED && (
            <Badge className="status-accepted">accepted</Badge>
          )}
          {row.original.status === MemberInvitation.REJECTED && (
            <Badge className="status-rejected">rejected</Badge>
          )}
        </div>
      ),
    },
    {
      id: 'invitedOrg',
      title: 'Invited Org',
      accessorKey: 'invitedOrg',
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
  ]

  const fetchInvitationsSentForMembersAsLead = async (): Promise<void> => {
    setLoading(true)

    const result = await fetchInvitationsSentForMembers(
      orgId,
      ecosystemId,
      pagination,
    )

    if (result.success) {
      setTableData(result.tableData)
      setPagination((prev) => ({ ...prev, totalPages: result.totalPages }))
    } else {
      console.error('Error fetching data:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    const delay = pagination.searchTerm ? 500 : 0

    const timer = setTimeout(() => {
      fetchInvitationsSentForMembersAsLead()
    }, delay)

    return () => clearTimeout(timer)
  }, [pagination.pageNumber, pagination.pageSize, pagination.searchTerm, orgId])

  const fetchOrganizationsList = async (): Promise<void> => {
    if (openModal) {
      setOrgLoading(true)
      try {
        const response = await getOrganizationsForInvite(
          orgId,
          paginationOrgList,
        )
        const { data } = response as AxiosResponse
        if (data?.data?.orgs) {
          setOrgList(data.data.orgs)
        }
      } catch (error) {
        console.error('Error fetching organizations', error)
      } finally {
        setOrgLoading(false)
      }
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined
    if (openModal) {
      timer = setTimeout(() => fetchOrganizationsList(), 500)
    } else {
      setPaginationOrgList((prev) => ({ ...prev, searchTerm: '' }))
      setSelectedOption('')
    }
    return () => {
      if (openModal) {
        clearInterval(timer)
      }
    }
  }, [openModal, paginationOrgList.searchTerm])

  const handleSearch = (selected: string): void => {
    setPaginationOrgList((prev) => ({ ...prev, searchTerm: selected }))
  }

  useEffect(() => {
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 3000)
  }, [success, error])

  const sendInvite = async (): Promise<void> => {
    try {
      const payload = {
        orgId: selectedOption,
        ecosystemId,
      }
      const response = await inviteMemberToEcosystem(payload)
      const { data } = response as AxiosResponse
      if (data && data.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(data.message)
        fetchInvitationsSentForMembersAsLead()
      } else {
        if (typeof response === 'string') {
          setError(response)
        }
      }
    } catch (err) {
      console.error('Failed to send member invitation', err)
      setError('Failed to send member invitation')
    } finally {
      setLoading(false)
      setPaginationOrgList((prev) => ({ ...prev, searchTerm: '' }))
      setSelectedOption('')
      setOpenModal(false)
    }
  }

  const metadata: ITableMetadata = {
    enableSelection: false,
  }
  const tableStyling: TableStyling = { metadata, columnData }

  const column = getColumns<ILeadsInvitationTable>(tableStyling)
  return (
    <div className="">
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent
          className="sm:max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Send Member Invitation</DialogTitle>
          </DialogHeader>

          <label className="text-muted-foreground">Selected organisation</label>
          <SelectiveSearchEcosystem
            className="mt-0"
            options={orgList}
            value={selectedOption}
            getOptionValue={(v) => v.id}
            getOptionLabel={(v) => v.name}
            onValueChange={(v) => setSelectedOption(v.id)}
            onSearchChange={(v) => handleSearch(v)}
            enableInternalSearch={false}
            disabled={loading}
            placeholder="Find a organisation..."
          />
          <div className="mt-5 ml-auto">
            <Button onClick={sendInvite}>Send Invite</Button>
          </div>
        </DialogContent>
      </Dialog>
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
            onClick={() => fetchInvitationsSentForMembersAsLead()}
            disabled={loading}
            title="Reload table data"
            className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={() => setOpenModal(true)}>Invite Member</Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-1 py-4 lg:flex-row lg:space-y-0 lg:space-x-12">
        <DataTable
          isLoading={loading}
          placeHolder="Filter by email, status or invited org"
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
