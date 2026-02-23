
'use client'
import { useEffect, useState, type ReactElement } from "react"

import {
  IColumnData,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from '../../../components/ui/generic-table-component/columns'
import { PaginationState } from "@/common/interface"
import { DataTable } from '../../../components/ui/generic-table-component/data-table'
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { getEcosystemCreationInvitation, getEcosystemMemberInvitations, getEcosystemsForLead, getOrganizationsForInvite } from "@/app/api/ecosystem"
import { AxiosResponse } from "axios"
import { EcosystemRoles } from "@/features/common/enum"
import { setEcosystemName } from "@/lib/ecosystemSlice"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { apiStatusCodes } from "@/config/CommonConstant"
import { AlertComponent } from "@/components/AlertComponent"
import { dateConversion } from '@/utils/DateConversion'
import { MemberInvitation } from "@/common/enums"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SelectiveSearchEcosystem } from "@/components/SelectiveSearchEcosystem"

export function Invitaitons(): ReactElement {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [orgLoading, setOrgLoading] = useState(false)
  const [reloading, setReloading] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [orgList, setOrgList] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const dispatch = useAppDispatch()
  let timer: NodeJS.Timeout

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
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { email: string } } }) => (<div className="url-link">{row.original.email}</div>)
    },
    // {
    //   id: 'ecosystem',
    //   title: 'Ecosystem',
    //   accessorKey: 'ecosystem',
    //   columnFunction: [
    //   ],
    //   cell: ({ row }: { row: { original: { ecosystem: { name: string} }}}) => (
    //     <div className="cursor-default text-muted-foreground">
    //       {row.original.ecosystem.name}
    //     </div>
    // )
    // },
    {
      id: 'date',
      title: 'Date',
      accessorKey: 'date',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { createDateTime: string } } }) => (<div className="cursor-default text-muted-foreground">{dateConversion(row.original.createDateTime)}</div>)
    },
    {
      id: 'status',
      title: 'Status',
      accessorKey: 'status',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { status: string } } }) => (<div className="cursor-default text-muted-foreground">
        {row.original.status === MemberInvitation.PENDING && <Badge className="status-pending">pending</Badge>}
        {row.original.status === MemberInvitation.ACCEPTED && <Badge className="status-accepted">accepted</Badge>}
      </div>)
    },
    {
      id: 'invitedOrg',
      title: 'Invited Org',
      accessorKey: 'invitedOrg',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { organisation: { name: string } } } }) => (<div className="cursor-default text-muted-foreground">{row.original.organisation.name}</div>)
    }
  ]


  const fetchInvitationsSentForMembers = async () => {
    try {
      setLoading(true)
      const response = await getEcosystemMemberInvitations(orgId, ecosystemId, pagination)
      const { data } = response as AxiosResponse
      console.log("data", data)
      if (data.data.totalPages) {
        setPagination((prev) => ({ ...prev, totalPages: data.data.totalPages }))
      }
      if (data.data.data) {
        setTableData(data.data.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const delay = pagination.searchTerm ? 500 : 0; 
    
    const timer = setTimeout(() => {
      fetchInvitationsSentForMembers();
    }, delay);

    return () => clearTimeout(timer);

  }, [pagination.pageNumber, pagination.pageSize, pagination.searchTerm, orgId]);

  const fetchOrganizationsList = async ():Promise<void> =>{
    if(openModal){
      setOrgLoading(true)
      try{
        const response = await getOrganizationsForInvite(orgId,paginationOrgList)
        const { data } = response as AxiosResponse
      console.log("data", data)
      if (data?.data?.orgs) {
        setOrgList(data.data.orgs)
      }
      }catch(error){
        console.error('Error fetching organizations',error)
      }finally{
        setOrgLoading(false)
      }    
    }
  }

  useEffect(()=>{
    if (openModal) {
      fetchOrganizationsList()
    }
  },[openModal])

  const metadata: ITableMetadata = {
    enableSelection: false,
  }
  const tableStyling: TableStyling = { metadata, columnData }

  const column = getColumns<any>(tableStyling)
  return <div className="">

    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Send Invitation(s)</DialogTitle>
        </DialogHeader>

        {error && (
          <AlertComponent
            message={error}
            type="failure"
            onAlertClose={() => setError(null)}
          />
        )}
        {/* <SelectiveSearchEcosystem
          options={orgList}
          value={'Select'}
          getOptionValue={(u) => u.id}
          getOptionLabel={(u) => u.name}
          onValueChange={(u) => setUserId(u.email)}
          placeholder="Find a member..."
        /> */}
        </DialogContent>
      </Dialog>
    <div>
      {/* <p className="text-muted-foreground">
            Here&apos;s a list of all ecosystems
          </p> */}
    </div>
    <div className="flex justify-end relative">
      <div className="flex items-center gap-2 absolute">
        {/* Reload Button */}
        <button
          onClick={() => (fetchInvitationsSentForMembers())}
          disabled={loading}
          title="Reload table data"
          className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCw
            className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
        <Button onClick={()=>setOpenModal(true)}>
          Invite Member
        </Button>
      </div>
    </div>
    <div className="flex-1 overflow-auto py-4 px-1 lg:flex-row lg:space-y-0 lg:space-x-12">
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
}
