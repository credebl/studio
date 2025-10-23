'use client'

import * as Yup from 'yup'

import { Card, CardContent } from '@/components/ui/card'
import type {
  DataTypeAttributes,
  ICredentials,
  IssuanceFormPayload,
  SchemaDetails,
  SelectedUsers,
} from '../type/Issuance'
import { DidMethod, SchemaTypeValue, SchemaTypes } from '@/common/enums'
import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import {
  apiStatusCodes,
  issuanceApiParameter,
  schemaDetailsInitialState,
} from '@/config/CommonConstant'
import {
  createAttributeValidationSchema,
  createIssuanceFormFunction,
  handleSelect,
  handleSubmit,
} from './IssuanceFunctions'
import getAllSchemaHelperUtil, {
  GetAllSchemaHelperReturn,
} from '../../emailIssuance/components/GetAllSchemaForIssuance'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { ArrowRight } from 'lucide-react'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import FieldArrayData from './FieldArray'
import IssuanceHeader from './IssuanceHeader'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { RootState } from '@/lib/store'
import { SearchableSelect } from '@/components/SearchableSelect'
import SummaryCard from '@/components/SummaryCard'
import SummaryCardW3c from '@/components/SummaryCardW3c'
import { getOrganizationById } from '@/app/api/organization'
import { getSchemaCredDef } from '@/app/api/schema'
import { pathRoutes } from '@/config/pathRoutes'
import { resetSchemaDetails } from '@/lib/schemaStorageSlice'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

const IssueCred = (): React.JSX.Element => {
  const [userLoader, setUserLoader] = useState<boolean>(true)
  const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>(
    schemaDetailsInitialState,
  )
  const [schemaListAPIParameter, setSchemaListAPIParameter] =
    useState(issuanceApiParameter)
  const [issuanceFormPayload, setIssuanceFormPayload] =
    useState<IssuanceFormPayload>({
      credentialData: [],
      orgId: '',
    })
  const [issuanceLoader, setIssuanceLoader] = useState<boolean>(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [w3cSchema, setw3cSchema] = useState<boolean>(false)
  const [schemaType, setSchemaType] = useState<SchemaTypeValue>()
  const [orgDid, setOrgDid] = useState<string>('')
  const orgId = useSelector((state: RootState) => state.organization.orgId)
  const [isLoading, setIsLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [credentialOptions, setCredentialOptions] = useState<
    GetAllSchemaHelperReturn[]
  >([])
  const [selectValue, setSelectValue] = useState<string>('')
  const [clear] = useState<boolean>(false)

  const dispatch = useAppDispatch()

  const selectedUser = useSelector(
    (state: RootState) => state.storageKeys.SELECTED_USER,
  )
  const allSchema = useAppSelector(
    (state: RootState) => state.storageKeys.ALL_SCHEMAS,
  )
  const ledgerId = useAppSelector(
    (state: RootState) => state.organization.ledgerId,
  )
  const schemaDetailsSlice = useAppSelector(
    (state: RootState) => state.schemaStorage,
  )

  const router = useRouter()
  const createW3cIssuanceForm = (
    selectedUsers: SelectedUsers[],
    attributes: DataTypeAttributes[],
    orgId: string,
  ): void => {
    const credentialData = selectedUsers.map((user) => {
      const attributesArray =
        attributes.length > 0
          ? attributes.map((attr) => ({
              name: attr.attributeName,
              value: '',
              dataType: attr?.schemaDataType,
              isRequired: attr.isRequired,
            }))
          : []

      return {
        connectionId: user.connectionId,
        attributes: attributesArray,
      }
    })

    const issuancePayload = {
      credentialData,
      orgId,
    }

    setIssuanceFormPayload(issuancePayload)
    setUserLoader(false)
  }

  const getSchemaAndUsers = async (w3cSchema: boolean): Promise<void> => {
    try {
      if (!w3cSchema) {
        const { credDefId } = schemaDetails

        setUserLoader(true)
        const selectedUsers = selectedUser || []
        const attributes = schemaDetails.schemaAttributes || []
        if (attributes?.length) {
          createIssuanceFormFunction({
            selectedUsers,
            attributes,
            credDefId,
            orgId,
            setIssuanceFormPayload,
            setUserLoader,
          })
        } else {
          setFailure('Attributes are not available')
        }
      }
      if (w3cSchema) {
        setUserLoader(true)
        const selectedUsers = selectedUser || []

        const attributes = schemaDetails.schemaAttributes || []

        if (attributes?.length) {
          createW3cIssuanceForm(selectedUsers, attributes, orgId)
        } else {
          setFailure('Attributes are not available')
        }
      }
    } catch (error) {
      console.error('Error in getSchemaAndUsers:', error)
      setFailure('Error fetching schema and users')
    }
  }
  useEffect(() => {
    if (
      (!w3cSchema && schemaDetails.schemaId && schemaDetails.credDefId) ||
      (w3cSchema && schemaDetails.schemaName && schemaDetails.schemaAttributes)
    ) {
      getSchemaAndUsers(w3cSchema)
    }
  }, [schemaDetails, w3cSchema])

  useEffect(() => {
    if (
      Array.isArray(credentialOptions) &&
      credentialOptions.length > 0 &&
      schemaDetailsSlice.type === 'CREDENTIAL_DEFINITION'
    ) {
      if (!schemaDetailsSlice.nonW3cSchema) {
        return
      }
      const credential = credentialOptions.find(
        (option) =>
          option.credentialId &&
          typeof schemaDetailsSlice.nonW3cSchema === 'string' &&
          schemaDetailsSlice.nonW3cSchema === option.credentialId,
      )
      if (!credential) {
        return
      }
      const data = JSON.parse(credential.value)
      setSchemaDetails({
        schemaName: credential.schemaName,
        version: credential.schemaVersion,
        schemaId: credential.schemaId,
        credDefId: credential.credentialId,
        schemaAttributes: data,
      })
      setSelectValue(credential?.label)
    } else if (
      Array.isArray(credentialOptions) &&
      credentialOptions.length > 0 &&
      schemaDetailsSlice.type === 'W3C_SCHEMA'
    ) {
      const credentials = schemaDetailsSlice.w3cSchema
      if (!credentials) {
        return
      }
      const data = JSON.parse(credentials.value)
      setSchemaDetails({
        schemaName: credentials.schemaName,
        version: credentials.schemaVersion,
        schemaId: credentials.schemaId,
        credDefId: credentials.credentialId,
        schemaAttributes: data,
      })
      if (credentials?.label) {
        setSelectValue(credentials?.label)
      }
    } else {
      setSelectValue(
        w3cSchema ? 'Select Schema ' : 'Select Credential Definition',
      )
    }
  }, [credentialOptions, schemaDetailsSlice])

  const fetchOrganizationDetails = async (): Promise<boolean | null> => {
    try {
      if (!orgId) {
        return null
      }
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const did = data?.data?.org_agents?.[0]?.orgDid

        if (did?.includes(DidMethod.POLYGON)) {
          setw3cSchema(true)
          setSchemaType(SchemaTypeValue.POLYGON)
          setOrgDid(did)
          return true
        } else if (
          did?.includes(DidMethod.KEY) ||
          did?.includes(DidMethod.WEB)
        ) {
          setw3cSchema(true)
          setSchemaType(SchemaTypeValue.NO_LEDGER)
          setOrgDid(did)
          return true
        } else if (did?.includes(DidMethod.INDY)) {
          setw3cSchema(false)
          setSchemaType(SchemaTypeValue.INDY)
          return false
        }
      }
    } catch (error) {
      console.error('Error in getSchemaAndUsers:', error)
      setFailure('Error fetching schema and users')
    }

    return null
  }

  useEffect(() => {
    const execute = async (): Promise<void> => {
      const response = await fetchOrganizationDetails()
      let credentials: AxiosResponse | GetAllSchemaHelperReturn[] | null = null
      if (response !== null) {
        const schemaValue = response
          ? SchemaTypes.schema_W3C
          : SchemaTypes.schema_INDY
        if (schemaValue === SchemaTypes.schema_W3C && orgId && allSchema) {
          credentials = await getAllSchemaHelperUtil({
            schemaListAPIParameter,
            ledgerId,
            currentSchemaType: schemaValue,
          })
          setCredentialOptions(credentials)
        } else {
          credentials = (await getSchemaCredDef(
            schemaValue,
            orgId,
          )) as AxiosResponse
          setCredentialOptions(
            (credentials.data?.data ?? []).map(
              (value: ICredentials, index: number) => ({
                schemaVersion: value.schemaVersion,
                value: value.schemaAttributes,
                label: value.schemaCredDefName,
                id: index,
                schemaId: response
                  ? value.schemaIdentifier
                  : value.schemaLedgerId,
                credentialId: value.credentialDefinitionId,
                schemaName: value.schemaName,
              }),
            ),
          )
        }
      }
    }
    execute()
    return () => setUserLoader(false)
  }, [allSchema, orgId, schemaListAPIParameter.allSearch])

  const validationSchema = Yup.object().shape({
    credentialData: Yup.array().of(
      Yup.object().shape({
        attributes: Yup.array().of(
          Yup.lazy((attr) =>
            createAttributeValidationSchema(
              attr?.name,
              attr?.value,
              attr?.isRequired,
            ),
          ),
        ),
      }),
    ),
  })

  const handleBackClick = (): void => {
    setIsLoading(true)
    router.push(pathRoutes.back.issuance.connections)
  }

  // Temporarily commented will be worked on later
  // const handleFilterChange = async (value: string): Promise<void> => {
  //   setSchemaDetails(schemaDetailsInitialState)
  //   dispatch(resetSchemaDetails())
  //   setClear((prev) => !prev)
  //   const isAllSchemas = value === 'All schemas'
  //   dispatch(setAllSchema(isAllSchemas))
  // }

  const handleSearchChange = (value: string): void => {
    setSchemaListAPIParameter((prev) => ({ ...prev, allSearch: value }))
  }

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <IssuanceHeader
          {...{
            handleBackClick,
            isLoading,
            success,
            error,
            setError,
            setSuccess,
            setCreateLoading,
            createLoading,
          }}
        />
        <Card className="">
          <CardContent className="p-4">
            <p className="pb-6 text-xl font-semibold">
              {w3cSchema ? 'Select Schema ' : 'Select Credential Definition'}
            </p>
            <div className="flex md:gap-6">
              {/* Temporarily commented will be worked on later */}
              {/* {w3cSchema && (
                <SchemaSelect
                  {...{ allSchema, handleFilterChange, optionsWithDefault }}
                />
              )} */}
              <div>
                <SearchableSelect
                  className="border-muted max-w-lg border-1"
                  options={credentialOptions}
                  value={selectValue}
                  onValueChange={(value) => {
                    dispatch(resetSchemaDetails())
                    handleSelect({
                      value,
                      setSchemaDetails,
                      allSchema,
                      w3cSchema,
                    })
                  }}
                  onSearchChange={handleSearchChange}
                  clear={clear}
                  enableInternalSearch={!(w3cSchema && allSchema)}
                  placeholder={
                    w3cSchema
                      ? 'Select Schema '
                      : 'Select Credential Definition'
                  }
                />
              </div>
            </div>
            {schemaDetails.schemaId && (
              <>
                {w3cSchema ? (
                  <SummaryCardW3c
                    schemaName={schemaDetails.schemaName}
                    schemaId={schemaDetails.schemaId}
                    version={schemaDetails.version}
                    hideCredDefId={false}
                    schemaAttributes={schemaDetails.schemaAttributes}
                  />
                ) : (
                  <SummaryCard
                    schemaName={schemaDetails.schemaName}
                    schemaId={schemaDetails.schemaId}
                    version={schemaDetails.version}
                    credDefId={schemaDetails.credDefId}
                    hideCredDefId={false}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {schemaDetails.schemaAttributes ? (
          <>
            {userLoader ? (
              <div className="mb-4 flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <Card className="mt-6 gap-6 rounded-lg p-4 shadow-sm sm:p-6">
                <Formik
                  initialValues={{
                    ...issuanceFormPayload,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={(values) =>
                    handleSubmit({
                      values,
                      w3cSchema,
                      schemaDetails,
                      orgDid,
                      schemaType,
                      setIssuanceLoader,
                      orgId,
                      setSuccess,
                      router,
                      setFailure,
                    })
                  }
                  enableReinitialize={true}
                  validateOnMount={true}
                >
                  {({ values, errors, touched, isValid }) => (
                    <Form>
                      {failure && (
                        <div className="pt-1 pb-1">
                          <AlertComponent
                            message={failure}
                            type={'failure'}
                            onAlertClose={() => {
                              setError(null)
                              setSuccess(null)
                              setFailure(null)
                            }}
                          />
                        </div>
                      )}
                      <FieldArrayData
                        {...{
                          values,
                          w3cSchema,
                          issuanceFormPayload,
                          errors,
                          touched,
                          validationSchema,
                        }}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={issuanceLoader || !isValid}
                          className=""
                        >
                          {issuanceLoader ? (
                            <Loader size={20} />
                          ) : (
                            <>
                              <ArrowRight />
                              <span className="">Issue</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center">
            <EmptyListMessage
              message="Select Schema and Credential Definition"
              description="Get started by selecting schema and credential definition"
            />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default IssueCred
