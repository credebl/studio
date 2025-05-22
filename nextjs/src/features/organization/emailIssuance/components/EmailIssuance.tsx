/* eslint-disable max-lines */
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
import { SearchableSelect } from '@/components/ShadCnSelect'
import { SelectRef } from '../../bulkIssuance/components/BulkIssuance'
import { itemPerPage } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'

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
                window.location.href = `${pathRoutes.organizations.createSchema}`
              }}
            />
          </div>
          <div className="email-bulk-issuance flex flex-col justify-between gap-4">
            <Card className="p-5 py-8">
              <div className="md:min-h-[10rem]">
                <div className="grid w-[980px] grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col justify-between">
                    <div className="text-primary-900">
                      <div className='pb-2 text-xl font-semibold dark:text-white'>Select Schema and credential definition</div>
                      {mounted && (
                        <SearchableSelect
                          className="border-primary max-w-lg border-2"
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
                              {attributes?.map((element: IAttributes) => (
                                <div
                                  key={element.attributeName}
                                  className="truncate"
                                >
                                  <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
                                    {element.attributeName}
                                  </span>
                                </div>
                              ))}
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
                      <span className="text-sm text-gray-400">
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
                                          <div className="pb-4">
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
                                          variant={'ghost'}
                                          className="border-ring hover:bg-primary flex items-center rounded-xl border px-4 py-2 transition-colors disabled:cursor-not-allowed"
                                          onClick={() =>
                                            handleReset({
                                              setCredentialSelected,
                                              selectInputRef,
                                              setClear,
                                            })
                                          }
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="dark:text-custom-100 dark:group-hover:text-custom-900 mr-2"
                                            width="18"
                                            height="18"
                                            fill="none"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fill="currentColor"
                                              d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z"
                                            />
                                          </svg>
                                          Reset
                                        </Button>
                                        <Button
                                          type="submit"
                                          className=""
                                          disabled={!formikHandlers?.isValid}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="27"
                                            height="18"
                                            fill="current"
                                            viewBox="0 0 27 18"
                                            className="mr-1"
                                            style={{
                                              height: '20px',
                                              width: '30px',
                                            }}
                                          >
                                            <path
                                              fill="currentColor"
                                              d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 5.985-5.48-5.277.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277L15.27 16.57Z"
                                            />
                                          </svg>
                                          <span className="text-custom-900 pl-2">
                                            Issue
                                          </span>
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
