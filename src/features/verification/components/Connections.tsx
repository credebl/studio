'use client'

import {
  IAttributeMapping,
  IConnectionList,
  ISelectedAttributes,
} from '../type/interface'
import { JSX, useEffect, useState } from 'react'
import {
  resetAttributeData,
  resetSelectedConnections,
  resetVerificationState,
  setSelectedUser,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { verifyCredential, verifyCredentialV2 } from '@/app/api/verification'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import ConnectionList from './ConnectionList'
import DataTable from '@/components/DataTable'
import DateTooltip from '@/components/DateTooltip'
import { DidMethod } from '@/common/enums'
import { ITableData } from '@/components/DataTable/interface'
import PageContainer from '@/components/layout/page-container'
import { RequestProofIcon } from '@/components/iconsSvg'
import { RequestType } from '@/features/common/enum'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

interface FilteredAttribute {
  attributeName: string
  credDefId?: string
  schemaId?: string
  condition?: string
  value?: string
}

interface CheckedW3CAttribute {
  attributeName: string
  schemaId: string
  schemaName: string
}

const Connections = (): JSX.Element => {
  const [isW3cDid, setIsW3cDid] = useState<boolean>(false)
  const [selectedConnectionList, setSelectedConnectionList] = useState<
    ITableData[]
  >([])

  const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [requestLoader, setRequestLoader] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const route = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const attributeData = useAppSelector(
    (state) => state.verification.attributeData,
  )

  const selectedConnectionHeader = [
    { columnName: 'User' },
    { columnName: 'Connection ID' },
    { columnName: 'Created on' },
  ]

  const selectConnection = (connections: IConnectionList[]): void => {
    try {
      const connectionsData =
        connections?.map((ele: IConnectionList) => {
          const createdOn = ele?.createDateTime
            ? ele?.createDateTime
            : 'Not available'
          const connectionId = ele.connectionId
            ? ele.connectionId
            : 'Not available'
          const userName = ele?.theirLabel ? ele.theirLabel : 'Not available'

          return {
            data: [
              { data: userName },
              { data: connectionId },
              {
                data: (
                  <DateTooltip
                    date={createdOn}
                    id="verification_connection_list"
                  >
                    <div> {dateConversion(createdOn)} </div>
                  </DateTooltip>
                ),
              },
            ],
          }
        }) ?? []

      setSelectedConnectionList(connectionsData)
    } catch (error) {
      console.error('ERROR IN TABLE GENERATION::', error)
    }
  }

  const fetchOrganizationDetails = async (): Promise<void> => {
    try {
      if (!orgId) {
        return
      }
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const did = data?.data?.org_agents?.[0]?.orgDid

        if (did?.includes(DidMethod.POLYGON)) {
          setIsW3cDid(true)
        }
        if (did?.includes(DidMethod.KEY) || did?.includes(DidMethod.WEB)) {
          setIsW3cDid(true)
        }
        if (did?.includes(DidMethod.INDY)) {
          setIsW3cDid(false)
        }
      }
    } catch (error) {
      console.error('Error in getSchemaAndUsers:', error)
    }
  }
  useEffect(() => {
    fetchOrganizationDetails()
    return (): void => {
      setRequestLoader(false)
    }
  }, [])

  const selectConnectionsFromList = (): {
    userName: string | JSX.Element
    connectionId: string | JSX.Element
  }[] =>
    selectedConnectionList.map((ele) => ({
      userName: ele.data[0].data,
      connectionId: ele.data[1].data,
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapCheckedAttributes = (): any =>
    attributeData
      .filter((attribute: ISelectedAttributes) => attribute.isChecked)
      .map((attribute: ISelectedAttributes) => {
        const basePayload: FilteredAttribute = {
          attributeName: attribute.attributeName,
          credDefId: attribute.credDefId,
          schemaId: attribute.schemaId,
        }

        if (
          attribute.dataType === 'number' &&
          attribute.selectedOption !== 'Select'
        ) {
          if (attribute?.selectedOption !== '' && attribute?.value !== '') {
            return {
              ...basePayload,
              condition: attribute.selectedOption,
              value: attribute.value,
            }
          } else {
            return {
              ...basePayload,
            }
          }
        }
        if (attribute.dataType === 'string') {
          return basePayload
        }

        return basePayload
      })
      .filter(
        (attr: FilteredAttribute | null): attr is FilteredAttribute =>
          attr !== null,
      )

  const checkedW3cAttributes = (): IAttributeMapping[] =>
    attributeData
      .filter(
        (w3cSchemaAttributes: ISelectedAttributes) =>
          w3cSchemaAttributes.isChecked,
      )
      .map((attribute: ISelectedAttributes) => ({
        attributeName: attribute.attributeName,
        schemaId: attribute.schemaId,
        schemaName: attribute.schemaName,
      }))

  const generateNonW3CCredential = (
    connectionIds: (string | JSX.Element)[],
    checkedAttributes: FilteredAttribute[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => ({
    connectionId: connectionIds.length === 1 ? connectionIds[0] : connectionIds,
    orgId,
    proofFormats: {
      indy: {
        attributes: checkedAttributes,
      },
    },
    comment: 'string',
  })

  const handleSubmit = async (): Promise<void> => {
    setRequestLoader(true)
    try {
      const selectedConnections = selectConnectionsFromList()

      dispatch(setSelectedUser(selectedConnections))
      dispatch(resetSelectedConnections())

      const checkedAttributes: FilteredAttribute[] = mapCheckedAttributes()

      const checkedW3CAttributes = checkedW3cAttributes()
      const connectionIds = selectedConnections.map((c) => c.connectionId)

      let verifyCredentialPayload = null

      if (!isW3cDid) {
        verifyCredentialPayload = generateNonW3CCredential(
          connectionIds,
          checkedAttributes,
        )
      }

      if (isW3cDid) {
        const schemas = checkedW3CAttributes.map(
          (attr: { schemaId: string; schemaName: string }) => ({
            schemaId: attr.schemaId,
            schemaName: attr.schemaName,
          }),
        )

        const groupedAttributes = checkedW3CAttributes.reduce<
          Record<string, CheckedW3CAttribute[]>
        >((acc, curr) => {
          const { schemaName } = curr
          if (!acc[schemaName]) {
            acc[schemaName] = []
          }
          acc[schemaName].push(curr)
          return acc
        }, {})

        verifyCredentialPayload = {
          connectionId:
            connectionIds.length === 1 ? connectionIds[0] : connectionIds,
          comment: 'proof request',

          presentationDefinition: {
            id: uuidv4(),
            purpose: 'proof request',
            // eslint-disable-next-line camelcase
            input_descriptors: Object.keys(groupedAttributes).map(
              (schemaName) => {
                const attributesForSchema = groupedAttributes[schemaName]

                const attributePathsForSchema = attributesForSchema.map(
                  (attr: { attributeName: string }) =>
                    `$.credentialSubject['${attr.attributeName}']`,
                )

                return {
                  id: uuidv4(),
                  name: schemaName,
                  schema: [
                    {
                      uri: schemas.find(
                        (schema: { schemaName: string }) =>
                          schema.schemaName === schemaName,
                      )?.schemaId,
                    },
                  ],
                  constraints: {
                    fields: [
                      {
                        path: attributePathsForSchema,
                      },
                    ],
                  },
                  purpose: 'Verify proof',
                }
              },
            ),
          },
        }
      }

      if (verifyCredentialPayload) {
        const requestType = isW3cDid
          ? RequestType.PRESENTATION_EXCHANGE
          : RequestType.INDY
        let response: null | AxiosResponse | string = null
        if (typeof verifyCredentialPayload.connectionId === 'string') {
          response = await verifyCredential(
            verifyCredentialPayload,
            requestType,
            orgId,
          )
        } else if (Array.isArray(verifyCredentialPayload.connectionId)) {
          response = await verifyCredentialV2(
            verifyCredentialPayload,
            requestType,
            orgId,
          )
        }

        const { data } = response as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
          dispatch(resetAttributeData())

          setProofReqSuccess(data?.message)
          route.push(`${pathRoutes.organizations.credentials}`)
        } else {
          setErrMsg(response as string)
          setRequestLoader(false)
        }
      }
    } catch (error) {
      console.error('Error occurred during proof request:', error)
      setErrMsg('An error occurred. Please try again.')
      setRequestLoader(false)
    }
    dispatch(resetVerificationState())
  }

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex w-full items-center justify-end">
            <BackButton />
          </div>
        </div>

        <div id="myTabContent">
          {(proofReqSuccess || errMsg) && (
            <div className="p-2">
              <AlertComponent
                message={proofReqSuccess || errMsg}
                type={proofReqSuccess ? 'success' : 'failure'}
                onAlertClose={() => {
                  setProofReqSuccess(null)
                  setErrMsg(null)
                }}
              />
            </div>
          )}

          <div
            className="rounded-lg"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <ConnectionList selectConnection={selectConnection} />
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between pt-3">
          <h1 className="ml-1 text-xl font-semibold sm:text-2xl">
            Selected Users
          </h1>
        </div>
        <div className="pt-2">
          <DataTable
            header={selectedConnectionHeader}
            data={selectedConnectionList}
            loading={false}
          ></DataTable>
          {selectedConnectionList.length > 0 && (
            <div className="flex justify-end pt-3">
              <Button
                onClick={handleSubmit}
                disabled={requestLoader}
                className="mt-2 ml-auto flex items-center gap-2"
              >
                {requestLoader ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <RequestProofIcon />
                )}
                Request Proof
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default Connections
