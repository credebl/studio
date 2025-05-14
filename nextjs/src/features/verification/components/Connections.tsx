'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { IConnectionList, ITableHtml } from '../type/interface'
import { JSX, useEffect, useState } from 'react'
import {
  resetAttributeData,
  resetSelectedConnections,
  setSelectedUser,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { verifyCredential, verifyCredentialV2 } from '@/app/api/verification'

import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import ConnectionList from './ConnectionList'
import DataTable from '@/components/DataTable'
import DateTooltip from '@/components/DateTooltip'
import { DidMethod } from '@/common/enums'
import { ITableData } from './SortDataTable'
import PageContainer from '@/components/layout/page-container'
import { RequestType } from '@/features/common/enum'
import { X } from 'lucide-react'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

const Connections = (): JSX.Element => {
  const [isW3cDid, setIsW3cDid] = useState<boolean>(false)
  const [selectedConnectionList, setSelectedConnectionList] = useState<
    ITableData[] | ITableHtml[]
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
                    {dateConversion(createdOn)}
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

  const handleSubmit = async (): Promise<void> => {
    setRequestLoader(true)
    try {
      const selectedConnections = selectedConnectionList.map((ele) => ({
        userName: ele.data[0].data,
        connectionId: ele.data[1].data,
      }))

      dispatch(setSelectedUser(selectedConnections))
      dispatch(resetSelectedConnections())

      const checkedAttributes = attributeData
        .filter((attribute: any) => attribute.isChecked)
        .map((attribute: any) => {
          const basePayload = {
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
        .filter((attr: any) => attr !== null)

      const checkedW3CAttributes = attributeData
        .filter((w3cSchemaAttributes: any) => w3cSchemaAttributes.isChecked)
        .map((attribute: any) => ({
          attributeName: attribute.attributeName,
          schemaId: attribute.schemaId,
          schemaName: attribute.schemaName,
        }))
      const connectionIds = selectedConnections.map((c) => c.connectionId)

      let verifyCredentialPayload: any = null

      if (!isW3cDid) {
        verifyCredentialPayload = {
          connectionId:
            connectionIds.length === 1 ? connectionIds[0] : connectionIds,
          orgId,
          proofFormats: {
            indy: {
              attributes: checkedAttributes,
            },
          },
          comment: 'string',
        }
      }

      if (isW3cDid) {
        const schemas = checkedW3CAttributes.map(
          (attr: { schemaId: any; schemaName: any }) => ({
            schemaId: attr.schemaId,
            schemaName: attr.schemaName,
          }),
        )

        const groupedAttributes = checkedW3CAttributes.reduce(
          (acc: any, curr: any) => {
            const { schemaName } = curr
            const newAcc = acc
            if (!acc[schemaName]) {
              newAcc[schemaName] = []
            }
            newAcc[schemaName].push(curr)
            return newAcc
          },
          {},
        )

        verifyCredentialPayload = {
          connectionId:
            connectionIds.length === 1 ? connectionIds[0] : connectionIds,
          comment: 'proof request',

          presentationDefinition: {
            id: uuidv4(),
            purpose: 'proof request',
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
        let response: any = null
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
      setErrMsg('An error occurred. Please try again.')
      setRequestLoader(false)
    }
  }

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex w-full items-center justify-end">
            <BackButton path={pathRoutes.back.verification.credDef} />
          </div>
        </div>

        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul
            className="-mb-px flex flex-wrap text-center text-sm font-medium"
            id="myTab"
            data-tabs-toggle="#myTabContent"
            role="tablist"
          >
            <li className="mr-2">
              <button
                className="inline-block rounded-t-lg border-b-2 p-4 text-xl"
                id="profile-tab"
                data-tabs-target="#profile"
                type="button"
                role="tab"
                aria-controls="profile"
                aria-selected="false"
              >
                Connection
              </button>
            </li>
          </ul>
        </div>
        <div id="myTabContent">
          {(proofReqSuccess || errMsg) && (
            <div className="p-2">
              <Alert variant={proofReqSuccess ? 'default' : 'destructive'}>
                <AlertTitle>{proofReqSuccess ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{proofReqSuccess || errMsg}</AlertDescription>
                <button
                  onClick={() => {
                    setProofReqSuccess(null)
                    setErrMsg(null)
                  }}
                  className="text-muted-foreground hover:text-foreground absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            </div>
          )}
          <div
            className="rounded-lg bg-gray-50 dark:bg-gray-900"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <ConnectionList selectConnection={selectConnection} />
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between pt-3">
          <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Selected Users
          </h1>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
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
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 25 25"
                  >
                    <path
                      fill="#fff"
                      d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"
                    />
                  </svg>
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
