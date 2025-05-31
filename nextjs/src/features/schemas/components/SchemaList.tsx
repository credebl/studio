'use client'

import { DidMethod, SchemaTypes } from '@/common/enums'
import { IW3cSchemaDetails, SchemaListItem } from '../type/schemas-interface'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { ChangeEvent, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiStatusCodes, itemPerPage } from '../../../config/CommonConstant'
import { getAllSchemas, getAllSchemasByOrgId } from '@/app/api/schema'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyMessage } from '@/components/EmptyMessage'
import { GetAllSchemaListParameter } from '@/features/dashboard/type/schema'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import PageContainer from '@/components/layout/page-container'
import { Plus } from 'lucide-react'
import SchemaCard from './SchemaCard'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface IAttributesDetails {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}
export interface ISchemaData {
  createDateTime: string
  name: string
  version: string
  attributes: IAttributesDetails[]
  schemaLedgerId: string
  createdBy: string
  publisherDid: string
  orgId: string
  issuerId: string
  organizationName: string
  userName: string
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
  const ledgerId = useAppSelector((state) => state.organization.ledgerId)
  // const [schemaList, setSchemaList] = useState<SetStateAction<never[]>>([])
  const [schemaList, setSchemaList] = useState<ISchemaData[]>([])

  const [, setSchemaListErr] = useState<string | null>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false)
  const [schemaType, setSchemaType] = useState('')
  const [, setWalletStatus] = useState(false)
  const [totalItem, setTotalItem] = useState(0)
  const [lastPage, setLastPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [, setSelectedValue] = useState<string>('Organizations schema')
  const [w3cSchema, setW3CSchema] = useState<boolean>(false)
  const [isNoLedger, setIsNoLedger] = useState<boolean>(false)

  const route = useRouter()

  const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
    itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: '',
  })
  const options = ['All schemas']
  const optionsWithDefault = ["Organization's schema", ...options]
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
          ledgerId,
        )
      } else {
        schemaResponse = await getAllSchemasByOrgId(
          schemaListAPIParameter,
          organizationId,
        )
      }

      const { data } = schemaResponse as AxiosResponse

      if (data === 'Schema records not found') {
        setSchemaList([])
        setLoading(false)
        return
      }

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const schemaData = data?.data?.data
        if (data?.data?.data) {
          setLastPage(data?.data?.lastPage)
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

      if (data?.data?.org_agents && data?.data?.org_agents.length > 0) {
        setWalletStatus(true)
      }

      if (did) {
        if (
          did.includes(DidMethod.POLYGON) ||
          did.includes(DidMethod.KEY) ||
          did.includes(DidMethod.WEB)
        ) {
          setW3CSchema(true)
          setSchemaType(SchemaTypes.schema_W3C)
        }

        if (did.includes(DidMethod.INDY)) {
          setW3CSchema(false)
          setSchemaType(SchemaTypes.schema_INDY)
        }

        if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
          setIsNoLedger(true)
        }
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
  }, [organizationId, schemaListAPIParameter, allSchemaFlag])

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

  const handleFilterChange = async (value: string): Promise<void> => {
    const isAllSchemas = value === 'all'

    setSelectedValue(value)
    setAllSchemaFlag(isAllSchemas)

    setSchemaListAPIParameter((prev) => ({ ...prev, page: 1 }))
  }

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
          <Select
            defaultValue="Organization's schema"
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
          </Select>
          <Button
            onClick={() => route.push('/organizations/schemas/create')}
            className="w-full sm:w-auto"
          >
            <Plus /> Create
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="space-y-3 rounded-lg p-4 shadow-sm">
                <Skeleton className="h-5 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-2/4 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
              </div>
            ))}
          </div>
        ) : schemaList.length ? (
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
                    issuerDid={element['issuerId']}
                    attributes={element['attributes']}
                    created={element['createDateTime']}
                    showCheckbox={false}
                    selectedSchemas={[]}
                    onClickCallback={schemaSelectionCallback}
                    onClickW3CCallback={W3CSchemaSelectionCallback}
                    w3cSchema={w3cSchema}
                    noLedger={isNoLedger}
                    isVerification={verificationFlag}
                  />
                </div>
              ))}
            </div>
            {totalItem > itemPerPage && (
              <div className="mt-6 flex justify-end">
                <Pagination className='w-fit m-0'>
                  <PaginationContent>
                    {schemaListAPIParameter.page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={() =>
                            setSchemaListAPIParameter((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: lastPage }).map((_, index) => {
                      const page = index + 1
                      const isActive = page === schemaListAPIParameter.page
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            className={`${
                              isActive
                                ? 'bg-primary text-[var(--color-white)]'
                                : 'bg-background text-muted-foreground'
                            } rounded-lg px-4 py-2`}
                            href="#"
                            onClick={() =>
                              setSchemaListAPIParameter((prev) => ({
                                ...prev,
                                page,
                              }))
                            }
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    {schemaListAPIParameter.page < lastPage && (
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={() =>
                            setSchemaListAPIParameter((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <EmptyMessage
            title="No Schemas"
            description="Get started by creating a new Schema"
            buttonContent="Create Schema"
            onClick={() => {
              route.push('/organizations/schemas/create')
            }}
          />
        )}
      </div>
    </PageContainer>
  )
}

export default SchemaList
