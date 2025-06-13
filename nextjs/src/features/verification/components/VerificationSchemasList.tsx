/* eslint-disable max-lines */
'use client'

import { ArrowRight, Plus } from 'lucide-react'
import { DidMethod, Features, SchemaTypes } from '@/common/enums'
import { IAttributesDetails, ISchema, ISchemaData } from '../type/interface'
import { JSX, useEffect, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiStatusCodes, itemPerPage } from '@/config/CommonConstant'
import { getAllSchemas, getAllSchemasByOrgId } from '@/app/api/schema'
import {
  setSchemaAttributes,
  setSchemaId,
  setSelectedSchemasData,
  setW3CSchemaAttributes,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyMessage } from '@/components/EmptyMessage'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import RoleViewButton from '@/components/RoleViewButton'
import SchemaCard from '@/features/schemas/components/SchemaCard'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'

const VerificationSchemasList = (): JSX.Element => {
  const [schemasList, setSchemasList] = useState([])
  const [schemasDetailsErr, setSchemasDetailsErr] = useState<string | null>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [allSchemasFlag, setAllSchemasFlag] = useState<boolean>(false)
  const [schemasListParameter, setSchemasListParameter] = useState({
    itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: '',
  })
  const [walletStatus, setWalletStatus] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [selectedSchemas, setSelectedSchemas] = useState<ISchema[]>([])
  const [selectedSchemaArray, setSelectedSchemaArray] = useState<ISchema[]>([])

  const [w3cSchema, setW3cSchema] = useState<boolean>(false)
  const [isNoLedger, setIsNoLedger] = useState<boolean>(false)
  const [schemaType, setSchemaType] = useState('')

  const route = useRouter()
  const dispatch = useAppDispatch()
  const organizationId = useAppSelector((state) => state.organization.orgId)
  const ledgerId = useAppSelector((state) => state.organization.ledgerId)
  const selectedSchemaState = useAppSelector(
    (state) => state.verification.selectedSchemas,
  )
  const getSchemaListDetails = async (): Promise<void> => {
    try {
      setLoading(true)
      let schemasList = null
      if (allSchemasFlag) {
        schemasList = await getAllSchemas(
          schemasListParameter,
          schemaType,
          ledgerId,
        )
      } else {
        schemasList = await getAllSchemasByOrgId(
          schemasListParameter,
          organizationId,
        )
      }

      const { data } = schemasList as AxiosResponse

      if (schemasList === 'Schema records not found') {
        setLoading(false)
        setSchemasList([])
      }

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data?.data?.data) {
          setTotalItems(data?.data?.lastPage)
          setSchemasList(data?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          if (schemasList !== 'Schema records not found') {
            setSchemasDetailsErr(schemasList as string)
          }
        }
      } else {
        setLoading(false)
        if (schemasList !== 'Schema records not found') {
          setSchemasDetailsErr(schemasList as string)
        }
      }
      setTimeout(() => {
        setSchemasDetailsErr('')
      }, 3000)
    } catch (error) {
      console.error('Error while fetching schema list:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getSchemaListDetails()
  }, [schemasListParameter, allSchemasFlag, organizationId])

  const onSchemaListParameterSearch = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    event.preventDefault()
    const inputValue = event.target.value
    setSearchValue(inputValue)

    setSchemasListParameter((prevParams) => ({
      ...prevParams,
      ...(allSchemasFlag ? { allSearch: inputValue } : { search: inputValue }),
      page: 1,
    }))
  }

  const handleSchemaSelection = (
    schemaId: string,
    attributes: IAttributesDetails[],
    issuerId: string,
    created: string,
    checked: boolean,
  ): void => {
    const schemaDetails = {
      schemaId,
      attributes,
      issuerId,
      createdDate: created,
    }

    if (checked) {
      setSelectedSchemas((prevSelectedSchemas) => [
        ...prevSelectedSchemas,
        schemaDetails,
      ])
    } else {
      setSelectedSchemas((prevSelectedSchemas) =>
        prevSelectedSchemas.filter((schema) => schema.schemaId !== schemaId),
      )
    }
  }

  const handleW3cSchemas = async (
    checked: boolean,
    schemaData?: ISchemaData,
  ): Promise<void> => {
    const updateSchemas = (prevSchemas: ISchema[]): ISchema[] => {
      let updatedSchemas = [...prevSchemas]
      if (checked && schemaData) {
        const schema = {
          ...schemaData,
          schemaId: schemaData.schemaId ?? '',
          createdDate: schemaData.createDateTime,
        }
        updatedSchemas = [...updatedSchemas, schema]
      } else {
        updatedSchemas = updatedSchemas.filter(
          (schema) => schema?.schemaLedgerId !== schemaData?.schemaLedgerId,
        )
      }
      return updatedSchemas
    }

    setSelectedSchemas((prevSchemas) => {
      if (!Array.isArray(prevSchemas)) {
        console.error('Previous schemas is not an array:', prevSchemas)
        return []
      }
      return updateSchemas(prevSchemas)
    })

    setSelectedSchemaArray((prevSchemas) => updateSchemas(prevSchemas))
  }

  useEffect(() => {
    if (selectedSchemaArray.length > 0) {
      dispatch(setSelectedSchemasData(selectedSchemaArray))
    }
  }, [selectedSchemaArray])

  const fetchOrganizationDetails = async (): Promise<void> => {
    setLoading(true)
    const response = await getOrganizationById(organizationId)
    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid

      if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
        setWalletStatus(true)
      }
      if (typeof did === 'string') {
        const isPolygon = did.includes(DidMethod.POLYGON)
        const isKey = did.includes(DidMethod.KEY)
        const isWeb = did.includes(DidMethod.WEB)
        const isIndy = did.includes(DidMethod.INDY)

        if (isPolygon || isKey || isWeb) {
          setW3cSchema(true)
          setSchemaType(SchemaTypes.schema_W3C)
        }

        if (isIndy) {
          setW3cSchema(false)
          setSchemaType(SchemaTypes.schema_INDY)
        }

        if (isKey || isWeb) {
          setIsNoLedger(true)
        }
      }
    }
    setLoading(false)
  }

  const handleContinue = async (): Promise<void> => {
    const schemaIds = selectedSchemas?.map((schema) => schema?.schemaId)
    dispatch(setSchemaId(schemaIds))

    const schemaAttributes = selectedSchemas.map((schema) => ({
      schemaId: schema.schemaId,
      attributes: schema.attributes,
    }))

    dispatch(setSchemaAttributes(schemaAttributes))
    route.push(`${pathRoutes.organizations.verification.emailCredDef}`)
  }

  const handleW3CSchemaDetails = async (): Promise<void> => {
    const w3cSchemaAttributes = selectedSchemaState
      .filter((schema) => schema.schemaLedgerId)
      .map((schema) => ({
        schemaId: schema.schemaLedgerId ?? '',
        attributes: schema.attributes,
        schemaName: schema.name ?? '',
      }))

    dispatch(setW3CSchemaAttributes(w3cSchemaAttributes))
    route.push(`${pathRoutes.organizations.verification.w3cAttributes}`)
  }

  const options = ['All schemas']
  const optionsWithDefault = ["Organization's schema", ...options]

  const handleFilter = async (value: string): Promise<void> => {
    const selectedFilter = value
    setAllSchemasFlag(selectedFilter === 'All schemas')

    setSchemasListParameter((prevParams) => ({
      ...prevParams,
      page: 1,
      search: '',
      allSearch: '',
    }))
    setSearchValue('')
  }
  useEffect(() => {
    fetchOrganizationDetails()
    setSearchValue('')
  }, [])

  const createSchemaButtonTitle = {
    title: 'Create',
    svg: <Plus />,
    toolTip: 'Create new schema',
  }

  const emptySchemaListTitle = 'No Schemas'
  const emptySchemaListDescription = 'Get started by creating a new Schema'
  const emptySchemaListBtn = { title: 'Create Schema', svg: <Plus /> }
  return (
    <PageContainer>
      <div className="px-4 pt-2">
        {schemasDetailsErr && (
          <div className="mb-4 flex flex-col space-y-4">
            <AlertComponent
              message={schemasDetailsErr}
              type="failure"
              onAlertClose={() => setSchemasDetailsErr('')}
            />
          </div>
        )}

        <div>
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-muted-foreground mr-auto ml-1 text-xl font-semibold sm:text-2xl">
                Schemas
              </h1>
              <div className="relative w-full sm:max-w-sm">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={onSchemaListParameterSearch}
                  className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-4 pl-10 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              </div>

              <Select
                defaultValue="Organization's schema"
                onValueChange={handleFilter}
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
              <div className="bg-primary text-foreground flex space-x-2 rounded-md">
                {walletStatus ? (
                  <RoleViewButton
                    title={createSchemaButtonTitle.toolTip}
                    buttonTitle={createSchemaButtonTitle.title}
                    feature={Features.CRETAE_SCHEMA}
                    svgComponent={createSchemaButtonTitle.svg}
                    onClickEvent={() => {
                      route.push(`${pathRoutes.organizations.createSchema}`)
                    }}
                  />
                ) : (
                  <RoleViewButton
                    buttonTitle={createSchemaButtonTitle.title}
                    feature={Features.CRETAE_SCHEMA}
                    svgComponent={createSchemaButtonTitle.svg}
                    onClickEvent={() => {
                      route.push(
                        `${pathRoutes.organizations}/${organizationId}`,
                      )
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {schemasList && schemasList.length > 0 ? (
            <div
              className="Flex-wrap"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className="mt-0 mb-4 grid w-full grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-2">
                {schemasList &&
                  schemasList.length > 0 &&
                  schemasList.map((element) => (
                    <div
                      className="px-0 sm:px-2"
                      key={element['schemaLedgerId']}
                    >
                      <SchemaCard
                        selectedSchemas={selectedSchemas}
                        schemaName={element['name']}
                        version={element['version']}
                        schemaId={element['schemaLedgerId']}
                        issuerDid={element['issuerId']}
                        attributes={element['attributes']}
                        created={element['createDateTime']}
                        showCheckbox={true}
                        isClickable={false}
                        w3cSchema={w3cSchema}
                        noLedger={isNoLedger}
                        isVerificationUsingEmail={true}
                        onChange={(checked) => {
                          w3cSchema
                            ? handleW3cSchemas(checked, element)
                            : handleSchemaSelection(
                                element['schemaLedgerId'],
                                element['attributes'],
                                element['issuerId'],
                                element['createDateTime'],
                                checked,
                              )
                        }}
                      />
                    </div>
                  ))}
              </div>

              <div className="mb-4 flex items-center justify-end">
                <Button
                  onClick={w3cSchema ? handleW3CSchemaDetails : handleContinue}
                  disabled={selectedSchemas.length === 0}
                  className="flex items-center gap-2 rounded-md px-4 py-4 text-base font-medium sm:w-auto"
                >
                  <ArrowRight />
                  Continue
                </Button>
              </div>
              <div
                className="mb-4 flex items-center justify-end"
                id="schemasPagination"
              >
                {totalItems > 1 && (
                  <div className="mt-6 flex justify-end">
                    <Pagination>
                      <PaginationContent>
                        {schemasListParameter.page > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setSchemasListParameter((prev) => ({
                                  ...prev,
                                  page: prev.page - 1,
                                }))
                              }}
                            />
                          </PaginationItem>
                        )}

                        {Array.from({ length: totalItems })
                          .map((_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalItems ||
                              Math.abs(page - schemasListParameter.page) <= 1,
                          )
                          .reduce<(number | string)[]>((acc, page, i, arr) => {
                            if (
                              i > 0 &&
                              typeof page === 'number' &&
                              typeof arr[i - 1] === 'number' &&
                              page - (arr[i - 1] as number) > 1
                            ) {
                              acc.push('...')
                            }
                            acc.push(page)
                            return acc
                          }, [])
                          .map((page, idx) => {
                            if (page === '...') {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="text-muted-foreground px-2"
                                >
                                  ...
                                </span>
                              )
                            }

                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setSchemasListParameter((prev) => ({
                                      ...prev,
                                      page: page as number,
                                    }))
                                  }}
                                  className={`rounded-lg px-4 py-2 ${
                                    schemasListParameter.page === page
                                      ? 'bg-primary text-[var(--color-white)]'
                                      : 'bg-background text-muted-foreground'
                                  }`}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          })}

                        {schemasListParameter.page < totalItems && (
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setSchemasListParameter((prev) => ({
                                  ...prev,
                                  page: prev.page + 1,
                                }))
                              }}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="mb-4 flex items-center justify-center">
                  <Loader />
                </div>
              ) : (
                <div className="border-border bg-background rounded-lg border shadow-sm sm:p-6 2xl:col-span-2">
                  <EmptyMessage
                    title={emptySchemaListTitle}
                    description={emptySchemaListDescription}
                    buttonContent={emptySchemaListBtn.title}
                    svgComponent={emptySchemaListBtn.svg}
                    onClick={() => {
                      route.push(`${pathRoutes.organizations.createSchema}`)
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default VerificationSchemasList
