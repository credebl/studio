'use client'

import * as Yup from 'yup'

import {
  CredentialType,
  Features,
  SchemaTypeValue,
  SchemaTypes,
} from '@/common/enums'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import {
  FromDataFromik,
  ICredentialOption,
  ICredentialOptions,
  UserData,
} from '../type/EmailIssuance'
import {
  IAttributes,
  ICredentials,
} from '../../connectionIssuance/type/Issuance'
import { Issue, Reset } from '@/config/svgs/EmailIssuance'
import React, { JSX, useEffect, useState } from 'react'
import {
  confirmOOBCredentialIssuance,
  getSchemaCredentials,
  handleReset,
} from './EmailIssuanceFunctions'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { BackButton } from './BackButton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Create from '@/features/schemas/components/Create'
import EmailIssuanceCard from './EmaiIssuanceCard'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import FieldArrayData from './FieldArray'
import FormikAddButton from './FormikAddButton'
import IssuancePopup from '../../bulkIssuance/components/IssuancePopup'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import RoleViewButton from '@/components/RoleViewButton'
import { RootState } from '@/lib/store'
import { SelectRef } from '../../bulkIssuance/components/BulkIssuance'
import { itemPerPage } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'
import { resetSchemaDetails } from '@/lib/schemaStorageSlice'
import { setAllSchema } from '@/lib/storageKeys'
import { useRouter } from 'next/navigation'

const EmailIssuance = (): JSX.Element => {
  const [formData, setFormData] = useState<FromDataFromik>()
  const [userData, setUserData] = useState<UserData>()
  const [loading, setLoading] = useState<boolean>(true)
  const [credentialOptions, setCredentialOptions] =
    useState<ICredentialOptions>()
  const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
    itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: '',
  })
  const [credentialSelected, setCredentialSelected] =
    useState<ICredentials | null>()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [attributes, setAttributes] = useState<IAttributes[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [issueLoader, setIssueLoader] = useState(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [schemaType, setSchemaType] = useState<SchemaTypes>()
  const [credentialType, setCredentialType] = useState<CredentialType>()
  const [credDefId, setCredDefId] = useState<string>()
  const [schemasIdentifier, setSchemasIdentifier] = useState<string>()
  const [schemaTypeValue, setSchemaTypeValue] = useState<SchemaTypeValue>()
  const [emailLoading, setEmailLoading] = useState<boolean>(false)
  const [isAllSchemaFlagSelected, setIsAllSchemaFlagSelected] =
    useState<boolean>()
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)
  const allSchema = useAppSelector(
    (state: RootState) => state.storageKeys.ALL_SCHEMAS,
  )
  const ledgerId = useAppSelector(
    (state: RootState) => state.organization.ledgerId,
  )
  const isCredSelected = Boolean(credentialSelected)
  const selectInputRef = React.useRef<SelectRef | null>(null)
  const [clear, setClear] = useState<boolean>(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const optionsWithDefault = ["Organization's schema", 'All schemas']
  const [selectValue, setSelectValue] = useState<string>('')

  const schemaDetails = useAppSelector(
    (state: RootState) => state.schemaStorage,
  )
  const handleSelectChange = (newValue: ICredentials | null): void => {
    const value = newValue as ICredentials | null
    if (schemaType === SchemaTypes.schema_INDY) {
      setCredDefId(value?.credentialDefinitionId)
      setCredentialSelected(value ?? null)
    } else if (schemaType === SchemaTypes.schema_W3C) {
      setCredentialSelected(value ?? null)
      setSchemasIdentifier(value?.schemaIdentifier)
    }
    setAttributes(value?.schemaAttributes ?? value?.attributes ?? [])
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (
      Array.isArray(credentialOptions) &&
      credentialOptions.length > 0 &&
      schemaDetails.type === 'CREDENTIAL_DEFINITION'
    ) {
      const credential = credentialOptions.find(
        (option) =>
          schemaDetails.nonW3cSchema === option.credentialDefinitionId,
      )
      setCredentialSelected(credential ?? null)
      setCredDefId(
        credential?.schemaIdentifier ?? credential?.credentialDefinitionId,
      )
      setAttributes(
        credential?.schemaAttributes ?? credential?.attributes ?? [],
      )
      setSelectValue(credential?.label)
    } else if (
      Array.isArray(credentialOptions) &&
      credentialOptions.length > 0 &&
      schemaDetails.type === 'W3C_SCHEMA'
    ) {
      const credentials = schemaDetails.w3cSchema
      if (!credentials) {
        return
      }
      const attributes = JSON.parse(credentials.value)
      const data = {
        value: credentials.schemaVersion,
        label: `${credentials.schemaName} [${credentials.schemaVersion}]`,
        schemaName: credentials.schemaName,
        schemaVersion: credentials.schemaVersion,
        schemaIdentifier: credentials.schemaIdentifier,
        id: 0,
        schemaAttributes: attributes,
      }
      setCredentialSelected(data ?? null)
      setSchemasIdentifier(credentials?.schemaIdentifier)
      setAttributes(attributes ?? [])
      if (data?.label) {
        setSelectValue(data?.label)
      }
    } else {
      setSelectValue(
        schemaType === SchemaTypes.schema_W3C
          ? 'Select Schema '
          : 'Select Credential Definition',
      )
    }
  }, [credentialOptions, schemaDetails])
  useEffect(() => {
    getSchemaCredentials({
      schemaListAPIParameter,
      setIsAllSchemaFlagSelected,
      schemaType,
      setSchemaTypeValue,
      setCredentialType,
      setSchemaType,
      isAllSchemaFlagSelected,
      setCredentialOptions,
      setSuccess,
      setFailure,
      setLoading,
      orgId,
      allSchema,
      ledgerId,
    })
  }, [
    isAllSchemaFlagSelected,
    schemaListAPIParameter.allSearch,
    allSchema,
    orgId,
  ])

  useEffect(() => {
    const initFormData = {
      email: '',
      attributes: attributes?.map((item: IAttributes) => ({
        ...item,
        value: '',
        name: item?.attributeName,
        isRequired: item?.isRequired,
      })),
    }

    setFormData({ formData: [initFormData] })
  }, [attributes])

  const handleCloseConfirmation = (): void => {
    setOpenModal(false)
  }

  const handleOpenConfirmation = (): void => {
    setOpenModal(true)
  }

  const handleSelect = (value: ICredentialOption): void => {
    const fullValue: ICredentials = {
      ...value,
      schemaName: value.schemaName ?? '',
      schemaVersion: value.schemaVersion ?? '',
      schemaIdentifier: value.schemaIdentifier ?? '',
    }
    dispatch(resetSchemaDetails())
    handleSelectChange(fullValue)
  }

  const handleSearchChange = (value: string): void => {
    setSchemaListAPIParameter((prev) => ({ ...prev, allSearch: value }))
  }

  const handleFilterChange = async (value: string): Promise<void> => {
    dispatch(resetSchemaDetails())
    setCredentialSelected(null)
    setClear((prev) => !prev)
    const isAllSchemas = value === 'All schemas'
    dispatch(setAllSchema(isAllSchemas))
  }

  const createSchemaTitle = { title: 'View Schemas', svg: <Create /> }

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <BackButton />
        <div>
          {(success || failure) && (
            <AlertComponent
              message={success ?? failure}
              type={success ? 'success' : 'failure'}
              onAlertClose={() => {
                setSuccess(null)
                setFailure(null)
              }}
            />
          )}
          <div className="mb-3 ml-1 flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold dark:text-white">Email</p>
            </div>
            <RoleViewButton
              buttonTitle={createSchemaTitle.title}
              feature={Features.CRETAE_SCHEMA}
              svgComponent={<div></div>}
              onClickEvent={() => {
                setEmailLoading(true)
                router.push(`${pathRoutes.organizations.schemas}`)
              }}
              loading={emailLoading}
            />
          </div>
          <div className="email-bulk-issuance flex flex-col justify-between gap-4">
            <EmailIssuanceCard
              {...{
                schemaType,
                allSchema,
                handleFilterChange,
                optionsWithDefault,
                credentialOptions,
                selectValue,
                clear,
                handleSelect,
                handleSearchChange,
                mounted,
                credentialSelected,
                attributes,
                isAllSchemaFlagSelected,
              }}
            />
            <div>
              <Card className="p-5 py-10">
                <div>
                  <div className="mb-4 ml-1 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold dark:text-white">
                        Issue Credential(s) to the email
                      </p>
                      <span className="text-muted-foreground text-sm">
                        Please enter an email address to issue the credential to
                      </span>
                    </div>
                  </div>
                  {isCredSelected ? (
                    <div>
                      <div className="flex flex-col justify-between">
                        {loading ? (
                          <div className="mb-4 flex items-center justify-center">
                            <Loader />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="m-0" id="createSchemaCard">
                              <div>
                                <Formik
                                  initialValues={formData ?? { formData: [] }}
                                  validationSchema={Yup.object().shape({
                                    formData: Yup.array().of(
                                      Yup.object().shape({
                                        email: Yup.string()
                                          .email('Invalid email address')
                                          .required('Email is required'),
                                        attributes: Yup.array().of(
                                          Yup.lazy((value) =>
                                            Yup.object().shape({
                                              value: value.isRequired
                                                ? Yup.string().required(
                                                    'This field is required',
                                                  )
                                                : Yup.string(),
                                            }),
                                          ),
                                        ),
                                      }),
                                    ),
                                  })}
                                  validateOnBlur
                                  validateOnChange
                                  enableReinitialize
                                  onSubmit={async (
                                    values: UserData,
                                  ): Promise<void> => {
                                    setUserData(values)
                                    handleOpenConfirmation()
                                  }}
                                >
                                  {(formikHandlers): JSX.Element => (
                                    <Form
                                      onSubmit={formikHandlers.handleSubmit}
                                    >
                                      <FieldArray
                                        name="formData"
                                        render={(
                                          arrayHelpers: FieldArrayRenderProps,
                                        ) => (
                                          <div className="relative pb-4">
                                            <FieldArrayData
                                              arrayHelpers={arrayHelpers}
                                              formikHandlers={formikHandlers}
                                            />
                                            <FormikAddButton
                                              arrayHelpers={arrayHelpers}
                                              attributes={attributes}
                                              formikHandlers={formikHandlers}
                                            />
                                          </div>
                                        )}
                                      />
                                      <IssuancePopup
                                        openModal={openModal}
                                        closeModal={handleCloseConfirmation}
                                        isProcessing={issueLoader}
                                        onSuccess={() =>
                                          confirmOOBCredentialIssuance({
                                            setIssueLoader,
                                            schemaType,
                                            credDefId,
                                            schemasIdentifier,
                                            credentialSelected,
                                            orgId,
                                            userData,
                                            schemaTypeValue,
                                            credentialType,
                                            setLoading,
                                            setSuccess,
                                            setFailure,
                                            setOpenModal,
                                            setCredentialSelected,
                                            selectInputRef,
                                          })
                                        }
                                      />
                                      <div className="flex justify-end gap-4">
                                        <Button
                                          type="button"
                                          disabled={loading || isResetting}
                                          variant="outline"
                                          className=""
                                          onClick={async () => {
                                            setIsResetting(true)
                                            try {
                                              handleReset({
                                                setCredentialSelected,
                                                selectInputRef,
                                                setClear,
                                              })
                                            } finally {
                                              setIsResetting(false)
                                            }
                                          }}
                                        >
                                          {isResetting ? (
                                            <Loader size={16} />
                                          ) : (
                                            <>
                                              <Reset /> Reset
                                            </>
                                          )}
                                        </Button>

                                        <Button
                                          type="submit"
                                          className=""
                                          disabled={
                                            !formikHandlers?.isValid ||
                                            isIssuing
                                          }
                                          onClick={async (e) => {
                                            e.preventDefault()
                                            setIsIssuing(true)
                                            try {
                                              formikHandlers.handleSubmit()
                                            } finally {
                                              setIsIssuing(false)
                                            }
                                          }}
                                        >
                                          {isIssuing ? (
                                            <Loader size={16} />
                                          ) : (
                                            <>
                                              <Issue />
                                              <span>Issue</span>
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </Form>
                                  )}
                                </Formik>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <EmptyListMessage
                        message="Select Schema and Credential Definition"
                        description="Get started by selecting schema and credential definition"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
export default EmailIssuance
