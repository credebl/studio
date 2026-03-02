'use client'
import {
  IColumnData,
  ITableMetadata,
  TableStyling,
  getColumns,
} from '../../../components/ui/generic-table-component/columns'

import { type ReactElement, useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  getEcosystemCreationInvitation,
  getEcosystemsForLead,
} from '@/app/api/ecosystem'

import { setEcosystemId, setEcosystemName } from '@/lib/ecosystemSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { DataTable } from '../../../components/ui/generic-table-component/data-table'
import { EcosystemRoles } from '@/features/common/enum'
import { IEcosystemTableData } from '../Interface/ecosystemInterface'
import { apiStatusCodes } from '@/config/CommonConstant'
import { fetchInvitationsSentForMembers } from '../utils/commonFunctions'
import { useRouter } from 'next/navigation'

export function Ecosystems(): ReactElement {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const sidebar = useAppSelector((state) => state.sidebar.isCollapsed)
  const [loading, setLoading] = useState<boolean>(true)
  const [tableData, setTableData] = useState([])
  const [memberInvitation, setMemberInvitation] = useState<boolean>(false)
  const [invitation, setInvitation] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const handleEcosystemClick = (
    role: EcosystemRoles,
    name: string,
    id: string,
  ): void => {
    if (role === EcosystemRoles.ecosystemLead) {
      dispatch(setEcosystemName({ name }))
      dispatch(setEcosystemId({ id }))
      router.push('/ecosystems/manage')
    }
  }

  const columnData: IColumnData[] = [
    {
      id: 'name',
      title: 'Ecosystem Name',
      accessorKey: 'name',
      columnFunction: [],
      cell: ({
        row,
      }: {
        row: { original: { name: string; role: EcosystemRoles; id: string } }
      }) => (
        <div
          onClick={() =>
            handleEcosystemClick(
              row.original.role,
              row.original.name,
              row.original.id,
            )
          }
          className="url-link"
        >
          {row.original.name[0].toUpperCase() + row.original.name.slice(1)}
        </div>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      accessorKey: 'description',
      columnFunction: [],
      cell: ({ row }: { row: { original: { description: string } } }) => (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-muted-foreground cursor-default">
                  {row.original.description &&
                  row.original.description.length < 100
                    ? row.original.description
                    : `${row.original.description.slice(0, 100)}...`}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="max-w-md">
                {row.original.description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      ),
    },
    {
      id: 'roleName',
      title: 'Role',
      accessorKey: 'roleName',
      columnFunction: [],
      cell: ({ row }: { row: { original: { role: string } } }) => (
        <div className="text-muted-foreground cursor-default">
          {row.original.role}
        </div>
      ),
    },
    {
      id: 'lead',
      title: 'Lead Organisation',
      accessorKey: 'lead',
      columnFunction: [],
      cell: ({ row }: { row: { original: { leadOrg: { name: string } } } }) => (
        <div className="text-muted-foreground cursor-default">
          {row.original.leadOrg.name}
        </div>
      ),
    },
    {
      id: 'members',
      title: 'Members',
      accessorKey: 'members',
      columnFunction: [],
      cell: ({ row }: { row: { original: { memberCount: number } } }) => (
        <div className="text-muted-foreground cursor-default">
          {row.original.memberCount}
        </div>
      ),
    },
  ]

  const fetchDataforCreateEcosystemInvites = async (): Promise<void> => {
    const response = await getEcosystemCreationInvitation()
    const { data } = response as AxiosResponse
    if (data.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setInvitation(data.status)
    }
  }

  const fetchDataforEcosystems = async (): Promise<void> => {
    const response = await getEcosystemsForLead(orgId, pagination)
    const { data } = response as AxiosResponse
    if (data.data.totalPages) {
      setPagination((prev) => ({ ...prev, totalPages: data.data.totalPages }))
    }
    if (data.data.data) {
      setTableData(data.data.data)
    }
  }

  const fetchInvitationsEcosystem = async (): Promise<void> => {
    const result = await fetchInvitationsSentForMembers(
      orgId,
      '',
      pagination,
      EcosystemRoles.ECOSYSTEM_MEMBER,
    )
    if (result.success) {
      if (result.tableData.length > 0) {
        setMemberInvitation(true)
      }
    } else {
      setMemberInvitation(true)
    }
  }

  //for ecosystem Invites
  useEffect(() => {
    try {
      fetchDataforCreateEcosystemInvites()
      fetchDataforEcosystems()
    } catch (error) {
      console.error('Error fetching Ecosystem Data for dashboard', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.pageNumber, pagination.pageSize, orgId])

  //for ecosystem data
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    try {
      timer = setTimeout(() => {
        fetchDataforEcosystems()
      }, 1000)
    } catch (error) {
      console.error('Error fetching Ecosystem Data for dashboard', error)
    } finally {
      setLoading(false)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [pagination.searchTerm])

  useEffect(() => {
    try {
      fetchDataforEcosystems()
      fetchInvitationsEcosystem()
    } catch (error) {
      console.error('Error fetching Ecosystem Data for dashboard', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const metadata: ITableMetadata = {
    enableSelection: false,
  }
  const tableStyling: TableStyling = { metadata, columnData }

  const column = getColumns<IEcosystemTableData>(tableStyling)
  return (
    <div className="mx-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ecosystems</h2>
        <p className="text-muted-foreground">
          Here&apos;s a list of all ecosystems
        </p>
      </div>
      {invitation && (
        <AlertComponent
          message={'You have been invited to cerate a new ecosystem'}
          type="warning"
          viewButton={true}
          path={'/ecosystems/manage?createNew=true'}
          onAlertClose={() => setInvitation(false)}
        />
      )}
      {memberInvitation && (
        <AlertComponent
          message={'You have pending invitations for ecosystem'}
          type="warning"
          viewButton={true}
          path={'/ecosystems/invitations'}
          onAlertClose={() => setInvitation(false)}
        />
      )}
      <div
        className={`-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12 ${sidebar ? 'w-[calc(100vw-330px)]' : ''}`}
      >
        <DataTable
          isLoading={loading}
          placeHolder="Filter by Ecosystem Name"
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
