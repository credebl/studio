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
import { getEcosystemCreationInvitation, getEcosystemsForLead } from "@/app/api/ecosystem"
import { AxiosResponse } from "axios"
import { EcosystemRoles } from "@/features/common/enum"
import { setEcosystemId, setEcosystemName } from "@/lib/ecosystemSlice"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { apiStatusCodes } from "@/config/CommonConstant"
import { AlertComponent } from "@/components/AlertComponent"

export function Ecosystems(): ReactElement {
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [walletCreated, setWalletCreated] = useState(false)
  const [isW3C, setIsW3C] = useState(false)
  const [reloading, setReloading] = useState<boolean>(false)
  const [invitation, setInvitation] = useState<boolean>(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const dispatch = useAppDispatch()
  let timer: NodeJS.Timeout

  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

 const handleEcosystemClick = (role: EcosystemRoles, name:string, id: string)=> {
  if (role === EcosystemRoles.ecosystemLead){
    dispatch(setEcosystemName({name}))
    dispatch(setEcosystemId({id}))
    router.push("/ecosystems/manage")
  }
 }

 const columnData: IColumnData[] = [
    {
      id: 'name',
      title: 'Ecosystem Name',
      accessorKey: 'name',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { name: string, role: EcosystemRoles, id: string } }}) => (<div onClick={()=>handleEcosystemClick(row.original.role,row.original.name, row.original.id)} className="url-link">{row.original.name[0].toUpperCase() + row.original.name.slice(1)}</div>)
    },
    {
      id: 'description',
      title: 'Description',
      accessorKey: 'description',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { description: string } }}) => (
        <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
            <div className="cursor-default text-muted-foreground">{row.original.description && 100 > row.original.description.length ? row.original.description : row.original.description.slice(0,100) + '...'}</div>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} className="max-w-md">
                  {row.original.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </>
    )
    },
    {
      id: 'roleName',
      title: 'Role',
      accessorKey: 'roleName',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { role: string } }}) => (<div className="cursor-default text-muted-foreground">{row.original.role}</div>)
    },
    {
      id: 'lead',
      title: 'Lead Organisation',
      accessorKey: 'lead',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { leadOrg : {name: string} } }}) => (<div className="cursor-default text-muted-foreground">{row.original.leadOrg.name}</div>)
    },
    {
      id: 'members',
      title: 'Members',
      accessorKey: 'members',
      columnFunction: [
      ],
      cell: ({ row }: { row: { original: { memberCount: number } }}) => (<div className="cursor-default text-muted-foreground">{row.original.memberCount - 1}</div>)
    }
	]


	const fetchDataforCreateEcosystemInvites= async () => {
	 const response = await getEcosystemCreationInvitation()	  
   const { data } = response as AxiosResponse
   console.log("data",data.statusCode)
   if (data.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
     console.log("set Invitaitons")
     setInvitation(data.status)
   }
  }

	const fetchDataforEcosystems= async () => {
	 const response = await getEcosystemsForLead(orgId, pagination)	  
   const { data } = response as AxiosResponse
   if(data.data.totalPages) {
    setPagination((prev) => ({...prev, totalPages: data.data.totalPages }))
   }
   if (data.data.data) {
     setTableData(data.data.data)
   }
   console.log("data",data)
  }

	useEffect(()=>{
    try {
      fetchDataforCreateEcosystemInvites()
      fetchDataforEcosystems()
    } catch (error) {
     console.error("Error fetching Ecosystem Data for dashboard",error) 
    }finally{
      setLoading(false)	
    }
	},[pagination.pageNumber, pagination.pageSize, orgId])

	useEffect(()=>{
    try {
      if (timer){
        clearTimeout(timer)
      }
      timer = setTimeout(()=>{fetchDataforEcosystems()},1000)
    } catch (error) {
     console.error("Error fetching Ecosystem Data for dashboard",error) 
    }finally{
      setLoading(false)	
    }
	},[pagination.searchTerm])
 
	useEffect(()=>{
    try {
      fetchDataforEcosystems()
    } catch (error) {
     console.error("Error fetching Ecosystem Data for dashboard",error) 
    }finally{
      setLoading(false)	
    }
	},[])

  const metadata: ITableMetadata = {
    enableSelection: false,
  }
  const tableStyling: TableStyling = { metadata, columnData }

  const column = getColumns<any>(tableStyling)
	return <div className="mx-6">
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
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
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
}
