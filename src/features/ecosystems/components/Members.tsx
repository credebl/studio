

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
import { deleteEcosystemMember, getEcosystemCreationInvitation, getEcosystemMemberInvitations, getEcosystemMembers, getEcosystemsForLead, getOrganizationsForInvite, inviteMemberToEcosystem, updateMemberStatus } from "@/app/api/ecosystem"
import { AxiosResponse } from "axios"
import { EcosystemRoles } from "@/features/common/enum"
import { setEcosystemName } from "@/lib/ecosystemSlice"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { apiStatusCodes } from "@/config/CommonConstant"
import { AlertComponent } from "@/components/AlertComponent"
import { dateConversion } from '@/utils/DateConversion'
import { EcosystemOrgStatus, MemberInvitation } from "@/common/enums"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Delete, RefreshCw, SquarePen, UserRoundX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SelectiveSearchEcosystem } from "@/components/SelectiveSearchEcosystem"
import { DotsVerticalIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DeleteIcon } from "@/config/svgs/DeleteIcon"

export function Members(): ReactElement {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [tableLoading, settableLoading] = useState(false)
  const [reloading, setReloading] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [orgList, setOrgList] = useState<{id: string, name: string}[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')
  const dispatch = useAppDispatch()

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
      id: 'organisation',
      title: 'Organisation',
      accessorKey: 'organisation',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { organisation: string } } }) => (<div className="cursor-default text-muted-foreground">{row.original.organisation}</div>)
    },
    {
      id: 'email',
      title: 'Email',
      accessorKey: 'email',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { email: string } } }) => (<div className="cursor-default">{row.original.email}</div>)
    },
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
        {row.original.status === EcosystemOrgStatus.INACTIVE && <Badge className="text-muted-foreground bg-gray-200">inactive</Badge>}
        {row.original.status === EcosystemOrgStatus.ACTIVE && <Badge className="status-accepted">active</Badge>}
      </div>)
    },
    {
      id: 'action',
      title: 'Action',
      accessorKey: 'action',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { status: string, orgId: string } } }) => (<div>
          <Popover>
              <PopoverTrigger asChild>
                  <Button variant={'ghost'}>
                      <DotsVerticalIcon />
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-50 flex flex-col  p-2 justify-start items-center" align="start">
                <Button variant={'ghost'} className="flex gap-2 text-muted-foreground w-full justify-start" onClick={()=>handleDeleteEcosystemMember(row.original.orgId)}><UserRoundX />Delete</Button>
                <hr className="w-full"/>
                <Button variant={'ghost'} className="flex gap-2 text-muted-foreground w-full justify-start" onClick={()=>handleUpdateMemberStatus(row.original.status === EcosystemOrgStatus.ACTIVE ? EcosystemOrgStatus.INACTIVE : EcosystemOrgStatus.ACTIVE, row.original.orgId)}><SquarePen /><span>{row.original.status === EcosystemOrgStatus.ACTIVE ? 'Deactivate' : 'Activate'}</span></Button>
              </PopoverContent>
          </Popover>

      </div>)
    }
  ]

  const fetchMembersForEcosystem = async () => {
    try {
      setLoading(true)
      const response = await getEcosystemMembers(ecosystemId, pagination)
      const { data } = response as AxiosResponse
      console.log("data", data)
      if (data?.data?.totalPages) {
        setPagination((prev) => ({ ...prev, totalPages: data.data.totalPages }))
      }else{
        setPagination((prev) => ({ ...prev, totalPages: 0 }))
      }
      if (data?.data?.data) {
        setTableData(data.data.data)
      }else{
        setTableData([])
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
      fetchMembersForEcosystem();
    }, delay);

    return () => clearTimeout(timer);

  }, [pagination.pageNumber, pagination.pageSize, pagination.searchTerm, orgId]);


  useEffect(()=>{
    setTimeout(()=>{
      setSuccess(null)
      setError(null)
    },3000)
  },[success,error])

  const handleUpdateMemberStatus = async (status: EcosystemOrgStatus, orgId: string) => {
    console.log("status",status,orgId)
    settableLoading(true)
    try {
      const payload = {
        orgIds : [orgId],
        ecosystemId
      }
      const response = await updateMemberStatus(status, payload)
      const {data} = response as AxiosResponse
      console.log("data",data)
      console.log("response",response)
      console.log("data.status",data.status)
      if (data && data.statusCode === apiStatusCodes.API_STATUS_SUCCESS){
        console.log("success",data.message)
        setSuccess('Successfully updated the ecosystem member status')
        fetchMembersForEcosystem()
      }
    } catch (err) {
      console.error("failed to update member status",err)
      setError('Failed to update status for member')
    } finally {
      settableLoading(false)
    }
  }

  const handleDeleteEcosystemMember = async (orgId: string) =>  {
    settableLoading(true)
    console.log("orgId",orgId)
    try {
      const payload = {
        orgIds : [orgId],
        ecosystemId
      }
      const response = await deleteEcosystemMember(payload)
      const {data} = response as AxiosResponse
      console.log("data",data)
      console.log("response",response)
      console.log("data.status",data.status)
      if (data && data.statusCode === apiStatusCodes.API_STATUS_SUCCESS){
        console.log("success",data.message)
        setSuccess('Ecosystem member deleted successfully')
        fetchMembersForEcosystem()
      }
    } catch (err) {
      console.error("Failed to delete member",err)
      setError('Failed to delete member')
    } finally {
      settableLoading(false)
    }
  }

  const metadata: ITableMetadata = {
    enableSelection: false,
  }

  const tableStyling: TableStyling = { metadata, columnData }

  const column = getColumns<any>(tableStyling)
  return <div className="">
    <div className="mb-2">
      {/* <p className="text-muted-foreground">
            Here&apos;s a list of all ecosystems
      </p> */}
    </div>
      {
        (!!error || !!success) &&
        <AlertComponent
          message={success ?? error}
          type={success ? 'success' : 'failure'}
          onAlertClose={() =>{ setError(null); setSuccess(null)}}
        />
      }
    <div className="flex justify-end relative">
      <div className="flex items-center gap-2 absolute">
        {/* Reload Button */}
        <button
          onClick={() => (fetchMembersForEcosystem())}
          disabled={loading}
          title="Reload table data"
          className="bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCw
            className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-auto py-4 px-1 lg:flex-row lg:space-y-0 lg:space-x-12">
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
}
