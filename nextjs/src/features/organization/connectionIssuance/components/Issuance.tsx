/* eslint-disable max-lines */
'use client'

import * as Yup from 'yup'

import { ArrowLeft, CircleArrowRight } from 'lucide-react'
import {
  CREDENTIAL_CONTEXT_VALUE,
  apiStatusCodes,
  proofPurpose,
} from '@/config/CommonConstant'
import { Card, CardContent } from '@/components/ui/card'
import {
  CredentialType,
  DidMethod,
  ProofType,
  SchemaTypeValue,
  SchemaTypes,
} from '@/common/enums'
import type {
  DataTypeAttributes,
  ICredentialdata,
  ICredentials,
  IssuanceFormPayload,
  Option,
  SchemaDetails,
  SelectedUsers,
} from '../type/Issuance'
import {
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
  FormikTouched,
} from 'formik'
import React, { JSX, useEffect, useState } from 'react'
import { setSelectedConnection, setSelectedUser } from '@/lib/storageKeys'
import { useDispatch, useSelector } from 'react-redux'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { RootState } from '@/lib/store'
import { SearchableSelect } from '@/components/ShadCnSelect'
import SummaryCard from '@/components/SummaryCard'
import SummaryCardW3c from '@/components/SummaryCardW3c'
import { getOrganizationById } from '@/app/api/organization'
import { getSchemaCredDef } from '@/app/api/schema'
import { issueCredential } from '@/app/api/Issuance'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'

const IssueCred = (): React.JSX.Element => {
  const [userLoader, setUserLoader] = useState<boolean>(true)
  const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>({
    schemaName: '',
    version: '',
    schemaId: '',
    credDefId: '',
  })
  const [issuanceFormPayload, setIssuanceFormPayload] =
    useState<IssuanceFormPayload>({
      credentialData: [],
      orgId: '',
    })
  const [issuanceLoader, setIssuanceLoader] = useState<boolean>(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [w3cSchema, setW3CSchema] = useState<boolean>(false)
  const [schemaType, setSchemaType] = useState<SchemaTypeValue>()
  const [orgDid, setOrgDid] = useState<string>('')
  const orgId = useSelector((state: RootState) => state.organization.orgId)
  const [credentialOptions, setCredentialOptions] = useState([])
  const selectedUser = useSelector(
    (state: RootState) => state.storageKeys.SELECTED_USER,
  )
  const router = useRouter()
  const dispatch = useDispatch()
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
  const createIssuanceForm = (
    selectedUsers: SelectedUsers[],
    attributes: DataTypeAttributes[],
    credDefId: string,
    orgId: string,
  ): void => {
    const credentialData = selectedUsers.map((user) => {
      const attributesArray = attributes.map((attr) => ({
        name: attr.attributeName,
        value: '',
        dataType: attr?.schemaDataType,
        isRequired: attr.isRequired,
      }))

      return {
        connectionId: user.connectionId,
        attributes: attributesArray,
      }
    })

    const issuancePayload = {
      credentialData,
      credentialDefinitionId: credDefId,
      orgId,
    }

    setIssuanceFormPayload(issuancePayload)
    setUserLoader(false)
  }
  const getSchemaAndUsers = async (w3cSchema: boolean): Promise<void> => {
    try {
      if (!w3cSchema) {
        const { credDefId } = schemaDetails

        // createSchemaPayload(schemaId, credDefId);
        setUserLoader(true)
        const selectedUsers = selectedUser || []
        const attributes = schemaDetails.schemaAttributes || []
        if (attributes && attributes?.length) {
          createIssuanceForm(selectedUsers, attributes, credDefId, orgId)
        } else {
          setFailure('Attributes are not available')
        }
      }
      if (w3cSchema) {
        setUserLoader(true)
        const selectedUsers = selectedUser || []

        const attributes = schemaDetails.schemaAttributes || []

        if (attributes && attributes?.length) {
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
    if (!w3cSchema && schemaDetails.schemaId && schemaDetails.credDefId) {
      getSchemaAndUsers(w3cSchema)
    } else if (
      w3cSchema &&
      schemaDetails.schemaName &&
      schemaDetails.schemaAttributes
    ) {
      getSchemaAndUsers(w3cSchema)
    }
  }, [schemaDetails])

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
          setW3CSchema(true)
          setSchemaType(SchemaTypeValue.POLYGON)
          setOrgDid(did)
          return true
        } else if (
          did?.includes(DidMethod.KEY) ||
          did?.includes(DidMethod.WEB)
        ) {
          setW3CSchema(true)
          setSchemaType(SchemaTypeValue.NO_LEDGER)
          setOrgDid(did)
          return true
        } else if (did?.includes(DidMethod.INDY)) {
          setW3CSchema(false)
          setSchemaType(SchemaTypeValue.INDY)
          return false
        }
      }
    } catch (error) {
      console.log('Error in getSchemaAndUsers:', error)
      setFailure('Error fetching schema and users')
    }

    return null
  }
  useEffect(() => {
    const execute = async (): Promise<void> => {
      const response = await fetchOrganizationDetails()
      if (response !== null) {
        const schemaValue = response
          ? SchemaTypes.schema_W3C
          : SchemaTypes.schema_INDY
        const credentials = (await getSchemaCredDef(
          schemaValue,
          orgId,
        )) as AxiosResponse
        setCredentialOptions(
          credentials.data.data.map((value: ICredentials, index: number) => ({
            schemaVersion: value.schemaVersion,
            value: index,
            label: value.schemaCredDefName,
            id: value.schemaAttributes,
            schemaId: response ? value.schemaIdentifier : value.schemaLedgerId,
            credentialId: value.credentialDefinitionId,
            schemaName: value.schemaName,
          })),
        )
      }
    }
    execute()
    return () => setUserLoader(false)
  }, [])

  const createAttributeValidationSchema = (
    name: string,
    value: string,
    isRequired: boolean,
  ): Yup.ObjectSchema<
    { value: string | undefined },
    Yup.AnyObject,
    { value: undefined },
    ''
  > => {
    let attributeSchema = Yup.string()
    let requiredData = ''
    if (name) {
      requiredData = name
        .split('_')
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' ')
    }

    if (isRequired) {
      if (!value) {
        attributeSchema = Yup.string().required(`${requiredData} is required`)
      }
    }

    return Yup.object().shape({
      value: attributeSchema,
    })
  }

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

  const handleSubmit = async (values: IssuanceFormPayload): Promise<void> => {
    let issuancePayload = null

    if (!w3cSchema) {
      issuancePayload = {
        credentialData: values.credentialData.map((item: ICredentialdata) => ({
          ...item,
          attributes: item?.attributes?.map((attr: IAttributesData) => ({
            name: attr.name,
            value: attr.value.toString(),
          })),
        })),

        credentialDefinitionId: values.credentialDefinitionId,
        orgId: values.orgId,
      }
    }
    if (w3cSchema) {
      issuancePayload = {
        credentialData: values?.credentialData.map((item: ICredentialdata) => ({
          connectionId: item.connectionId,
          credential: {
            '@context': [CREDENTIAL_CONTEXT_VALUE, schemaDetails.schemaId],
            type: ['VerifiableCredential', schemaDetails.schemaName],
            issuer: {
              id: orgDid,
            },
            issuanceDate: new Date().toISOString(),
            //FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
            credentialSubject: item?.attributes?.reduce(
              (
                acc: Record<string, string>,
                attr: {
                  name: string
                  dataType: string | number
                  value: string
                },
              ) => {
                if (
                  attr.dataType === 'number' &&
                  (attr.value === '' || attr.value === null)
                ) {
                  return { ...acc, [attr.name]: 0 }
                } else if (attr.dataType === 'string' && attr.value === '') {
                  return { ...acc, [attr.name]: '' }
                } else if (attr.value !== null) {
                  return { ...acc, [attr.name]: attr.value }
                }
                return acc
              },
              {} as Record<string, string | number | boolean | null>,
            ),
          },

          options: {
            proofType:
              schemaType === SchemaTypeValue.POLYGON
                ? ProofType.polygon
                : ProofType.no_ledger,
            proofPurpose,
          },
        })),
        orgId: values.orgId,
      }
    }

    const convertedAttributesValues = {
      ...issuancePayload,
    }

    setIssuanceLoader(true)
    const schemaTypeValue = w3cSchema
      ? CredentialType.JSONLD
      : CredentialType.INDY
    const issueCredRes = await issueCredential(
      convertedAttributesValues,
      schemaTypeValue,
      orgId,
    )

    const { data } = issueCredRes as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setSuccess(data?.message)
      router.push(pathRoutes.organizations.issuedCredentials)
      dispatch(setSelectedConnection([]))
      dispatch(setSelectedUser([]))
    } else {
      setFailure(issueCredRes as string)
      setIssuanceLoader(false)
    }
  }

  const handleSelect = (value: Option): void => {
    const data = JSON.parse(value.id)
    setSchemaDetails({
      schemaName: value.schemaName,
      version: value.schemaVersion,
      schemaId: value.schemaId,
      credDefId: value.credentialId,
      schemaAttributes: data,
    })
  }

  function showErrors(
    errors: FormikErrors<{
      userName?: string
      credentialData: ICredentialdata[]
      credentialDefinitionId?: string
      orgId: string
    }>,
    touched: FormikTouched<{
      userName?: string
      credentialData: ICredentialdata[]
      credentialDefinitionId?: string
      orgId: string
    }>,
    index: number,
    attrIndex: number,
  ): JSX.Element | null {
    const attrErrors = errors?.credentialData?.[index]
    const attrTouched = Array.isArray(touched?.credentialData)
      ? touched.credentialData[index]
      : undefined
    const error =
      typeof attrErrors === 'object' && Array.isArray(attrErrors.attributes)
        ? attrErrors.attributes[attrIndex]?.value
        : undefined

    const touchedField =
      typeof attrTouched === 'object' && Array.isArray(attrTouched.attributes)
        ? attrTouched.attributes[attrIndex]?.value
        : undefined

    if (error && touchedField) {
      return (
        <div className="absolute text-xs break-words text-red-500">{error}</div>
      )
    }

    return null
  }
  const Name = (attr: { attr: string }): JSX.Element => (
    <>
      {attr?.attr
        ?.split('_')
        .map(
          (item: string) => item[0].toUpperCase() + item.slice(1, item.length),
        )
        .join(' ')}
    </>
  )
  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex items-center justify-end px-4">
            <Button
              onClick={() => router.push(pathRoutes.back.issuance.connections)}
            >
              <ArrowLeft />
              Back
            </Button>
          </div>
          <AlertComponent
            message={success ?? error}
            type={success ? 'success' : 'failure'}
            onAlertClose={() => {
              setError(null)
              setSuccess(null)
            }}
          />
          <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Issuance
          </h1>
        </div>
        <Card className="dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-4">
            <p className="pb-6 text-xl font-semibold dark:text-white">
              Select Schema and credential definition
            </p>
            {/*<CustomSelect credentialOptions={credentialOptions} />*/}
            <SearchableSelect
              className="border-primary max-w-lg border-2"
              options={credentialOptions}
              value={''}
              onValueChange={handleSelect}
              placeholder="Select Schema Credential Definition"
            />
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
              <div className="mt-6 gap-6 rounded-lg border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                <Formik
                  initialValues={{
                    ...issuanceFormPayload,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize={true} // ✅ Add this
                >
                  {({ values, errors, touched }) => (
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
                      <FieldArray name="credentialData">
                        {(arrayHelpers) => (
                          <>
                            {values?.credentialData?.length > 0 &&
                              values?.credentialData?.map(
                                (
                                  user: {
                                    attributes: string
                                    connectionId: string
                                  },
                                  index: number,
                                ) => {
                                  const attributes = w3cSchema
                                    ? issuanceFormPayload?.credentialData?.[0]
                                        .attributes
                                    : user?.attributes

                                  return (
                                    <div key={user.connectionId}>
                                      <Card
                                        className="bg-background my-5 px-4 py-8"
                                        style={{
                                          maxWidth: '100%',
                                          maxHeight: '100%',
                                          overflow: 'auto',
                                        }}
                                      >
                                        <div className="flex justify-between">
                                          <div className="flex">
                                            <h5 className="flex flex-wrap text-xl leading-none font-bold dark:text-white">
                                              Connection Id
                                            </h5>
                                            <span className="pl-1 text-xl leading-none font-bold dark:text-white">
                                              :
                                            </span>
                                            <p className="pl-1 dark:text-white">
                                              {user?.connectionId}
                                            </p>
                                          </div>
                                          {values.credentialData.length > 1 && (
                                            <div
                                              key={index}
                                              className="flex justify-end text-red-600 sm:w-2/12"
                                            >
                                              <Button
                                                data-testid="deleteBtn"
                                                color="danger"
                                                type="button"
                                                className={
                                                  'flex justify-end focus:ring-0 dark:bg-gray-700'
                                                }
                                                onClick={() => {
                                                  arrayHelpers.remove(index)
                                                }}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  strokeWidth={1.5}
                                                  stroke="currentColor"
                                                  className="h-6 w-6"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                  />
                                                </svg>
                                              </Button>
                                            </div>
                                          )}
                                        </div>

                                        <h3 className="dark:text-white">
                                          Attributes
                                        </h3>
                                        <div className="container mx-auto pr-2">
                                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                                            {attributes?.map(
                                              (
                                                attr: IAttributesData,
                                                attrIndex: number,
                                              ) => (
                                                <div
                                                  key={`${user.connectionId}-${attr.name}-${attrIndex}`}
                                                >
                                                  <div
                                                    key={attr?.name}
                                                    className="flex"
                                                  >
                                                    <label
                                                      htmlFor={`credentialData.${index}.attributes.${attrIndex}.value`}
                                                      className="flex w-2/5 items-center justify-end pr-3 font-light dark:text-white"
                                                    >
                                                      <div className="word-break-word flex items-center text-end">
                                                        <Name
                                                          attr={attr?.name}
                                                        />
                                                        {attr.isRequired && (
                                                          <span className="text-red-500">
                                                            *
                                                          </span>
                                                        )}{' '}
                                                        :
                                                      </div>
                                                    </label>
                                                    <div className="w-3/5">
                                                      <Field
                                                        type={
                                                          attr?.dataType ===
                                                          'date'
                                                            ? 'date'
                                                            : attr?.dataType
                                                        }
                                                        id={`credentialData.${index}.attributes.${attrIndex}.value`}
                                                        name={`credentialData.${index}.attributes.${attrIndex}.value`}
                                                        className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 relative block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                                        validate={(
                                                          value: string,
                                                        ) => {
                                                          try {
                                                            const schema =
                                                              Yup.reach(
                                                                validationSchema,
                                                                `credentialData.${index}.attributes.${attrIndex}.value`,
                                                              )

                                                            // Check if schema is an actual Yup schema with validateSync
                                                            if (
                                                              'validateSync' in
                                                                schema &&
                                                              typeof schema.validateSync ===
                                                                'function'
                                                            ) {
                                                              schema.validateSync(
                                                                value,
                                                                {
                                                                  abortEarly:
                                                                    false,
                                                                },
                                                              )
                                                            }

                                                            return undefined // No error
                                                          } catch (error) {
                                                            if (
                                                              error instanceof
                                                              Yup.ValidationError
                                                            ) {
                                                              return error.message
                                                            }
                                                            return 'Validation failed'
                                                          }
                                                        }}
                                                      />
                                                      {showErrors(
                                                        errors,
                                                        touched,
                                                        index,
                                                        attrIndex,
                                                      )}{' '}
                                                    </div>
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      </Card>
                                    </div>
                                  )
                                },
                              )}
                          </>
                        )}
                      </FieldArray>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={issuanceLoader}
                          // isProcessing={issuanceLoader}
                          className=""
                        >
                          <CircleArrowRight />
                          <span className="text-custom-900">Issue</span>
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
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
