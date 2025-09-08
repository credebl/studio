'use client'

import { ArrowLeft, Plus } from 'lucide-react'
import {
  CredDeffFieldNameType,
  ICredDefCard,
  Values,
} from '../type/schemas-interface'
import React, { useCallback, useEffect, useState } from 'react'
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
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string>('')
  const [ledgerPlatformLoading, setLedgerPlatformLoading] = useState(false)
  const [, setCurrentPage] = useState(initialPageState)
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
      } else {
        console.error(SchemaDetails as unknown as string)
      }
    } catch (error) {
      console.error('Error while fetching schema details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCredentialDefinitionList = async (
    id: string,
    orgId: string,
  ): Promise<void> => {
    try {
      const credentialDefinitions = await getCredDeffById(id, orgId)
      const { data } = credentialDefinitions as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setCredDefList(data?.data?.data)
        setCurrentPage((prev) => ({ ...prev, total: data?.data?.totalPages }))
      } else {
        console.error(credentialDefinitions as string)
      }
    } catch (error) {
      console.error('Error while fetching credential definition list:', error)
    }
  }

  const fetchData = useCallback(async (): Promise<void> => {
    const decodedSchemaId = decodeURIComponent(schemaId)
    setOrgId(String(organizationId))
    await getSchemaDetails(decodedSchemaId, String(organizationId))
    await getCredentialDefinitionList(decodedSchemaId, String(organizationId))
  }, [schemaId, organizationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setUserRoles(orgInfo?.roles?.length ? orgInfo.roles : [])
  }, [orgInfo?.roles])

  const submit = async (values: Values): Promise<void> => {
    setCreateLoader(true)
    const schemaLedgerId = schemaDetails?.schemaId || ''
    const CredDeffFieldName: CredDeffFieldNameType = {
      tag: values?.tagName,
      revocable: values?.revocable,
      orgId,
      schemaLedgerId,
    }

    try {
      const createCredDeff = await createCredentialDefinition(
        CredDeffFieldName,
        orgId,
      )
      const { data } = createCredDeff as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(data?.message)
        setTimeout(() => setIsOpenCreateCredDef(false), 3000)
        await getCredentialDefinitionList(schemaLedgerId, orgId)
      } else {
        setFailure(createCredDeff as string)
      }
    } catch (err: unknown) {
      console.error('Error creating credential definition:', err)

      if (err instanceof Error) {
        setFailure(err.message)
      } else {
        setFailure(
          'Unexpected error occurred while creating credential definition',
        )
      }
    } finally {
      setCreateLoader(false)
    }
  }

  const fetchLedgerPlatformUrl = async (
    indyNamespace: string,
  ): Promise<void> => {
    setLedgerPlatformLoading(true)
    try {
      const response = await getLedgersPlatformUrl(indyNamespace)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data.data.networkUrl) {
          window.open(data.data.networkUrl)
        }
      }
    } catch {
      // no-op
    } finally {
      setLedgerPlatformLoading(false)
    }
  }

  const handleBack = (): void => {
    setLoading(true)
    router.back()
  }

  /** Helper for rendering credential definitions list */
  const renderCredentialDefinitions = (): React.JSX.Element => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[...Array(4)].map(() => (
            <div
              key={`skeleton-${nanoid(6)}`}
              className="space-y-3 rounded-lg p-4 shadow-xl"
            >
              <Skeleton className="h-5 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-2/4 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
            </div>
          ))}
        </div>
      )
    }

    if (credDefList && credDefList.length > 0) {
      return (
        <div className="m-5 flex-wrap">
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
            {credDefList.map((element) => (
              <div
                key={`cred-def-${element.credentialDefinitionId}`}
                className="relative h-full w-full overflow-hidden rounded-xl transition-transform duration-300"
              >
                <CredentialDefinitionCard
                  credDefName={element.tag}
                  credentialDefinitionId={element.credentialDefinitionId}
                  schemaId={element.schemaLedgerId}
                  revocable={element.revocable}
                  userRoles={userRoles}
                />
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <EmptyMessage
        title={'No Credential Definition'}
        description={'Get started by creating a new credential definition'}
        buttonIcon={<Plus />}
        buttonContent="Create"
        disabled={
          !(userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN))
        }
        onClick={() => {
          setIsOpenCreateCredDef(true)
          setSuccess(null)
          setFailure(null)
        }}
      />
    )
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

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <Card
            className="relative h-full w-full overflow-hidden rounded-xl transition-transform duration-300"
            id="viewSchemaDetailsCard"
          >
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  key={`schema-skeleton-${nanoid(6)}`}
                  className="col-span-full"
                >
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
                <div>
                  <div className="py-1 break-words">
                    <span className="font-semibold">Name: </span>
                    {schemaDetails?.schema?.name}
                  </div>
                  <div className="py-1 break-words">
                    <span className="font-semibold">Version: </span>
                    {schemaDetails?.schema?.version}
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
                          {schemaDetails?.schema?.attrNames?.map((element) => (
                            <span
                              key={`schema-attr-${element}`}
                              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm"
                            >
                              {element}
                            </span>
                          ))}
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
                    {credDefList.length > 0 && (
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

          {renderCredentialDefinitions()}
        </Card>
      </div>
    </PageContainer>
  )
}

export default ViewSchemas
