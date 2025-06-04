'use client'

import * as Yup from 'yup'

import { ArrowLeft, CircleArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type {
  DataTypeAttributes,
  ICredentials,
  IssuanceFormPayload,
  Option,
  SchemaDetails,
  SelectedUsers,
} from '../type/Issuance'
import { DidMethod, SchemaTypeValue, SchemaTypes } from '@/common/enums'
import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import FieldArrayData from './FieldArray'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { RootState } from '@/lib/store'
import { SearchableSelect } from '@/components/SearchableSelect'
import SummaryCard from '@/components/SummaryCard'
import SummaryCardW3c from '@/components/SummaryCardW3c'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { getSchemaCredDef } from '@/app/api/schema'
import { handleSubmit } from './IssuanceFunctions'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

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
      console.error('Error in getSchemaAndUsers:', error)
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
          (credentials.data?.data ?? []).map(
            (value: ICredentials, index: number) => ({
              schemaVersion: value.schemaVersion,
              value: index,
              label: value.schemaCredDefName,
              id: value.schemaAttributes,
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
          <h1 className="ml-1 text-xl font-semibold sm:text-2xl">Issuance</h1>
        </div>
        <Card className="">
          <CardContent className="p-4">
            <p className="pb-6 text-xl font-semibold">
              Select Schema and credential definition
            </p>
            <SearchableSelect
              className="border-muted max-w-lg border-1"
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
                          <CircleArrowRight />
                          <span className="">Issue</span>
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
