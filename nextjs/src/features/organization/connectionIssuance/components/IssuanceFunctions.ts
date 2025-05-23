import {
  CREDENTIAL_CONTEXT_VALUE,
  apiStatusCodes,
  proofPurpose,
} from '@/config/CommonConstant'
import { CredentialType, ProofType, SchemaTypeValue } from '@/common/enums'
import {
  IAttributesData,
  ICredentialdata,
  IHandleSubmit,
} from '../type/Issuance'
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
          //FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
          credentialSubject: item?.attributes?.reduce(
            (acc, attr) => {
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
    store.dispatch(setSelectedConnection([]))
    store.dispatch(setSelectedUser([]))
  } else {
    setFailure(typeof issueCredRes === 'string' ? issueCredRes : '')
    setIssuanceLoader(false)
  }
}
