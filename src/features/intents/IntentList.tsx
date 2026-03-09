'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '@/components/ui/generic-table-component/columns'
import IntentFormDialog, {
  IntentFormHandlers,
  IntentFormState,
} from './IntentFormDialog'
import { MoreVertical, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import React, { JSX, useEffect, useState } from 'react'
import {
  createIntent,
  deleteIntent,
  getAllIntents,
  updateIntent,
} from '@/app/api/Intents'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import ConfirmationModal from '@/components/confirmation-modal'
import { DataTable } from '@/components/ui/generic-table-component/data-table'
import { DateCell } from '../organization/connectionIssuance/components/CredentialTableCells'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { useAppSelector } from '@/lib/hooks'

interface Intent {
  id: string
  ecosystemId: string
  name: string
  description: string
  createDateTime: string
  lastChangedDateTime: string
}

interface IntentListProps {
  ecosystemId: string
}

interface PaginationState {
  pageIndex: number
  pageSize: number
  pageCount: number
  searchTerm: string
  sortBy: string
  sortOrder: SortActions
}

const IntentList = ({ ecosystemId }: IntentListProps): JSX.Element => {
  const orgId = useAppSelector((state) => state.organization.orgId)

  const [loading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [intentList, setIntentList] = useState<Intent[]>([])
  const [reloading, setReloading] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [intentName, setIntentName] = useState('')
  const [intentDesc, setIntentDesc] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null)
  const [actionType, setActionType] = useState<'delete' | 'update' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editIntentId, setEditIntentId] = useState<string | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const fetchIntents = async (reload = false): Promise<void> => {
    if (!ecosystemId) {
      return
    }

    if (reload) {
      setReloading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getAllIntents(ecosystemId, {
        itemPerPage: pagination.pageSize,
        page: pagination.pageIndex + 1,
        search: pagination.searchTerm,
        sortBy: pagination.sortBy,
        sortingOrder: pagination.sortOrder,
      })
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setIntentList(data?.data?.data ?? [])
        setError(null)
      } else {
        setIntentList([])
      }
    } catch (err) {
      setIntentList([])
      setError('Failed to fetch intents')
      throw err
    } finally {
      if (reload) {
        setReloading(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleReload = async (): Promise<void> => {
    await fetchIntents(true)
  }

  useEffect(() => {
    if (!orgId || !ecosystemId) {
      setLoading(false)
      return
    }
    fetchIntents()
  }, [orgId, ecosystemId])

  useEffect(() => {
    if (!success && !failure) {
      return
    }

    const timer = setTimeout(() => {
      setSuccess(null)
      setFailure(null)

      if (openCreate) {
        setOpenCreate(false)
        setIsEdit(false)
        setEditIntentId(null)
        setIntentName('')
        setIntentDesc('')
      }

      if (showConfirmModal) {
        setShowConfirmModal(false)
        setSelectedIntent(null)
        setActionType(null)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [success, failure])

  const resetFormState = (): void => {
    setSuccess(null)
    setFailure(null)
    setIsEdit(false)
    setEditIntentId(null)
    setIntentName('')
    setIntentDesc('')
  }

  const handleCreateIntent = (): void => {
    resetFormState()
    setOpenCreate(true)
  }

  const handleSubmitIntent = async (): Promise<void> => {
    if (!ecosystemId) {
      setFailure('Ecosystem not available')
      return
    }
    setSuccess(null)
    setFailure(null)

    if (!intentName.trim()) {
      setFailure('Intent name is required')
      return
    }

    setCreating(true)

    try {
      if (isEdit && editIntentId) {
        const res = (await updateIntent(ecosystemId, editIntentId, {
          name: intentName,
          description: intentDesc,
        })) as AxiosResponse

        if (res?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setSuccess(res?.data?.message || 'Intent updated successfully')

          setIntentName('')
          setIntentDesc('')
          setIsEdit(false)
          setEditIntentId(null)

          fetchIntents(true)
          return
        } else {
          setFailure(res?.data?.message || 'Failed to update intent')
          return
        }
      }

      const res = (await createIntent(ecosystemId, {
        name: intentName,
        description: intentDesc,
      })) as AxiosResponse

      if (res?.data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(res?.data?.message || 'Intent created successfully')

        setIntentName('')
        setIntentDesc('')

        fetchIntents(true)
      } else {
        setFailure(res?.data?.message || 'Failed to create intent')
      }
    } catch {
      setFailure(isEdit ? 'Failed to update intent' : 'Failed to create intent')
    } finally {
      setCreating(false)
    }
  }

  const openConfirmation = (
    intent: Intent,
    action: 'delete' | 'update',
  ): void => {
    setSuccess(null)
    setFailure(null)

    if (action === 'update') {
      setIsEdit(true)
      setEditIntentId(intent.id)
      setIntentName(intent.name)
      setIntentDesc(intent.description)
      setOpenCreate(true)
      return
    }

    setSelectedIntent(intent)
    setActionType(action)
    setShowConfirmModal(true)
  }

  const handleDeleteIntent = async (intentId: string): Promise<boolean> => {
    try {
      if (!ecosystemId) {
        return false
      }

      const res = await deleteIntent(ecosystemId, intentId)

      if (typeof res === 'string') {
        setFailure(res)
        return false
      }

      if (res?.data?.statusCode === 200) {
        setSuccess(res?.data?.message || 'Intent deleted successfully')
        fetchIntents(true)
        return true
      }

      setFailure(res?.data?.message || 'Failed to delete intent')
      return false
    } catch {
      setFailure('Something went wrong')
      return false
    }
  }

  const handleConfirmedAction = async (): Promise<void> => {
    if (!selectedIntent || !actionType) {
      return
    }

    setActionLoading(true)

    try {
      if (actionType === 'delete') {
        await handleDeleteIntent(selectedIntent.id)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const actionCell = ({ row }: { row: { original: Intent } }): JSX.Element => {
    const intent = row.original

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => openConfirmation(intent, 'update')}>
            <Pencil className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => openConfirmation(intent, 'delete')}>
            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const columnData: IColumnData[] = [
    {
      id: 'name',
      title: 'Intent',
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name || 'NA'}</span>
      ),
      columnFunction: [],
    },
    {
      id: 'description',
      title: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => <span>{row.original.description ?? 'NA'}</span>,
      columnFunction: [],
    },
    {
      id: 'createDateTime',
      title: 'Created On',
      accessorKey: 'createDateTime',
      cell: ({ row }): JSX.Element =>
        (row.original.createDateTime ? (
          <DateCell date={row.original.createDateTime} />
        ) : (
          <span>NA</span>
        )),
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
    },
    {
      id: 'actions',
      title: 'Actions',
      accessorKey: 'actions',
      cell: actionCell,
      columnFunction: [],
    },
  ]

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }
  const column = getColumns<Intent>(tableStyling)

  const intentFormState: IntentFormState = {
    intentName,
    intentDesc,
    isEdit,
    creating,
    success,
    failure,
  }

  const intentFormHandlers: IntentFormHandlers = {
    setIntentName,
    setIntentDesc,
    setSuccess,
    setFailure,
    handleSubmit: handleSubmitIntent,
    resetFormState,
  }

  return (
    <PageContainer>
      {/* HEADER */}
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Intents</h2>
          <p className="text-muted-foreground">Manage ecosystem intents here</p>
        </div>

        <div className="flex items-center gap-2">
          {/* reload */}
          <button
            onClick={handleReload}
            disabled={reloading}
            title="Reload"
            className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 ${reloading ? 'animate-spin' : ''}`}
            />
          </button>

          {/* create intent */}
          <button
            onClick={handleCreateIntent}
            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" />
            Create Intent
          </button>
        </div>
      </div>

      {/* table */}
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <IntentFormDialog
          open={openCreate}
          setOpen={setOpenCreate}
          formState={intentFormState}
          handlers={intentFormHandlers}
        />

        {showConfirmModal && selectedIntent && actionType && (
          <ConfirmationModal
            openModal={showConfirmModal}
            buttonTitles={[
              'Cancel',
              actionType === 'delete' ? 'Delete' : 'Update',
            ]}
            loading={actionLoading}
            closeModal={() => {
              setShowConfirmModal(false)
              setSelectedIntent(null)
              setActionType(null)
            }}
            onSuccess={(confirmed: boolean): void => {
              if (confirmed) {
                handleConfirmedAction()
              }
            }}
            message={
              actionType === 'delete'
                ? 'Are you sure you want to delete this intent?'
                : 'Update intent functionality coming soon'
            }
            isProcessing={actionLoading}
            success={success}
            failure={failure}
            setSuccess={setSuccess}
            setFailure={setFailure}
          />
        )}

        <DataTable
          isLoading={loading}
          placeHolder="Search by intent name"
          data={intentList}
          columns={column}
          index={'id'}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          pageCount={pagination.pageCount}
          onPageChange={(index) =>
            setPagination((prev) => ({ ...prev, pageIndex: index }))
          }
          onPageSizeChange={(size) =>
            setPagination((prev) => ({
              ...prev,
              pageSize: size,
              pageIndex: 0,
            }))
          }
          onSearchTerm={(term) =>
            setPagination((prev) => ({ ...prev, searchTerm: term }))
          }
        />
      </div>
    </PageContainer>
  )
}

export default IntentList
