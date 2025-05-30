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

import { AlertComponent } from '@/components/AlertComponent'
import { BackButton } from './BackButton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Create from '@/features/schemas/components/Create'
import { EmptyListMessage } from '@/components/EmptyListComponent'
import FieldArrayData from './FieldArray'
import FormikAddButton from './FormikAddButton'
import IssuancePopup from '../../bulkIssuance/components/IssuancePopup'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import { Plus } from 'lucide-react'
import RoleViewButton from '@/components/RoleViewButton'
import { RootState } from '@/lib/store'
import { SearchableSelect } from '@/components/SearchableSelect'
import { SelectRef } from '../../bulkIssuance/components/BulkIssuance'
import { itemPerPage } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const EmailIssuance = (): JSX.Element => {
  const [formData, setFormData] = useState<FromDataFromik>()
  const [userData, setUserData] = useState<UserData>()
  const [loading, setLoading] = useState<boolean>(true)
  const [credentialOptions, setCredentialOptions] =
    useState<ICredentialOptions>()
  const schemaListAPIParameter = {
    itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: '',
  }
  const [credentialSelected, setCredentialSelected] =
    useState<ICredentials | null>()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [attributes, setAttributes] = useState<IAttributes[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [issueLoader, setIssueLoader] = useState(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const [schemaType, setSchemaType] = useState<SchemaTypes>()
  const [credentialType, setCredentialType] = useState<CredentialType>()
  const [credDefId, setCredDefId] = useState<string>()
  const [schemasIdentifier, setSchemasIdentifier] = useState<string>()
  const [schemaTypeValue, setSchemaTypeValue] = useState<SchemaTypeValue>()
  const [isAllSchemaFlagSelected, setIsAllSchemaFlagSelected] =
    useState<boolean>()
  const orgId = useAppSelector((state: RootState) => state.organization.orgId)
  const isCredSelected = Boolean(credentialSelected)
  const selectInputRef = React.useRef<SelectRef | null>(null)
  const [clear, setClear] = useState<boolean>(false)
  const router = useRouter()

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
    })
  }, [isAllSchemaFlagSelected])

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
    handleSelectChange(fullValue)
  }

  const createSchemaTitle = { title: 'Create Schema', svg: <Create /> }

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
              svgComponent={<Plus />}
              onClickEvent={() => {
                router.push(`${pathRoutes.organizations.createSchema}`)
              }}
            />
          </div>
          <div className="email-bulk-issuance flex flex-col justify-between gap-4">
            <Card className="p-5 py-8">
              <div className="md:min-h-[10rem]">
                <div className="grid w-[980px] grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col justify-between">
                    <div className="text-primary-900">
                      <div className="pb-2 text-xl font-semibold dark:text-white">
                        Select Schema and credential definition
                      </div>
                      {mounted && (
                        <SearchableSelect
                          className="border-muted max-w-lg border-1"
                          options={
                            Array.isArray(credentialOptions)
                              ? credentialOptions
                              : []
                          }
                          value={''}
                          clear={clear}
                          onValueChange={handleSelect}
                          placeholder="Select Schema Credential Definition"
                        />
                      )}
                    </div>

                    <div className="mt-4">
                      {credentialSelected && (
                        <Card className="max-w-[30rem] p-5">
                          <div>
                            <p className="pb-2 text-black dark:text-white">
                              <span className="font-semibold">Schema: </span>
                              {credentialSelected?.schemaName || ''}{' '}
                              <span>[{credentialSelected?.schemaVersion}]</span>
                            </p>
                            {schemaType === SchemaTypes.schema_INDY && (
                              <p className="pb-2 text-black dark:text-white">
                                {' '}
                                <span className="font-semibold">
                                  Credential Definition:
                                </span>{' '}
                                {credentialSelected?.credentialDefinition}
                              </p>
                            )}
                            <span className="font-semibold text-black dark:text-white">
                              Attributes:
                            </span>

                            <div className="flex flex-wrap overflow-hidden">
                              {attributes
                                ?.slice(0, 3)
                                .map((element: IAttributes) => (
                                  <div
                                    key={element.attributeName}
                                    className="truncate"
                                  >
                                    <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
                                      {element.attributeName}
                                    </span>
                                  </div>
                                ))}
                              {attributes?.length > 3 && (
                                <span className="text-muted-foreground ml-2 text-sm/6">
                                  +{attributes.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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
                                          disabled={loading}
                                          variant={'outline'}
                                          className=""
                                          onClick={() =>
                                            handleReset({
                                              setCredentialSelected,
                                              selectInputRef,
                                              setClear,
                                            })
                                          }
                                        >
                                          <Reset />
                                          Reset
                                        </Button>
                                        <Button
                                          type="submit"
                                          className=""
                                          disabled={!formikHandlers?.isValid}
                                        >
                                          <Issue />
                                          <span>Issue</span>
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
