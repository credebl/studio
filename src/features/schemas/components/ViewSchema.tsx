'use client'

import { ArrowLeft, Plus } from 'lucide-react'
import {
  CredDeffFieldNameType,
  ICredDefCard,
  Values,
} from '../type/schemas-interface'
import React, { useEffect, useState } from 'react'
import {
  createCredentialDefinition,
  getCredDeffById,
  getSchemaById,
} from '@/app/api/schema'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckOnLedgerIcon } from '@/components/iconsSvg'
import CopyDid from '@/config/CopyDid'
import CreateCredDefPopup from './CreateCredDefPopup'
import CredentialDefinitionCard from '@/components/CredentialDefinitionCard'
import { EmptyMessage } from '@/components/EmptyMessage'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { Roles } from '@/common/enums'
import { Skeleton } from '@/components/ui/skeleton'
import { apiStatusCodes } from '../../../config/CommonConstant'
import { getLedgersPlatformUrl } from '@/app/api/Agent'
import { nanoid } from 'nanoid'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

type SchemaData = {
  schema: {
    attrNames: string[]
    name: string
    version: string
    issuerId: string
  }
  schemaId: string
  resolutionMetadata: Record<string, unknown>
  schemaMetadata: {
    didIndyNamespace: string
    indyLedgerSeqNo: number
  }
}

const initialPageState = {
  pageNumber: 1,
  pageSize: 9,
  total: 0,
}

const ViewSchemas = ({ schemaId }: { schemaId: string }): React.JSX.Element => {
  const [schemaDetails, setSchemaDetails] = useState<SchemaData | null>(null)

  const [credDefList, setCredDefList] = useState<ICredDefCard[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [createLoader, setCreateLoader] = useState<boolean>(false)
  const [, setCredDeffloader] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [, setCredDefListErr] = useState<string | null>(null)
  const [, setSchemaDetailErr] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string>('')
  const [, setCredDefAuto] = useState<string>('')
  const [ledgerPlatformLoading, setLedgerPlatformLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialPageState)
  const [isOpenCreateCredDef, setIsOpenCreateCredDef] = useState<boolean>(false)

  const router = useRouter()

  const [userRoles, setUserRoles] = useState<string[]>([])

  const organizationId = useAppSelector((state) => state.organization.orgId)
  const orgInfo = useAppSelector((state) => state.organization.orgInfo)

  const getSchemaDetails = async (
    SchemaId: string,
    organizationId: string,
  ): Promise<void> => {
    try {
      setLoading(true)
      const SchemaDetails = await getSchemaById(SchemaId, organizationId)
      const { data } = SchemaDetails as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSchemaDetails(data?.data)
        setCredDefAuto(`${data?.data?.response?.schema?.name} ${nanoid(8)}`)
        setLoading(false)
      } else {
        setLoading(false)
        setSchemaDetailErr(SchemaDetails as unknown as string)
      }
    } catch (error) {
      setSchemaDetailErr('Error while fetching schema details')
      console.error('Error while fetching schema details:', error)
      setLoading(false)
    }
  }

  const getCredentialDefinitionList = async (
    id: string,
    orgId: string,
  ): Promise<void> => {
    try {
      setCredDeffloader(true)
      const credentialDefinitions = await getCredDeffById(id, orgId)
      const { data } = credentialDefinitions as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages
        setCredDefList(data?.data?.data)
        setCredDeffloader(false)
        setCurrentPage({
          ...currentPage,
          total: totalPages,
        })
      } else {
        setCredDefListErr(credentialDefinitions as string)
        setCredDeffloader(false)
      }
    } catch (error) {
      console.error('Error while fetching credential definition list:', error)
      setCredDeffloader(false)
    }
  }
  const fetchData = async (): Promise<void> => {
    const decodedSchemaId = decodeURIComponent(schemaId)
    setOrgId(String(organizationId))
    await getSchemaDetails(decodedSchemaId, String(organizationId))
    await getCredentialDefinitionList(decodedSchemaId, String(organizationId))
  }
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (orgInfo?.roles?.length) {
      setUserRoles(orgInfo.roles)
    } else {
      setUserRoles([])
    }
  }, [orgInfo?.roles])

  const submit = async (values: Values): Promise<void> => {
    setCreateLoader(true)
    const schemaId = schemaDetails?.schemaId || ''
    const CredDeffFieldName: CredDeffFieldNameType = {
      tag: values?.tagName,
      revocable: values?.revocable,
      orgId,
      schemaLedgerId: schemaId,
    }

    const createCredDeff = await createCredentialDefinition(
      CredDeffFieldName,
      orgId,
    )
    const { data } = createCredDeff as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setCreateLoader(false)
      setSuccess(data?.message)
      setTimeout(() => setIsOpenCreateCredDef(false), 3000)
    } else {
      setFailure(createCredDeff as string)
      setCreateLoader(false)
    }
    getCredentialDefinitionList(schemaId, orgId)
  }

  const credDefSelectionCallback = async (): Promise<void> => {
    router.push('/credentials/issue')
  }

  const fetchLedgerPlatformUrl = async (
    indyNamespace: string,
  ): Promise<void> => {
    setLedgerPlatformLoading(true)
    try {
      const response = await getLedgersPlatformUrl(indyNamespace)
      const { data } = response as AxiosResponse
      setLedgerPlatformLoading(false)
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data.data.networkUrl) {
          window.open(data.data.networkUrl)
        }
      }
    } catch (err) {
      setLedgerPlatformLoading(false)
    }
  }

  const handleBack = (): void => {
    setLoading(true)
    router.back()
  }

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex items-center justify-between">
            <h1 className="ml-1 text-xl font-semibold">Schemas</h1>
            <Button
              variant="default"
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-2 transition-colors"
              disabled={loading}
            >
              {loading ? <Loader size={20} /> : <ArrowLeft size={18} />}
              {!loading && 'Back'}
            </Button>
          </div>
        </div>

        {/* <div className="border-border relative h-full w-full overflow-hidden rounded-lg border p-4 shadow-xl transition-transform duration-300 sm:p-6 2xl:col-span-2"> */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <Card
            className="relative h-full w-full overflow-hidden rounded-xl transition-transform duration-300"
            id="viewSchemaDetailsCard"
          >
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[...Array(1)].map((_, index) => (
                  <div key={index} className="col-span-full">
                    <div className="w-full space-y-3 rounded-lg p-4 shadow-sm">
                      <Skeleton className="h-5 w-1/2 rounded-md" />
                      <Skeleton className="h-4 w-1/3 rounded" />
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-4 w-2/4 rounded" />
                      <Skeleton className="h-3 w-1/4 rounded" />
                      <Skeleton className="h-3 w-1/4 rounded" />
                      <Skeleton className="h-4 w-2/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="overflow-hidden p-4 overflow-ellipsis"
                style={{ overflow: 'auto' }}
              >
                <div className="mb-1 flex flex-wrap items-center justify-between">
                  <h5 className="w-fit pt-1 pb-2 text-xl leading-none font-bold">
                    Schema Details
                  </h5>
                  <div className="w-fit p-2 lg:mt-0">
                    <Button
                      type="submit"
                      title="View schema details on ledger"
                      onClick={() =>
                        fetchLedgerPlatformUrl(
                          schemaDetails?.schemaMetadata?.didIndyNamespace || '',
                        )
                      }
                      disabled={ledgerPlatformLoading}
                      variant="outline"
                      className="flex items-center rounded-xl px-4 py-2 transition-colors"
                    >
                      <CheckOnLedgerIcon />
                      Check on ledger
                    </Button>
                  </div>
                </div>
                <div className="">
                  <div>
                    <div className="py-1 break-words">
                      <span className="font-semibold">Name: </span>{' '}
                      {schemaDetails?.schema?.name}
                    </div>
                  </div>

                  <div>
                    <div className="py-1 break-words">
                      <span className="font-semibold">Version: </span>
                      {schemaDetails?.schema?.version}
                    </div>
                  </div>

                  <div className="flex truncate break-all">
                    <span className="mr-2 font-semibold">Schema ID: </span>
                    <span className="w-schema-id flex">
                      <CopyDid
                        value={schemaDetails?.schemaId || ''}
                        className="font-courier mt-[2px] truncate"
                      />
                    </span>
                  </div>

                  <div className="flex truncate break-all">
                    <span className="mr-2 font-semibold">Issuer DID: </span>
                    <span className="w-schema-id flex">
                      <CopyDid
                        value={schemaDetails?.schema?.issuerId || ''}
                        className="font-courier mt-[2px] truncate"
                      />
                    </span>
                  </div>
                </div>

                <div className="flow-root overflow-y-auto">
                  <ul className="divide-y">
                    <li className="pt-3 sm:pt-4">
                      <div className="flex items-center space-x-4">
                        <div className="inline-flex flex-wrap items-center p-1 text-base font-semibold">
                          Attributes:
                          {schemaDetails?.schema?.attrNames &&
                            schemaDetails?.schema?.attrNames?.length > 0 &&
                            schemaDetails?.schema?.attrNames.map(
                              (element: string) => (
                                <span
                                  key={`schema-details-${element}`}
                                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm"
                                >
                                  {' '}
                                  {element}
                                </span>
                              ),
                            )}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>
        <Card className="mt-5 w-full">
          <div className="m-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {(userRoles.includes(Roles.OWNER) ||
              userRoles.includes(Roles.ADMIN)) && (
              <>
                <div className="col-span-full xl:mb-2">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                      Credential Definitions
                    </h1>
                    {credDefList && credDefList.length > 0 && (
                      <Button
                        variant="default"
                        title="Create new credential-definition"
                        onClick={() => {
                          setLoading(true)
                          setIsOpenCreateCredDef(true)
                          setSuccess(null)
                          setFailure(null)
                          setTimeout(() => setLoading(false), 500)
                        }}
                        disabled={loading}
                        className="flex items-center rounded-lg py-1 text-center text-base font-medium sm:w-auto"
                      >
                        {loading ? (
                          <>
                            <Loader />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <CreateCredDefPopup
                  openModal={isOpenCreateCredDef}
                  closeModal={() => setIsOpenCreateCredDef(false)}
                  onSuccess={(values) => submit(values)}
                  createLoader={createLoader}
                  success={success}
                  failure={failure}
                  closeAlert={() => {
                    setSuccess(null)
                    setFailure(null)
                  }}
                />
              </>
            )}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="space-y-3 rounded-lg p-4 shadow-xl">
                  <Skeleton className="h-5 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-2/4 rounded" />
                  <Skeleton className="h-3 w-1/4 rounded" />
                </div>
              ))}
            </div>
          ) : credDefList && credDefList.length > 0 ? (
            <div className="Flex-wrap m-5">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                {credDefList &&
                  credDefList.length > 0 &&
                  credDefList.map((element: ICredDefCard) => (
                    <div
                      className="relative h-full w-full overflow-hidden rounded-xl transition-transform duration-300"
                      key={`view-schema-cred-def-card-${element['credentialDefinitionId']}`}
                    >
                      <CredentialDefinitionCard
                        credDeffName={element['tag']}
                        credentialDefinitionId={
                          element['credentialDefinitionId']
                        }
                        schemaId={element['schemaLedgerId']}
                        revocable={element['revocable']}
                        onClickCallback={credDefSelectionCallback}
                        userRoles={userRoles}
                        schemaName={schemaDetails?.schema?.name || ''}
                        schemaVersion={schemaDetails?.schema?.version || ''}
                        attributes={schemaDetails?.schema?.attrNames}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <>
              <EmptyMessage
                title={'No Credential Definition'}
                description={
                  'Get started by creating a new credential definition'
                }
                buttonIcon={<Plus />}
                buttonContent="Create"
                disabled={
                  !(
                    userRoles.includes(Roles.OWNER) ||
                    userRoles.includes(Roles.ADMIN)
                  )
                }
                onClick={() => {
                  setIsOpenCreateCredDef(true)
                  setSuccess(null)
                  setFailure(null)
                }}
              />
            </>
          )}
        </Card>
      </div>
    </PageContainer>
  )
}
export default ViewSchemas
