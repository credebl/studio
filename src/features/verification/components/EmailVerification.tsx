'use client'

import * as Yup from 'yup'

import {
  AutoAccept,
  ProtocolVersion,
  RequestType,
} from '@/features/common/enum'
import { Field, FieldInputProps, Form, Formik, FormikErrors } from 'formik'
import {
  IEmailValues,
  IPredicate,
  IRequestedAttributes,
  ISelectedAttributes,
} from '../type/interface'
import { JSX, useEffect, useState } from 'react'
import { PlusIcon, RequestProofIcon, ResetIcon } from '@/components/iconsSvg'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DidMethod } from '@/common/enums'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createOobProofRequest } from '@/app/api/verification'
import delSvg from '@/../public/svgs/del.svg'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { resetAttributeData } from '@/lib/verificationSlice'
import { useRouter } from 'next/navigation'

type GroupedSchema = {
  id: string
  name: string
  schema: { uri: string }[]
  constraints: {
    fields: { path: string }[]
  }
  purpose: string
}

const EmailVerification = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailInputs, setEmailInputs] = useState([{ value: '' }])
  const [w3cSchema, setW3cSchema] = useState<boolean>(false)

  const router = useRouter()
  const dispatch = useAppDispatch()

  const orgId = useAppSelector((state) => state.organization.orgId)

  const getSelectedW3CSchemaDetails = useAppSelector(
    (state) => state.verification.attributeData,
  )
  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const newEmailInputs = [...emailInputs]
    newEmailInputs[index].value = event.target.value
    setEmailInputs(newEmailInputs)
  }

  const handleAddInput = (): void => {
    setEmailInputs([...emailInputs, { value: '' }])
  }

  const handleDeleteInput = (index: number): void => {
    if (emailInputs.length > 1) {
      const newEmailInputs = emailInputs.filter((_, i) => i !== index)
      setEmailInputs(newEmailInputs)
    }
  }

  const getOrganizationDetails = async (): Promise<void> => {
    setLoading(true)
    const response = await getOrganizationById(orgId)
    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid

      if (
        did.includes(DidMethod.POLYGON) ||
        did.includes(DidMethod.KEY) ||
        did.includes(DidMethod.WEB)
      ) {
        setW3cSchema(true)
      }
      if (did.includes(DidMethod.INDY)) {
        setW3cSchema(false)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    getOrganizationDetails()
  }, [])

  const handleSubmit = async (values: IEmailValues): Promise<void> => {
    setLoading(true)
    setErrorMessage(null)

    try {
      let payload = null

      if (w3cSchema) {
        const groupedAttributes = getSelectedW3CSchemaDetails
          .filter((attribute) => attribute.isChecked)
          .reduce<Record<string, GroupedSchema>>((acc, attribute) => {
            const schemaUri = attribute.schemaId
            if (!acc[schemaUri]) {
              acc[schemaUri] = {
                id: attribute.schemaId.split('/').pop() || '',
                name: attribute.schemaName,
                schema: [{ uri: schemaUri }],
                constraints: {
                  fields: [],
                },
                purpose: 'Verify proof',
              }
            }
            acc[schemaUri].constraints.fields.push({
              path: `$.credentialSubject['${attribute.attributeName}']`,
            })
            return acc
          }, {})

        const inputDescriptors = Object.values(groupedAttributes).map(
          (descriptor) => ({
            ...descriptor,
            constraints: {
              fields: [
                {
                  path: descriptor.constraints.fields.map(
                    (field) => field.path,
                  ),
                },
              ],
            },
          }),
        )

        payload = {
          goalCode: 'verification',
          willConfirm: true,
          protocolVersion: ProtocolVersion.V2,
          presentationDefinition: {
            id: '32f54163-7166-48f1-93d8-ff217bdb0653',
            // eslint-disable-next-line camelcase
            input_descriptors: inputDescriptors,
          },
          comment: 'proof request',
          autoAcceptProof: AutoAccept.NEVER,
          emailId: values.emailData.map((input) => input.email),
          reuseConnection: true,
        }
      } else {
        const parsedSelectedAttributes = getSelectedW3CSchemaDetails
        const selectedAttributesDetails =
          parsedSelectedAttributes.filter(
            (attr: ISelectedAttributes) =>
              attr.isChecked && attr.dataType !== 'number',
          ) || []
        const selectedPredicatesDetails =
          parsedSelectedAttributes.filter(
            (attr) => attr.isChecked && attr.dataType === 'number',
          ) || []

        const requestedAttributes: Record<string, IRequestedAttributes> = {}
        const requestedPredicates: Record<string, IPredicate> = {}

        const attributeGroups = selectedAttributesDetails.reduce(
          (acc, attr) => {
            const key = `${attr.attributeName}:${attr.schemaId}`
            if (!acc[key]) {
              acc[key] = []
            }
            if (attr.credDefId) {
              acc[key].push(attr.credDefId)
            }
            return acc
          },
          {} as Record<string, string[]>,
        )

        Object.keys(attributeGroups).forEach((key) => {
          const [attributeName, ...schemaIdParts] = key.split(':')
          const schemaId = schemaIdParts.join(':')

          if (!requestedAttributes[attributeName]) {
            requestedAttributes[attributeName] = {
              name: attributeName,
              restrictions: [],
            }
          }
          requestedAttributes[attributeName].restrictions.push(
            ...attributeGroups[key].map((credDefId) => ({
              // eslint-disable-next-line camelcase
              schema_id: schemaId,
              // eslint-disable-next-line camelcase
              cred_def_id: credDefId,
            })),
          )
        })

        selectedPredicatesDetails.forEach((attr) => {
          if (attr.isChecked && attr.dataType === 'number') {
            if (
              attr.selectedOption !== '' &&
              Number(attr.value) !== 0 &&
              attr.credDefId
            ) {
              requestedPredicates[attr.attributeName] = {
                name: attr.attributeName,
                // eslint-disable-next-line camelcase
                p_type: attr.selectedOption,
                // eslint-disable-next-line camelcase
                p_value: Number(attr.value),
                restrictions: [
                  {
                    // eslint-disable-next-line camelcase
                    schema_id: attr.schemaId,
                    // eslint-disable-next-line camelcase
                    cred_def_id: attr.credDefId,
                  },
                ],
              }
            } else {
              if (attr.credDefId) {
                if (!requestedAttributes[attr.attributeName]) {
                  requestedAttributes[attr.attributeName] = {
                    name: attr.attributeName,
                    restrictions: [],
                  }
                }
                requestedAttributes[attr.attributeName].restrictions.push({
                  // eslint-disable-next-line camelcase
                  schema_id: attr.schemaId,
                  // eslint-disable-next-line camelcase
                  cred_def_id: attr.credDefId,
                })
              }
            }
          }
        })

        const proofFormats = {
          indy: {
            name: 'proof-request',
            version: '1.0',
            // eslint-disable-next-line camelcase
            requested_attributes: requestedAttributes,
            // eslint-disable-next-line camelcase
            requested_predicates: requestedPredicates,
          },
        }

        payload = {
          goalCode: 'verification',
          reuseConnection: true,
          protocolVersion: ProtocolVersion.V1,
          isShortenUrl: true,
          autoAcceptProof: AutoAccept.NEVER,
          emailId: values.emailData.map((input) => input.email),
          proofFormats,
        }
      }

      const requestType = w3cSchema
        ? RequestType.PRESENTATION_EXCHANGE
        : RequestType.INDY
      const response = await createOobProofRequest(payload, requestType, orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        dispatch(resetAttributeData())
        router.push(pathRoutes.organizations.credentials)
      } else {
        setErrorMessage('Failed to create proof request')
        console.error('API response data:', data)
      }
    } catch (error) {
      console.error('Error during handleSubmit:', error)
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const createHandleInputChange =
    (index: number) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      handleInputChange(index, event)
    }
  return (
    <div className="px-4 pt-2">
      <div className="col-span-full mb-4 xl:mb-2">
        <div>
          <h1 className="mt-4 ml-1 text-xl font-semibold sm:text-2xl">
            Request Proof(s) to Email ID
          </h1>
          <span className="text-md text-muted-foreground">
            Please enter an email address to request a proof to
          </span>
        </div>
      </div>
      {errorMessage && (
        <AlertComponent
          message={errorMessage}
          type={errorMessage ? 'failure' : 'success'}
          onAlertClose={() => {
            setErrorMessage(null)
          }}
        />
      )}
      <div>
        <div className="flex flex-col justify-between">
          <div className="relative">
            <div className="m-0" id="createSchemaCard">
              <div>
                <Formik
                  initialValues={{
                    emailData: emailInputs.map((input) => ({
                      email: input.value,
                    })),
                  }}
                  validationSchema={Yup.object().shape({
                    emailData: Yup.array().of(
                      Yup.object().shape({
                        email: Yup.string()
                          .email('Invalid email address')
                          .required('Email is required'),
                      }),
                    ),
                  })}
                  validateOnBlur
                  validateOnChange
                  enableReinitialize
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, resetForm }) => {
                    const disableAddAnother = values.emailData.some(
                      (input, index) => {
                        const hasNoEmail = !input.email
                        const isTouched =
                          touched.emailData && touched.emailData[index]
                        const hasError =
                          errors.emailData &&
                          errors.emailData[index] &&
                          typeof errors.emailData[index] === 'object' &&
                          'email' in errors.emailData[index] &&
                          errors.emailData[index].email

                        return hasNoEmail || (isTouched && hasError)
                      },
                    )

                    return (
                      <Form>
                        <div className="pb-4">
                          {values.emailData.map((input, index) => (
                            <div key={index} className="">
                              <div className="mb-4 rounded-lg border px-4 pt-8 pb-10">
                                <div className="flex justify-between">
                                  <div className="relative mb-4 flex w-10/12 items-start gap-2">
                                    <Label
                                      htmlFor={`email-${index}`}
                                      className="mt-2 min-w-[80px] text-base font-semibold"
                                    >
                                      Email ID{' '}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>

                                    <div className="flex w-full flex-col md:w-5/12">
                                      <Field name={`emailData.${index}.email`}>
                                        {({
                                          field,
                                        }: {
                                          field: FieldInputProps<string>
                                        }) => (
                                          <Input
                                            id={`email-${index}`}
                                            {...field}
                                            placeholder="Email"
                                            onChange={createHandleInputChange(
                                              index,
                                            )}
                                            className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-md border bg-transparent px-3 py-1 pl-8 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                          />
                                        )}
                                      </Field>

                                      {touched.emailData?.[index]?.email &&
                                        errors.emailData?.[index] &&
                                        typeof errors.emailData[index] ===
                                          'object' &&
                                        'email' in errors.emailData[index] &&
                                        errors.emailData[index].email && (
                                          <p className="text-destructive mt-1 text-xs">
                                            {
                                              (
                                                errors.emailData[
                                                  index
                                                ] as FormikErrors<{
                                                  email: string
                                                }>
                                              ).email
                                            }
                                          </p>
                                        )}
                                    </div>
                                  </div>

                                  {values.emailData.length > 1 && (
                                    <div
                                      key={index}
                                      className="text-destructive flex justify-end sm:w-2/12"
                                    >
                                      <Button
                                        data-testid="deleteBtn"
                                        color="danger"
                                        type="button"
                                        className={
                                          'flex justify-center border-none bg-transparent shadow-none hover:bg-transparent focus:ring-0'
                                        }
                                        onClick={() => handleDeleteInput(index)}
                                      >
                                        <img
                                          src={delSvg.src}
                                          alt="delete"
                                          className="mx-auto h-6 w-6"
                                        />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="absolute flex w-full justify-center">
                            <Button
                              type="button"
                              onClick={handleAddInput}
                              disabled={disableAddAnother}
                              className="border-ring hover:bg-primary/90 absolute bottom-0 left-[50%] m-auto flex w-max translate-x-[-50%] flex-row items-center rounded-full border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-100"
                            >
                              <PlusIcon />
                              <span className="my-0.5 ml-1">Add another</span>
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              resetForm()
                              setEmailInputs([{ value: '' }])
                            }}
                            disabled={loading}
                            className="mb-4 flex items-center rounded-xl px-4 py-2"
                          >
                            <ResetIcon />
                            Reset
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary focus:ring-primary text-primary-foreground items-center justify-center rounded-lg py-1 text-center text-sm font-medium focus:ring-4 focus:outline-none"
                          >
                            {loading && <Loader size={20} />}
                            <RequestProofIcon />
                            Request Proof
                          </Button>
                        </div>
                      </Form>
                    )
                  }}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EmailVerification
