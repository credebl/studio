/* eslint-disable max-lines */
'use client'

import { DidMethod, SchemaTypes } from '@/common/enums'
import {
  GetUserProfileResponse,
  ISchemaDataSchemaList as ISchemaData,
  ISidebarSliderData,
  IW3cSchemaDetails,
  SchemaListItem,
  UserOrgRole,
} from '../type/schemas-interface'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { apiStatusCodes, itemPerPage } from '../../../config/CommonConstant'
import { getAllSchemas, getAllSchemasByOrgId } from '@/app/api/schema'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyMessage } from '@/components/EmptyMessage'
import { GetAllSchemaListParameter } from '@/features/dashboard/type/schema'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { Plus } from 'lucide-react'
import SchemaCard from './SchemaCard'
import SchemaListPagination from './SchemaListPagination'
import SidePanelComponent from '@/config/SidePanelCommon'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrganizationById } from '@/app/api/organization'
import { getUserProfile } from '@/app/api/Auth'
import { useRouter } from 'next/navigation'

const generatePaginationNumbers = (
  currentPage: number,
  lastPage: number,
  paginationRange: number = 2,
): (number | string)[] => {
  const startPage = Math.max(1, currentPage - paginationRange)
  const endPage = Math.min(lastPage, currentPage + paginationRange)
  const paginationNumbers = []

  if (startPage > 1) {
    paginationNumbers.push(1)
    if (startPage > 2) {
      paginationNumbers.push('...')
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationNumbers.push(i)
  }

  if (endPage < lastPage) {
    if (endPage < lastPage - 1) {
      paginationNumbers.push('...')
    }
    paginationNumbers.push(lastPage)
  }

  return paginationNumbers
}

const SchemaList = (props: {
  schemaSelectionCallback?: (
    schemaId: string,
    schemaDetails: SchemaListItem,
  ) => void

  W3CSchemaSelectionCallback?: (
    schemaId: string,
    w3cSchemaDetails: IW3cSchemaDetails,
  ) => void

  verificationFlag?: boolean
}): React.ReactElement => {
  const verificationFlag = props.verificationFlag ?? false
  const organizationId = useAppSelector((state) => state.organization.orgId)
  const token = useAppSelector((state) => state.auth.token)
  const allSchemaSliceData = useAppSelector(
    (state) => state.storageKeys.ALL_SCHEMAS,
  )

  const [schemaList, setSchemaList] = useState<ISchemaData[]>([])

  const [, setSchemaListErr] = useState<string | null>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [allSchemaFlag] = useState<boolean>(allSchemaSliceData ?? false)
  const [ledger, setLedger] = useState<string>('')
  const [schemaType, setSchemaType] = useState('')
  const [totalItem, setTotalItem] = useState(0)
  const [lastPage, setLastPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [w3cSchema, setw3cSchema] = useState<boolean>(false)
  const [isNoLedger, setIsNoLedger] = useState<boolean>(false)
  const [orgRole, setOrgRole] = useState<string | null>(null)
  const [orgRoles, setOrgRoles] = useState<(string | null)[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [sideBarFields, setSideBarFields] = useState<ISidebarSliderData[]>([])

  const route = useRouter()
  const dispatch = useAppDispatch()

  const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
    itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: '',
  })
  // const options = ['All schemas']
  // const optionsWithDefault = ["Organization's schema", ...options]
  const skeletonIds = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4']

  const processDidSettings = (did: string): void => {
    if (
      did.includes(DidMethod.POLYGON) ||
      did.includes(DidMethod.KEY) ||
      did.includes(DidMethod.WEB)
    ) {
      setw3cSchema(true)
      setSchemaType(SchemaTypes.schema_W3C)
    }

    if (did.includes(DidMethod.INDY)) {
      setw3cSchema(false)
      setSchemaType(SchemaTypes.schema_INDY)
    }

    if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
      setIsNoLedger(true)
    }
  }
  const extractUserRoles = (
    roles: UserOrgRole[],
    organizationId: string,
  ): { orgRole: string | null; orgRoles: (string | null)[] } => {
    const matchedRole = roles.find(
      (role: UserOrgRole) => role.orgId === organizationId,
    )
    const matchingRoles = roles
      .map((role: UserOrgRole) => {
        if (role.orgId === organizationId) {
          return role?.orgRole?.name
        }
        return null
      })
      .filter(Boolean)

    return {
      orgRole: matchedRole?.orgRole?.name || null,
      orgRoles: matchingRoles,
    }
  }

  useEffect(() => {
    async function fetchProfile(): Promise<void> {
      if (!token || !organizationId) {
        return
      }

      try {
        const response = await getUserProfile(token)

        if (typeof response === 'string') {
          console.error('API error:', response)
          setOrgRole(null)
          return
        }

        const typedResponse = response as AxiosResponse<GetUserProfileResponse>

        const roles = typedResponse?.data?.data?.userOrgRoles ?? []
        const { orgRole, orgRoles } = extractUserRoles(roles, organizationId)
        setOrgRoles(orgRoles)
        setOrgRole(orgRole)
      } catch (error) {
        console.error('Unexpected fetch error:', error)
        setOrgRole(null)
      }
    }

    fetchProfile()
  }, [token, organizationId, dispatch])

  const getSchemaList = async (
    schemaListAPIParameter: GetAllSchemaListParameter,
    flag: boolean,
  ): Promise<void> => {
    try {
      setLoading(true)
      let schemaResponse = undefined
      if (flag) {
        schemaResponse = await getAllSchemas(
          schemaListAPIParameter,
          schemaType,
          ledger,
        )
      } else {
        schemaResponse = await getAllSchemasByOrgId(
          schemaListAPIParameter,
          organizationId,
        )
      }

      const { data } = schemaResponse as AxiosResponse

      if (!data || data === 'Schema records not found') {
        setSchemaList([])
        setLoading(false)
        return
      }

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const schemaData = data?.data?.data
        if (data?.data?.data) {
          setLastPage(data?.data?.lastPage - 1)
          setTotalItem(data?.data?.totalItems)
          setSchemaList([...schemaData])
        } else {
          setSchemaListErr(schemaResponse as string)
        }
      } else {
        setSchemaListErr(schemaResponse as string)
      }
    } catch (error) {
      console.error('Error while fetching schema list:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setSchemaListErr(''), 3000)
    }
  }

  const fetchOrganizationDetails = async (
    organizationId: string,
  ): Promise<void> => {
    setLoading(true)
    const response = await getOrganizationById(organizationId)
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid
      const ledgerId = data?.data?.org_agents?.[0]?.ledgers?.id ?? ''
      setLedger(ledgerId)

      if (did) {
        processDidSettings(did)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    if (organizationId) {
      setLoading(true)
      fetchOrganizationDetails(organizationId)
        .then(() => {
          getSchemaList(schemaListAPIParameter, allSchemaFlag)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [organizationId])

  useEffect(() => {
    if (organizationId) {
      getSchemaList(schemaListAPIParameter, allSchemaFlag)
    }
  }, [
    schemaListAPIParameter.page,
    schemaListAPIParameter.allSearch,
    schemaListAPIParameter.search,
    schemaType,
    ledger,
  ])

  const onSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    const inputValue = event.target.value
    setSearchValue(inputValue)

    const updatedParams = {
      ...schemaListAPIParameter,
      search: allSchemaFlag ? '' : inputValue,
      allSearch: allSchemaFlag ? inputValue : '',
    }

    setSchemaListAPIParameter(updatedParams)
  }

  // Temporarily commented will be worked on later
  // const handleFilterChange = async (value: string): Promise<void> => {
  //   const isAllSchemas = value === 'All schemas'

  //   setSelectedValue(value)
  //   setAllSchemaFlag(isAllSchemas)
  //   dispatch(setAllSchema(isAllSchemas))

  //   setSchemaListAPIParameter({
  //     itemPerPage,
  //     page: 1,
  //     search: '',
  //     sortBy: 'id',
  //     sortingOrder: 'desc',
  //     allSearch: '',
  //   })

  //   setSearchValue('')

  //   if (organizationId) {
  //     setLoading(true)
  //     try {
  //       await getSchemaList(
  //         {
  //           itemPerPage,
  //           page: 1,
  //           search: '',
  //           sortBy: 'id',
  //           allSearch: '',
  //         },
  //         isAllSchemas,
  //       )
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  // }

  const schemaSelectionCallback = ({
    schemaId,
    attributes,
    issuerDid,
    created,
  }: {
    schemaId: string
    attributes: string[]
    issuerDid: string
    created: string
  }): void => {
    const schemaDetails = {
      attribute: attributes,
      issuerDid,
      createdDate: created,
    }
    props.schemaSelectionCallback?.(schemaId, schemaDetails)
  }

  const W3CSchemaSelectionCallback = ({
    schemaId,
    schemaName,
    version,
    issuerDid,
    attributes,
    created,
  }: {
    schemaId: string
    schemaName: string
    version: string
    issuerDid: string
    attributes: []
    created: string
  }): void => {
    const w3cSchemaDetails = {
      schemaId,
      schemaName,
      version,
      issuerDid,
      attributes,
      created,
    }
    props.W3CSchemaSelectionCallback?.(schemaId, w3cSchemaDetails)
  }
  const paginationNumbers = generatePaginationNumbers(
    schemaListAPIParameter.page,
    lastPage,
  )

  const isAdmin = orgRoles.includes('admin') || orgRoles.includes('owner')

  const handleClick = (): void => {
    if (isAdmin) {
      setLoading(true)
      route.push('/schemas/create')
    }
  }

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="mb-4 grid gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <h1 className="mr-auto ml-1 text-xl font-semibold sm:text-2xl">
            Schemas
          </h1>

          <div className="relative w-full sm:max-w-sm">
            <Input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={onSearch}
              className="h-10 rounded-lg pr-4 pl-10"
            />
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          </div>
          {/* Commented temporarily will we worked on later */}
          {/* <Select
            defaultValue={
              allSchemaSliceData ? 'All schemas' : "Organization's schema"
            }
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="min-h-[42px] w-[230px] rounded-lg border p-2.5 text-sm">
              <SelectValue placeholder="Select schema type" />
            </SelectTrigger>
            <SelectContent>
              {optionsWithDefault.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
          <Button
            onClick={handleClick}
            disabled={loading || !isAdmin}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader size={20} /> : <Plus className="mr-2 h-4 w-4" />}
            {loading ? 'Loading...' : 'Create'}
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {skeletonIds.map((id) => (
              <div key={id} className="space-y-3 rounded-lg p-4 shadow-sm">
                <Skeleton className="h-5 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-2/4 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading &&
          (schemaList.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {schemaList.map((element) => (
                  <div
                    className="px-0 sm:px-2"
                    key={`SchemaList-${element?.schemaLedgerId}`}
                  >
                    <SchemaCard
                      schemaName={element?.name}
                      version={element['version']}
                      schemaId={element['schemaLedgerId']}
                      issuerName={element['organizationName'] || 'N/A'}
                      issuerDid={element['issuerId'] || 'N/A'}
                      attributes={element['attributes']}
                      created={element['createDateTime']}
                      showCheckbox={false}
                      selectedSchemas={[]}
                      onClickCallback={schemaSelectionCallback}
                      onClickW3CCallback={W3CSchemaSelectionCallback}
                      w3cSchema={w3cSchema}
                      noLedger={isNoLedger}
                      isVerification={verificationFlag}
                      onTitleClick={(e: React.MouseEvent): void => {
                        e.stopPropagation()
                        setIsDrawerOpen(true)
                        setSideBarFields([
                          {
                            label: 'Schema ID',
                            value: element.schemaLedgerId,
                            copyable: true,
                          },
                          {
                            label: 'Publisher DID',
                            value: element.publisherDid,
                            copyable: true,
                          },
                          {
                            label: 'Issuer ID',
                            value: element.issuerId,
                            copyable: true,
                          },
                        ])
                      }}
                    />
                  </div>
                ))}
              </div>
              {totalItem > itemPerPage &&
                (schemaList.length === itemPerPage ||
                  schemaListAPIParameter.page === lastPage) && (
                  <SchemaListPagination
                    {...{
                      schemaListAPIParameter,
                      paginationNumbers,
                      setSchemaListAPIParameter,
                      lastPage,
                    }}
                  />
                )}
            </>
          ) : (
            <EmptyMessage
              title="No Schemas"
              description="Get started by creating a new Schema"
              buttonContent={!loading ? 'Create' : undefined}
              buttonIcon={
                loading ? <Loader size={20} /> : <Plus className="h-4 w-4" />
              }
              onClick={() => {
                if (orgRole === 'admin' || orgRole === 'owner') {
                  setLoading(true)
                  route.push('/schemas/create')
                }
              }}
              disabled={(orgRole !== 'admin' && orgRole !== 'owner') || loading}
            />
          ))}
      </div>
      <SidePanelComponent
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title={'Schema Details'}
        description={'Detailed view of selected Schema'}
        fields={sideBarFields}
      />
    </PageContainer>
  )
}

export default SchemaList
