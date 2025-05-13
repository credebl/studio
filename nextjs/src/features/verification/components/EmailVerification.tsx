'use client'

import * as Yup from 'yup'

import {
  AutoAccept,
  ProtocolVersion,
  RequestType,
} from '@/features/common/enum'
import { Field, Form, Formik } from 'formik'
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
import { apiStatusCodes } from '@/config/CommonConstant'
import { createOobProofRequest } from '@/app/api/verification'
import { getOrganizationById } from '@/app/api/organization'
import { resetVerificationState } from '@/lib/verificationSlice'
import { useRouter } from 'next/navigation'

const EmailVerification = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailInputs, setEmailInputs] = useState<{ value: string }[]>([
    { value: '' },
  ])
  const [w3cSchema, setW3cSchema] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const route = useRouter()

  const orgId = useAppSelector((state) => state.organization.orgId)
  const getSelectedW3CSchemaDetails = useAppSelector(
    (state) => state.verification.attributeData,
  )

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>): void => {
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
    const response = await getOrganizationById(orgId) as AxiosResponse<any, any>
    const { data } = response
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
      let payload: any = null

      if (w3cSchema) {
        const parsedW3CSchemaDetails = getSelectedW3CSchemaDetails

        const groupedAttributes: Record = parsedW3CSchemaDetails
          .filter((attribute: ISelectedAttributes) => attribute.isChecked)
          .reduce((acc, attribute) => {
            const schemaUri = attribute.schemaId
            if (schemaUri && !acc[schemaUri]) {
              const updatedAcc = { ...acc }
              updatedAcc[schemaUri] = {
                id: (attribute.schemaId?.split('/').pop() ?? '') as string,
                name: attribute.schemaName || '',
                schema: [{ uri: schemaUri }],
                constraints: {
                  fields: [],
                },
                purpose: 'Verify proof',
              }
              return updatedAcc
            }
            if (schemaUri) {
              acc[schemaUri].constraints.fields.push({
                path: `$.credentialSubject['${attribute.attributeName}']`,
              })
            }
            return acc
          }, {} as Record)

        const inputDescriptors = Object.values(groupedAttributes).map(
          (descriptor) => ({
            ...(descriptor as {
              id: string
              name: string
              schema: { uri: string }[]
              constraints: { fields: { path: string }[] }
              purpose: string
            }),
            constraints: {
              fields: [
                {
                  path: (
                    descriptor as {
                      constraints: { fields: { path: string }[] }
                    }
                  ).constraints.fields.map((field) => field.path),
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
        const selectedPredicatesDetails: ISelectedAttributes[] =
          (parsedSelectedAttributes.filter(
            (attr: ISelectedAttributes) =>
              attr.isChecked && attr.dataType === 'number',
          ) as ISelectedAttributes[]) || []

        const requestedAttributes: Record = {}
        const requestedPredicates: Record = {}

        const attributeGroups = selectedAttributesDetails.reduce(
          (acc: Record, attr: ISelectedAttributes): Record => {
            const key: string = `${attr.attributeName}:${attr.schemaId}`
            if (!acc[key]) {
              return { ...acc, [key]: [] }
            }
            acc[key].push(attr.credDefId as string)
            return acc
          },
          {} as Record,
        )

        Object.keys(attributeGroups).forEach((key) => {
          const parts = key.split(':')
          const attributeName = parts[0]
          const schemaId = parts.slice(1).join(':')

          if (!requestedAttributes[attributeName]) {
            requestedAttributes[attributeName] = {
              name: attributeName,
              restrictions: [],
            }
          }
          requestedAttributes[attributeName].restrictions.push(
            ...attributeGroups[key].map(
              (
                credDefId: string,
              ): { schema_id: string; cred_def_id: string } => ({
                schema_id: schemaId,
                cred_def_id: credDefId,
              }),
            ),
          )
        })

        selectedPredicatesDetails.forEach((attr: ISelectedAttributes) => {
          if (attr.isChecked && attr.dataType === 'number') {
            if (attr.selectedOption !== '' && Number(attr.value) !== 0) {
              requestedPredicates[attr.attributeName] = {
                name: attr.attributeName,
                p_type: attr.selectedOption as string,
                p_value: Number(attr.value),
                restrictions: [
                  {
                    schema_id: attr.schemaId as string,
                    cred_def_id: attr.credDefId as string,
                  },
                ],
              } as IPredicate
            } else {
              if (!requestedAttributes[attr.attributeName]) {
                requestedAttributes[attr.attributeName] = {
                  name: attr.attributeName,
                  restrictions: [],
                } as IRequestedAttributes
              }
              requestedAttributes[attr.attributeName].restrictions.push({
                schema_id: attr.schemaId as string,
                cred_def_id: attr.credDefId as string,
              })
            }
          }
        })

        const proofFormats = {
          indy: {
            name: 'proof-request',
            version: '1.0',
            requested_attributes: requestedAttributes,
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
      const response: AxiosResponse = await createOobProofRequest(
        payload,
        requestType,
      )
      if (response.data.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        dispatch(resetVerificationState())
        route.push('/verification')
      } else {
        setErrorMessage(response.data.errorMessage)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Error processing request')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-7xl py-6">
      <div className="space-y-6">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Email Verification
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Verify emails for credential issuance.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              {errorMessage && <AlertComponent message={errorMessage} />}
              <Formik
                initialValues={{ emailData: emailInputs }}
                validationSchema={Yup.object({
                  emailData: Yup.array()
                    .of(
                      Yup.object({
                        email: Yup.string()
                          .email('Invalid email address')
                          .required('Email is required'),
                      }),
                    )
                    .required('At least one email is required'),
                })}
                onSubmit={handleSubmit}
              >
                {({ values, handleChange, errors, touched }) => (
                  <Form>
                    <div className="space-y-6">
                      {values.emailData.map((emailInput, index) => (
                        <div key={index} className="flex space-x-2">
                          <Field
                            name={`emailData[${index}].email`}
                            type="email"
                            value={emailInput.value}
                            onChange={(event) =>
                              handleInputChange(index, event)
                            }
                            className="focus:ring-primary focus:border-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                          <Button
                            type="button"
                            onClick={() => handleDeleteInput(index)}
                            className="text-red-500"
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        onClick={handleAddInput}
                        className="mt-4"
                      >
                        Add Email
                      </Button>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-white disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Proof Request'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
