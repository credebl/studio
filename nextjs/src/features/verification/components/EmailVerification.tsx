/* eslint-disable max-lines */
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
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DidMethod } from '@/common/enums'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createOobProofRequest } from '@/app/api/verification'
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

  return (
    <div className="px-4 pt-2">
      <div className="col-span-full mb-4 xl:mb-2">
        <div>
          <h1 className="text-primary-foreground mt-4 ml-1 text-xl font-semibold sm:text-2xl">
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
                                            onChange={(
                                              event: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                              handleInputChange(index, event)
                                            }
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
                                    <Button
                                      data-testid="deleteBtn"
                                      type="button"
                                      color="danger"
                                      onClick={() => handleDeleteInput(index)}
                                      className="text-destructive flex justify-end focus:outline-none"
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
                              className={
                                'focus:ring-ring text-primary dark:disabled:text-secondary-disabled disabled:text-primary-disabled hover:enabled:bg-primary border-primary disabled:border-primary-disabled group dark:border-gray dark:bg-gray dark:focus:ring-gray dark:hover:enabled:!bg-gray dark:hover:enabled:!text-gray absolute bottom-0 left-[50%] m-auto flex w-max translate-x-[-50%] flex-row items-center rounded-full border bg-white hover:text-white focus:ring-2 disabled:opacity-100'
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-6 w-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-primary-foreground my-0.5 ml-1">
                                Add another
                              </span>
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
                            className="border-ring hover:bg-primary mb-4 flex items-center gap-2 rounded-xl border px-4 py-2 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="dark:group-hover:text-primary mr-2 dark:text-white"
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
                            className="bg-primary focus:ring-primary text-primary-foreground items-center justify-center rounded-lg py-1 text-center text-sm font-medium focus:ring-4 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              fill="none"
                              viewBox="0 0 20 20"
                              className="dark:group-hover:text-primary mr-2 dark:text-white"
                            >
                              <path
                                fill="currentColor"
                                d="M8.828 12.171a.75.75 0 0 0 1.06 0l7-7a.75.75 0 0 0-1.06-1.06L9.358 10.44l-3.56-3.56a.75.75 0 0 0-1.06 1.06l4 4Z"
                              />
                            </svg>
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
