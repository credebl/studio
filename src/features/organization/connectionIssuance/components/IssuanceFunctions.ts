import * as Yup from 'yup'

import {
  CREDENTIAL_CONTEXT_VALUE,
  apiStatusCodes,
  proofPurpose,
} from '@/config/CommonConstant'
import {
  CreateIssuanceForm,
  IAttributesData,
  ICredentialdata,
  IHandleSubmit,
  Option,
  SchemaDetails,
} from '../type/Issuance'
import { CredentialType, ProofType, SchemaTypeValue } from '@/common/enums'
import { setSelectedConnection, setSelectedUser } from '@/lib/storageKeys'

import { AxiosResponse } from 'axios'
import { issueCredential } from '@/app/api/Issuance'
import { pathRoutes } from '@/config/pathRoutes'
import { store } from '@/lib/store'

export const handleSubmit = async ({
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
}: IHandleSubmit): Promise<void> => {
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
          credentialSubject: item?.attributes?.reduce(
            (acc, attr) => {
              const { value } = attr

              if (attr.dataType === 'number') {
                const num = Number(value)
                acc[attr.name] = isNaN(num) ? 0 : num
              } else if (attr.dataType === 'boolean') {
                acc[attr.name] = value === 'true'
              } else if (attr.dataType === 'date') {
                acc[attr.name] = value ? new Date(value).toISOString() : null
              } else {
                // assume string or fallback
                acc[attr.name] = value ?? ''
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
    store.dispatch(setSelectedConnection([]))
    store.dispatch(setSelectedUser([]))
  } else {
    setFailure(typeof issueCredRes === 'string' ? issueCredRes : '')
    setIssuanceLoader(false)
  }
}

export const createAttributeValidationSchema = (
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

export const handleSelect = ({
  value,
  setSchemaDetails,
  allSchema,
  w3cSchema,
}: {
  value: Option
  setSchemaDetails: React.Dispatch<React.SetStateAction<SchemaDetails>>
  allSchema: boolean | undefined
  w3cSchema: boolean
}): void => {
  if (allSchema && w3cSchema) {
    setSchemaDetails({
      schemaName: value.schemaName,
      version: value.schemaVersion,
      schemaId: value.schemaIdentifier ?? '',
      credDefId: value.credentialId,
      schemaAttributes: value.attributes ?? [],
    })
  } else {
    const data = JSON.parse(value.value)
    setSchemaDetails({
      schemaName: value.schemaName,
      version: value.schemaVersion,
      schemaId: value.schemaId,
      credDefId: value.credentialId,
      schemaAttributes: data,
    })
  }
}

export const createIssuanceFormFunction = ({
  selectedUsers,
  attributes,
  credDefId,
  orgId,
  setIssuanceFormPayload,
  setUserLoader,
}: CreateIssuanceForm): void => {
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
