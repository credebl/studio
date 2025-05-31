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
import CopyDid from '@/config/CopyDid'
import CreateCredDefPopup from './CreateCredDefPopup'
import CredentialDefinitionCard from '@/components/CredentialDefinitionCard'
import { EmptyMessage } from '@/components/EmptyMessage'
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
    setOrgId(String(organizationId))
    await getSchemaDetails(schemaId, String(organizationId))
    await getCredentialDefinitionList(schemaId, String(organizationId))
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
    router.push('/organizations/credentials/issue')
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

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex items-center justify-between">
            <h1 className="ml-1 text-xl font-semibold">Schemas</h1>
            <Button
              variant="default"
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-2 transition-colors"
            >
              <ArrowLeft size={18} />
              Back
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        className="mr-2"
                        fill="none"
                        viewBox="0 0 17 17"
                      >
                        <path
                          fill="currentColor"
                          d="M15.749 6.99c-.334-.21-.813-.503-.813-.697.01-.397.113-.786.3-1.136.277-.69.561-1.395.204-1.915-.358-.519-1.122-.462-1.853-.405-.358.082-.73.082-1.089 0a2.74 2.74 0 0 1-.374-1.087c-.162-.739-.333-1.501-.942-1.704-.61-.203-1.154.3-1.699.811-.309.276-.723.65-.934.65-.212 0-.634-.374-.943-.65C7.07.362 6.51-.14 5.908.046c-.602.187-.805.933-.967 1.671-.05.383-.18.75-.382 1.08a2.295 2.295 0 0 1-1.09 0c-.722-.066-1.478-.13-1.844.405-.365.535-.081 1.225.195 1.914.19.35.295.739.31 1.136-.066.195-.521.487-.854.698C.65 7.34 0 7.76 0 8.41c0 .649.65 1.07 1.276 1.468.333.211.812.495.853.69-.014.4-.12.791-.309 1.144-.276.69-.56 1.395-.195 1.914.366.52 1.122.463 1.845.398a2.441 2.441 0 0 1 1.089.04c.2.33.33.697.382 1.08.162.738.333 1.508.934 1.711a.86.86 0 0 0 .277.106 2.439 2.439 0 0 0 1.422-.812c.308-.275.731-.657.942-.657.212 0 .626.382.935.657.544.487 1.105.998 1.698.812.593-.187.813-.974.943-1.712a2.69 2.69 0 0 1 .374-1.08 2.472 2.472 0 0 1 1.089-.04c.73.065 1.479.138 1.852-.397.374-.536.073-1.225-.203-1.915a2.585 2.585 0 0 1-.3-1.144c.056-.194.511-.478.812-.69C16.35 9.587 17 9.174 17 8.517c0-.658-.618-1.136-1.251-1.526Zm-.431 2.248c-.537.332-1.04.649-1.195 1.135a2.73 2.73 0 0 0 .325 1.68c.155.373.399.99.293 1.151-.106.163-.731.09-1.113.057a2.393 2.393 0 0 0-1.626.203 2.594 2.594 0 0 0-.682 1.55c-.082.365-.236 1.054-.406 1.111-.171.057-.667-.422-.894-.625a2.585 2.585 0 0 0-1.48-.868c-.58.11-1.105.417-1.486.868-.22.203-.756.674-.894.625-.138-.049-.325-.746-.407-1.111a2.594 2.594 0 0 0-.674-1.55 1.522 1.522 0 0 0-.95-.243 7.016 7.016 0 0 0-.708.04c-.374 0-1.008.09-1.105-.056-.098-.146.097-.78.26-1.112.285-.51.4-1.1.325-1.68-.146-.486-.65-.81-1.186-1.135-.358-.227-.902-.568-.902-.811 0-.244.544-.552.902-.811.536-.333 1.04-.658 1.186-1.136a2.754 2.754 0 0 0-.325-1.688c-.163-.348-.398-.973-.284-1.127.113-.154.73-.09 1.105-.057.549.122 1.123.05 1.625-.203.392-.427.629-.972.674-1.55.082-.364.236-1.054.407-1.11.17-.058.674.421.894.624.381.45.907.753 1.487.86a2.569 2.569 0 0 0 1.479-.86c.227-.203.756-.673.894-.625.138.049.325.747.406 1.112.048.578.288 1.123.682 1.55a2.397 2.397 0 0 0 1.626.202c.382 0 1.007-.09 1.113.057.106.146-.138.811-.292 1.144a2.755 2.755 0 0 0-.326 1.687c.155.479.659.811 1.195 1.136.357.227.902.568.902.811 0 .243-.488.527-.845.755Z"
                        />
                        <path
                          fill="currentColor"
                          d="m11.253 6.126-3.78 3.943-1.687-1.403a.473.473 0 0 0-.149-.08.556.556 0 0 0-.352 0 .473.473 0 0 0-.148.08.377.377 0 0 0-.101.12.306.306 0 0 0 0 .284.377.377 0 0 0 .101.12l2.002 1.7a.459.459 0 0 0 .152.083.548.548 0 0 0 .181.027.601.601 0 0 0 .19-.043.499.499 0 0 0 .153-.097l4.105-4.284a.312.312 0 0 0 .074-.265.365.365 0 0 0-.174-.234.55.55 0 0 0-.632.049h.065Z"
                        />
                      </svg>
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
                          setIsOpenCreateCredDef(true)
                          setSuccess(null)
                          setFailure(null)
                        }}
                        className="flex items-center rounded-lg py-1 text-center text-base font-medium sm:w-auto"
                      >
                        <Plus />
                        Create
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
