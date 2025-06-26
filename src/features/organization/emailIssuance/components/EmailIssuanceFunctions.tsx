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

  const existingData = userData

  const transformedData: ITransformedData = { credentialOffer: [] }

  if (existingData?.formData) {
    if (schemaType === SchemaTypes.schema_INDY) {
      existingData.formData.forEach((entry: FormDatum) => {
        const transformedEntry: ICredentialOffer = {
          emailId: entry.email,
          attributes: [],
        }
        entry.attributes.forEach((attribute) => {
          const transformedAttribute = {
            value: String(attribute.value || ''),
            name: (attribute.name || '') as string,
            isRequired: attribute.isRequired as boolean,
            dataType: '',
          }
          transformedEntry?.attributes?.push(transformedAttribute)
        })
        transformedData.credentialOffer.push(transformedEntry)
      })
      transformedData.credentialDefinitionId = credDefId
      transformedData.isReuseConnection = true
    } else if (schemaType === SchemaTypes.schema_W3C) {
      existingData.formData.forEach((entry: FormDatum) => {
        const credentialOffer = {
          emailId: entry.email,
          credential: {
            '@context': [CREDENTIAL_CONTEXT_VALUE, schemasIdentifier].filter(
              (v): v is string => typeof v === 'string',
            ),

            type: [
              'VerifiableCredential',
              credentialSelected?.schemaName,
            ].filter((v): v is string => typeof v === 'string'),

            issuer: {
              id: orgId,
            },
            issuanceDate: new Date().toISOString(),

            //FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
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

        transformedData.credentialOffer.push(
          credentialOffer as ICredentialOffer,
        )
      })

      transformedData.protocolVersion = 'v2'
      transformedData.isReuseConnection = true
      transformedData.credentialType = CredentialType.JSONLD
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
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
        handleReset({
          setCredentialSelected,
          selectInputRef,
        })
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
      setTimeout(() => {
        setFailure(null)
      }, 4000)
    }
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

    const allSchemaSelectedFlag = 'false'
    if (allSchemaSelectedFlag === 'false' || !allSchemaSelectedFlag) {
      setIsAllSchemaFlagSelected(false)
    } else if (allSchemaSelectedFlag === 'true') {
      setIsAllSchemaFlagSelected(true)
    }
    let currentSchemaType = schemaType
    if (orgDid?.includes(DidMethod.POLYGON)) {
      currentSchemaType = SchemaTypes.schema_W3C
      setSchemaTypeValue(SchemaTypeValue.POLYGON)
      setCredentialType(CredentialType.JSONLD)
    } else if (
      orgDid?.includes(DidMethod.KEY) ||
      orgDid?.includes(DidMethod.WEB)
    ) {
      currentSchemaType = SchemaTypes.schema_W3C
      setSchemaTypeValue(SchemaTypeValue.NO_LEDGER)

      setCredentialType(CredentialType.JSONLD)
    } else if (orgDid?.includes(DidMethod.INDY)) {
      setCredentialType(CredentialType.INDY)
      currentSchemaType = SchemaTypes.schema_INDY
    }
    setSchemaType(currentSchemaType)

    let options = []

    //FIXME:  Logic of API call as per schema selection
    if (
      (currentSchemaType === SchemaTypes.schema_INDY && orgId) ||
      (currentSchemaType === SchemaTypes.schema_W3C &&
        isAllSchemaFlagSelected === false)
    ) {
      const response = await getSchemaCredDef(currentSchemaType, orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const credentialDefs = data.data

        options = credentialDefs.map(
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
          ) => ({
            value:
              (schemaType === SchemaTypes.schema_INDY
                ? credentialDefinitionId
                : schemaVersion) ?? '',
            label: `${schemaName} [${schemaVersion}]${currentSchemaType === SchemaTypes.schema_INDY ? ` - (${credentialDefinition})` : ''}`,
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
          }),
        )

        setCredentialOptions(options)
      } else {
        setSuccess(null)
        setFailure(null)
      }
      setLoading(false)
      // eslint-disable-next-line brace-style
    }

    //FIXME:  Logic of API call as per schema selection
    else if (
      currentSchemaType === SchemaTypes.schema_W3C &&
      orgId &&
      allSchemaSelectedFlag
    ) {
      const response = await getAllSchemas(
        schemaListAPIParameter,
        currentSchemaType,
        orgId,
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const credentialDefs = data.data.data
        options = credentialDefs.map(
          ({
            name,
            version,
            schemaLedgerId,
            attributes,
            type,
          }: ICredentials) => ({
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
        setCredentialOptions(options)
      } else {
        setSuccess(null)
        setFailure(null)
      }
      setLoading(false)
    }

    setCredentialOptions(options)
  } catch (error) {
    setSuccess(null)
    setFailure(null)
  }
}
