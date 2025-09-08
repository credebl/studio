import * as Yup from 'yup'

import { Dispatch, SetStateAction } from 'react'
import { FormikErrors, FormikTouched } from 'formik'
import {
  ICredentialOption,
  ICredentialOptions,
} from '../../emailIssuance/type/EmailIssuance'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { SchemaTypes } from '@/common/enums'

export interface SchemaState {
  schemaId: string
  issuerDid: string
  attributes: string[]
  createdDateTime: string
}

export interface CredDefData {
  createDateTime: string
  credentialDefinitionId: string
  revocable: boolean
  schemaLedgerId: string
  tag: string
}

export interface IAttributes {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired?: boolean
}

export interface ICredentials {
  name?: string
  version?: string
  type?: string
  attributes?: IAttributes[]
  schemaLedgerId?: string
  value?: string
  label?: string
  credentialDefinitionId?: string
  schemaCredDefName?: string
  schemaName: string
  schemaVersion: string
  schemaIdentifier: string
  schemaAttributes?: IAttributes[]
  credentialDefinition?: string
}

export interface IUploadMessage {
  message: string
  type: 'success' | 'failure'
}

export interface IssuedCredential {
  connectionId: string
  createDateTime: string
  createdBy: string
  state: string
  isRevocable: boolean
  credentialExchangeId: string
  schemaId: string
  schemaName: string
  orgId: string
  connections: IConnection
}

interface IConnection {
  theirLabel: string
  connectionId: string
}

export interface IProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (flag: boolean) => void
  isProcessing: boolean
}

export interface IConnectionList {
  theirLabel: string
  connectionId: string
  createDateTime: string
  checked?: boolean
}

export interface SchemaDetails {
  schemaName: string
  version: string
  schemaId: string
  credDefId: string
  schemaAttributes?: IAttribute[]
}

export interface AllSchemaDetails {
  value: string
  label: string
  schemaName: string
  type: string
  schemaVersion: string
  schemaIdentifier: string
  attributes: IAttribute[]
}
export interface W3cSchemaDetails {
  schemaName: string
  version: string
  schemaId: string
  w3cAttributes?: IAttributesData[]
  issuerDid?: string
}

export interface IGetSchemaData {
  schemaId: string
  schemaName: string
  version: string
  issuerDid: string
  attributes: IAttribute[]
  created: string
}

export interface IAttribute {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}

export interface SelectedUsers {
  userName: string
  connectionId: string
}

export interface IAttributesData {
  isRequired: boolean
  name: string
  value: string
  dataType: string
}

export interface ICredentialdata {
  connectionId: string
  options?: IOptions
  attributes?: IAttributesData[]
  credential?: IW3cPayload
}
export interface IOptions {
  proofType: string
  proofPurpose: string
}

export interface IEmailCredentialData {
  attributes?: IAttributesData[]
  credential?: IW3cPayload
}

export interface IW3cPayload {
  '@context': string[]
  type: string[]
  issuer: IIssuerData
  issuanceDate: string
  credentialSubject: ICredentialSubjectData
}

export interface ICredentialSubjectData {
  id: string
  [key: string]: string | number | boolean | null | undefined
}
export interface IIssuerData {
  id: string
}
export interface IssuanceFormPayload {
  userName?: string
  credentialData: ICredentialdata[]
  credentialDefinitionId?: string
  orgId: string
}

export interface W3cIssuanceFormPayload {
  userName?: string
  credentialData: ICredentialdata[]
  orgId: string
}

export interface DataTypeAttributes {
  isRequired: boolean
  schemaDataType: string
  attributeName: string
}

export interface IIssueAttributes {
  isRequired: boolean
  name: string
  value: string
  dataType: string
}

export interface ICredentialOffer {
  emailId: string
  attributes?: IAttributesData[]
  credential?: IW3cPayload
  options?: IOptionData
}

export interface IOptionData {
  proofType: string
  proofPurpose: string
}

export interface ITransformedData {
  credentialOffer: ICredentialOffer[]
  credentialDefinitionId?: string
  protocolVersion?: string
  isReuseConnection?: boolean
  credentialType?: string
}

export type Option = {
  value: string
  label: string
  id: string
  schemaName: string
  schemaVersion: string
  schemaId: string
  credentialId: string
  schemaIdentifier?: string
  attributes?: IAttribute[]
}

export type IHandleSubmit = {
  values: IssuanceFormPayload
  w3cSchema: boolean
  schemaDetails: SchemaDetails
  orgDid: string
  schemaType: string | undefined
  setIssuanceLoader: (flag: boolean) => void
  orgId: string
  setSuccess: Dispatch<SetStateAction<string | null>>
  router: AppRouterInstance
  setFailure: (msg: string | null) => void
}

export interface IFormikValues {
  userName?: string
  credentialData: ICredentialdata[]
  credentialDefinitionId?: string
  orgId: string
}

export interface IFieldArrayProps {
  values: IFormikValues
  w3cSchema: boolean
  issuanceFormPayload: IssuanceFormPayload | W3cIssuanceFormPayload
  errors: FormikErrors<{
    userName?: string
    credentialData: ICredentialdata[]
    credentialDefinitionId?: string
    orgId: string
  }>
  touched: FormikTouched<{
    userName?: string
    credentialData: ICredentialdata[]
    credentialDefinitionId?: string
    orgId: string
  }>
  validationSchema: Yup.ObjectSchema<
    {
      credentialData?: {
        attributes?: {
          value?: string
        }[]
      }[]
    },
    Yup.AnyObject,
    {
      credentialData: ''
    },
    ''
  >
}

export interface CreateIssuanceForm {
  selectedUsers: SelectedUsers[]
  attributes: DataTypeAttributes[]
  credDefId: string
  orgId: string
  setIssuanceFormPayload: React.Dispatch<
    React.SetStateAction<IssuanceFormPayload>
  >
  setUserLoader: React.Dispatch<React.SetStateAction<boolean>>
}

export interface IEmailIssuanceCardProps {
  schemaType: SchemaTypes | undefined
  allSchema: boolean | undefined
  handleFilterChange: (value: string) => Promise<void>
  optionsWithDefault: string[]
  credentialOptions: ICredentialOptions | undefined
  selectValue: string
  clear: boolean
  handleSelect: (value: ICredentialOption) => void
  handleSearchChange: (value: string) => void
  mounted: boolean
  credentialSelected: ICredentials | null | undefined
  attributes: IAttributes[]
  isAllSchemaFlagSelected: boolean | undefined
}

export interface IIssuanceHeaderProps {
  handleBackClick: () => void
  isLoading: boolean
  success: string | null
  error: string | null
  setError: Dispatch<SetStateAction<string | null>>
  setSuccess: Dispatch<SetStateAction<string | null>>
  setCreateLoading: Dispatch<SetStateAction<boolean>>
  createLoading: boolean
}
