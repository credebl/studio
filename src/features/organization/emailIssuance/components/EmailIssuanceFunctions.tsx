/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CREDENTIAL_CONTEXT_VALUE,
  apiStatusCodes,
  proofPurpose,
} from '@/config/CommonConstant'
import {
  CredentialType,
  DidMethod,
  ProofType,
  SchemaTypeValue,
  SchemaTypes,
} from '@/common/enums'
import {
  FormDatum,
  IConfirmOOBCredentialIssuance,
  IGetSchemaCredentials,
  IHandleReset,
} from '../type/EmailIssuance'
import {
  ICredentialOffer,
  ICredentials,
  ITransformedData,
} from '../../connectionIssuance/type/Issuance'

import { AxiosResponse } from 'axios'
import { getAllSchemas } from '@/app/api/schema'
import { getOrganizationById } from '@/app/api/organization'
import { getSchemaCredDef } from '@/app/api/BulkIssuance'
import { issueOobEmailCredential } from '@/app/api/Issuance'
import { pathRoutes } from '@/config/pathRoutes'

export const handleReset = ({
  setCredentialSelected,
  selectInputRef,
  setClear,
}: IHandleReset): void => {
  setCredentialSelected(null)
  if (setClear) {
    setClear((prev) => !prev)
  }
  if (selectInputRef?.current) {
    selectInputRef?.current.clearValue()
  }
}

const fetchOrganizationDetails = async (orgId: string): Promise<string> => {
  if (!orgId) {
    return ''
  }

  const response = await getOrganizationById(orgId as string)
  const { data } = response as AxiosResponse

  if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
    if (
      data?.data?.org_agents?.length > 0 &&
      data?.data?.org_agents[0]?.orgDid
    ) {
      return data?.data?.org_agents[0]?.orgDid
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const transformIndyData = (
  existingData: IConfirmOOBCredentialIssuance['userData'],
  credDefId: string | undefined,
): ITransformedData => {
  const transformedData: ITransformedData = { credentialOffer: [] }

  existingData?.formData?.forEach((entry: FormDatum) => {
    const transformedEntry: ICredentialOffer = {
      emailId: entry.email,
      attributes: [],
    }

    entry.attributes.forEach((attribute) => {
      transformedEntry.attributes!.push({
        value: String(attribute.value || ''),
        name: (attribute.name || '') as string,
        isRequired: attribute.isRequired as boolean,
        dataType: '',
      })
    })
    transformedData.credentialOffer.push(transformedEntry)
  })

  transformedData.credentialDefinitionId = credDefId ?? ''
  transformedData.isReuseConnection = true

  return transformedData
}

const transformW3CData = async (
  existingData: IConfirmOOBCredentialIssuance['userData'],
  orgId: string,
  credentialSelected: ICredentials | null | undefined,
  schemasIdentifier: string | undefined, // ✅ Update parameter type
  schemaTypeValue: SchemaTypeValue | undefined,
): Promise<ITransformedData> => {
  const orgDID = await fetchOrganizationDetails(orgId)
  if (!orgDID) {
    throw new Error('Missing orgDid for payload')
  }

  const transformedData: ITransformedData = { credentialOffer: [] }

  // ✅ Provide fallback for undefined schemasIdentifier
  const contextValues = [CREDENTIAL_CONTEXT_VALUE, schemasIdentifier].filter(
    (v): v is string => typeof v === 'string' && v !== '',
  )

  existingData?.formData?.forEach((entry: FormDatum) => {
    const credentialOffer = {
      emailId: entry.email,
      credential: {
        '@context': contextValues, // ✅ Use the filtered array
        type: ['VerifiableCredential', credentialSelected?.schemaName].filter(
          (v): v is string => typeof v === 'string',
        ),
        issuer: { id: orgDID },
        issuanceDate: new Date().toISOString(),
        credentialSubject: entry?.attributes?.reduce(
          (acc, attr) => {
            if (typeof attr.name === 'string') {
              if (
                attr.schemaDataType === 'number' &&
                (attr.value === '' || attr.value === null)
              ) {
                acc[attr.name] = 0
              } else if (
                attr.schemaDataType === 'string' &&
                attr.value === ''
              ) {
                acc[attr.name] = ''
              } else if (attr.value !== null) {
                acc[attr.name] = attr.value
              }
            }
            return acc
          },
          {} as Record<string, string | number | boolean | undefined>,
        ),
      },
      options: {
        proofType:
          schemaTypeValue === SchemaTypeValue.POLYGON
            ? ProofType.polygon
            : ProofType.no_ledger,
        proofPurpose,
      },
    }
    transformedData.credentialOffer.push(credentialOffer as ICredentialOffer)
  })

  transformedData.protocolVersion = 'v2'
  transformedData.isReuseConnection = true
  transformedData.credentialType = CredentialType.JSONLD

  return transformedData
}
export const confirmOOBCredentialIssuance = async ({
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
}: IConfirmOOBCredentialIssuance): Promise<void> => {
  setIssueLoader(true)

  let transformedData: ITransformedData = { credentialOffer: [] }

  if (userData?.formData) {
    if (schemaType === SchemaTypes.schema_INDY) {
      transformedData = transformIndyData(userData, credDefId)
    } else if (schemaType === SchemaTypes.schema_W3C) {
      transformedData = await transformW3CData(
        userData,
        orgId,
        credentialSelected,
        schemasIdentifier, // This can now be string | undefined
        schemaTypeValue,
      )
    }

    const transformedJson = JSON.stringify(transformedData, null, 2)
    if (!credentialType) {
      return
    }

    const response = await issueOobEmailCredential(
      transformedJson,
      credentialType,
      orgId,
    )
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      if (data?.data) {
        setLoading(false)
        setIssueLoader(false)
        setSuccess(data?.message)
        setOpenModal(false)
        setTimeout(() => setSuccess(null), 3000)
        handleReset({ setCredentialSelected, selectInputRef })
        setTimeout(() => {
          window.location.href = pathRoutes?.organizations?.issuedCredentials
        }, 500)
      } else {
        setFailure(data?.message)
        setLoading(false)
        setIssueLoader(false)
        setOpenModal(false)
      }
    } else {
      setLoading(false)
      setFailure(response as string)
      setOpenModal(false)
      setIssueLoader(false)
      setTimeout(() => setFailure(null), 4000)
    }
  }
}

const mapIndyCredentialDefs = (
  credentialDefs: any,
  schemaType: SchemaTypes | undefined,
  currentSchemaType: SchemaTypes | undefined,
): any =>
  credentialDefs.map(
    (
      {
        schemaName,
        schemaVersion,
        credentialDefinition,
        credentialDefinitionId,
        schemaIdentifier,
        schemaAttributes,
      }: ICredentials,
      id: number,
    ) => {
      const suffix =
        currentSchemaType === SchemaTypes.schema_INDY
          ? ` - (${credentialDefinition})`
          : ''

      return {
        value:
          (schemaType === SchemaTypes.schema_INDY
            ? credentialDefinitionId
            : schemaVersion) ?? '',
        label: `${schemaName} [${schemaVersion}]${suffix}`,
        schemaName: schemaName || '',
        schemaVersion,
        credentialDefinition,
        schemaIdentifier,
        credentialDefinitionId,
        id,
        schemaAttributes:
          schemaAttributes &&
          typeof schemaAttributes === 'string' &&
          JSON.parse(schemaAttributes),
      }
    },
  )

const mapW3CCredentialDefs = (credentialDefs: any): any =>
  credentialDefs.map(
    ({ name, version, schemaLedgerId, attributes, type }: ICredentials) => ({
      value: version,
      label: `${name} [${version}]`,
      schemaName: name,
      type,
      schemaVersion: version,
      schemaIdentifier: schemaLedgerId,
      attributes: Array.isArray(attributes)
        ? attributes
        : attributes
          ? JSON.parse(attributes)
          : [],
    }),
  )

const setSchemaAndCredentialType = (
  orgDid: string,
  setSchemaTypeValue: React.Dispatch<
    React.SetStateAction<SchemaTypeValue | undefined>
  >,
  setCredentialType: React.Dispatch<
    React.SetStateAction<CredentialType | undefined>
  >,
): SchemaTypes | undefined => {
  if (orgDid?.includes(DidMethod.POLYGON)) {
    setSchemaTypeValue(SchemaTypeValue.POLYGON)
    setCredentialType(CredentialType.JSONLD)
    return SchemaTypes.schema_W3C
  } else if (
    orgDid?.includes(DidMethod.KEY) ||
    orgDid?.includes(DidMethod.WEB)
  ) {
    setSchemaTypeValue(SchemaTypeValue.NO_LEDGER)
    setCredentialType(CredentialType.JSONLD)
    return SchemaTypes.schema_W3C
  } else if (orgDid?.includes(DidMethod.INDY)) {
    setCredentialType(CredentialType.INDY)
    return SchemaTypes.schema_INDY
  }
}

export const getSchemaCredentials = async ({
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
  allSchema = false,
  ledgerId = '',
}: IGetSchemaCredentials): Promise<void> => {
  try {
    let orgDid = ''

    const response = await getOrganizationById(orgId)

    if (typeof response === 'string') {
      console.error('Error fetching organization:', response)
    } else {
      const { data } = response
      orgDid = data?.data?.org_agents[0]?.orgDid
      // proceed with data
    }
    const allSchemaSelectedFlag = allSchema
    if (allSchemaSelectedFlag) {
      setIsAllSchemaFlagSelected(true)
    } else {
      setIsAllSchemaFlagSelected(false)
    }
    let currentSchemaType = schemaType
    currentSchemaType = setSchemaAndCredentialType(
      orgDid,
      setSchemaTypeValue,
      setCredentialType,
    )
    setSchemaType(currentSchemaType)

    let options = []

    if (
      (currentSchemaType === SchemaTypes.schema_INDY && orgId) ||
      (currentSchemaType === SchemaTypes.schema_W3C &&
        isAllSchemaFlagSelected === false)
    ) {
      const response = await getSchemaCredDef(currentSchemaType, orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(null)
        setFailure(null)
      }
      const credentialDefs = data.data
      options = mapIndyCredentialDefs(
        credentialDefs,
        schemaType,
        currentSchemaType,
      )
      setCredentialOptions(options)
      setLoading(false)
      // eslint-disable-next-line brace-style
    } else if (
      currentSchemaType === SchemaTypes.schema_W3C &&
      orgId &&
      allSchemaSelectedFlag
    ) {
      const response = await getAllSchemas(
        schemaListAPIParameter,
        currentSchemaType,
        ledgerId,
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(null)
        setFailure(null)
      }
      const credentialDefs = data.data.data
      options = mapW3CCredentialDefs(credentialDefs)
      setCredentialOptions(options)
      setLoading(false)
    }

    setCredentialOptions(options)
  } catch (error) {
    setSuccess(null)
    setFailure(null)
  }
}
