'use client'

import {
  type AdminInvitation,
  type AdminInvitationPage,
} from '@/features/admin/types'
import {
  type IColumnData,
  type ITableMetadata,
  type TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import { JSX, useActionState, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus } from 'lucide-react'
import { dateConversion } from '@/utils/DateConversion'
import { inviteEcosystemOwnerAction } from '../actions'
import { toast } from 'sonner'

interface InvitationsPanelProps {
  initialPage: AdminInvitationPage
}

const columnData: IColumnData[] = [
  {
    id: 'email',
    title: 'Email',
    accessorKey: 'email',
    columnFunction: [],
    cell: ({ row }) => (
      <span className="font-medium">{row.original.email}</span>
    ),
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem',
    accessorKey: 'ecosystem',
    columnFunction: [],
    cell: ({ row }): JSX.Element => {
      if (!row.original.ecosystem) {
        return <span className="text-muted-foreground">--</span>
      }

      return (
        <div className="max-w-sm space-y-1">
          <p className="font-medium capitalize">
            {row.original.ecosystem.name}
          </p>
          {row.original.ecosystem.description ? (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {row.original.ecosystem.description}
            </p>
          ) : null}
          <p className="text-muted-foreground text-xs">
            Created {dateConversion(row.original.ecosystem.createDateTime)}
          </p>
        </div>
      )
    },
  },
  {
    id: 'organisation',
    title: 'Lead Organization',
    accessorKey: 'organisation',
    columnFunction: [],
    cell: ({ row }) => (
      <span>
        {row.original.organisation?.name ?? (
          <span className="text-muted-foreground">--</span>
        )}
      </span>
    ),
  },
  {
    id: 'status',
    title: 'Status',
    accessorKey: 'status',
    columnFunction: [],
    cell: ({ row }) => (
      <Badge variant={row.original.ecosystem ? 'secondary' : 'outline'}>
        {row.original.ecosystem ? 'Created' : 'Pending'}
      </Badge>
    ),
  },
  {
    id: 'createDateTime',
    title: 'Invited',
    accessorKey: 'createDateTime',
    columnFunction: [],
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {dateConversion(row.original.createDateTime)}
      </span>
    ),
  },
]

const metadata: ITableMetadata = { enableSelection: false }
const tableStyling: TableStyling = { metadata, columnData }
const columns = getColumns<AdminInvitation>(tableStyling)

export function InvitationsPanel({
  initialPage,
}: InvitationsPanelProps): React.JSX.Element {
  const [rows, setRows] = useState<AdminInvitation[]>(initialPage.data)
  const [totalPages, setTotalPages] = useState(initialPage.totalPages)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const isFirstRender = useRef(true)

  const [actionState, formAction, isSubmitting] = useActionState(
    inviteEcosystemOwnerAction,
    null,
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const controller = new AbortController()

    const loadInvitations = async (): Promise<void> => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(pageIndex + 1),
          pageSize: String(pageSize),
        })
        if (search) {
          params.set('search', search)
        }

        const response = await fetch(`/api/admin/invitations?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Unable to load invitations')
        }

        const body = (await response.json()) as AdminInvitationPage
        setRows(Array.isArray(body.data) ? body.data : [])
        setTotalPages(Math.max(1, body.totalPages))
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        setRows([])
        setTotalPages(1)
        toast.error('Could not load invitations.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadInvitations()

    return () => controller.abort()
  }, [pageIndex, pageSize, search, refreshKey])

  useEffect(() => {
    if (!actionState) {
      return
    }

    if (actionState.status === 'success') {
      setIsInviteOpen(false)
      setRefreshKey((current) => current + 1)
      toast.success(actionState.message)
      return
    }

    toast.error(actionState.message)
  }, [actionState])

  const handleSearchTerm = (term: string): void => {
    setPageIndex(0)
    setSearch(term)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Ecosystem invitations</h2>
          <p className="text-muted-foreground text-sm">
            Invite organizations to create an ecosystem on this platform.
          </p>
        </div>

        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus />
          Invite ecosystem owner
        </Button>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        index="id"
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={totalPages}
        placeHolder="Search by email"
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearchTerm={handleSearchTerm}
        isLoading={isLoading}
      />

      <Modal
        title="Invite ecosystem owner"
        description="Send an invitation to an email address. The recipient will be able to create an ecosystem on this platform."
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      >
        <form action={formAction} className="space-y-4">
          <Input
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="name@example.com"
            autoComplete="off"
            aria-label="Email address"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send invitation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
