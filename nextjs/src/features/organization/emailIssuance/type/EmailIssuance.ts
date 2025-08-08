import { CredentialType, SchemaTypeValue, SchemaTypes } from '@/common/enums'
import {
  ICredentials,
  IEmailCredentialData,
} from '../../connectionIssuance/type/Issuance'

import { SelectRef } from '../../bulkIssuance/components/BulkIssuance'

export interface UserData {
  formData: FormDatum[]
}
export interface FromikFormDatum {
  formData: FormDatum[]
  email: string
  attributes: { name: string; value: string }[]
}
export interface FormDatum {
  email: string
  attributes: ICredentialSubjectData[] | Attribute[]
  credentialData?: IEmailCredentialData
}
export interface Attribute {
  id?: string
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
  value: string
  name: string
}
export interface InnerAttribute {
  value: string
  name: string
  isRequired: boolean
  dataType?: string
}

export interface TransformedAttribute {
  emailId: string
  attributes: InnerAttribute[]
}

export interface FromDataFromik {
  formData: FromData[]
}

export interface FromData {
  email: string
  attributes: {
    value: string
    name: string
    isRequired: boolean | undefined
    attributeName: string
    schemaDataType: string
    displayName: string
  }[]
}

export interface IAttributesData {
  isRequired: boolean
  name: string
  value: string
  dataType?: string
}

export interface ICredentialOption {
  id: string
  label: string
  value?: string
  name?: string
  version?: string
  type?: string
  attributes?: IAttributes[]
  schemaLedgerId?: string
  credentialDefinitionId?: string
  schemaCredDefName?: string
  schemaName: string
  schemaVersion?: string
  schemaIdentifier?: string
  schemaAttributes?: IAttributes[]
  credentialDefinition?: string
}

export interface ICredentialSubjectData {
  id?: string
  [key: string]: string | number | boolean | null | undefined
}

export interface IAttributes {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired?: boolean
}

export interface GetAllSchemaListParameter {
  itemPerPage?: number
  page?: number
  search?: string
  sortBy?: string
  allSearch?: string
  token?: string
  ledgerId?: string
}

export interface BulkIssuanceContext {
  formData?: FromDataFromik
  setFormData: React.Dispatch<React.SetStateAction<FromDataFromik | undefined>>

  userData?: UserData
  setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>

  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>

  credentialOptions: ICredentialOptions[]
  setCredentialOptions: React.Dispatch<
    React.SetStateAction<ICredentialOptions[]>
  >

  credentialSelected: ICredentials | null
  setCredentialSelected: React.Dispatch<
    React.SetStateAction<ICredentials | null>
  >

  openModal: boolean
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>

  attributes: IAttributes[]
  setAttributes: React.Dispatch<React.SetStateAction<IAttributes[]>>

  success: string | null
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>

  failure: string | null
  setFailure: React.Dispatch<React.SetStateAction<string | null>>

  issueLoader: boolean
  setIssueLoader: React.Dispatch<React.SetStateAction<boolean>>

  mounted: boolean
  setMounted: React.Dispatch<React.SetStateAction<boolean>>

  schemaType?: SchemaTypes
  setSchemaType: React.Dispatch<React.SetStateAction<SchemaTypes | undefined>>

  credentialType?: CredentialType
  setCredentialType: React.Dispatch<
    React.SetStateAction<CredentialType | undefined>
  >

  credDefId?: string
  setCredDefId: React.Dispatch<React.SetStateAction<string | undefined>>

  schemasIdentifier?: string
  setSchemasIdentifier: React.Dispatch<React.SetStateAction<string | undefined>>

  schemaTypeValue?: SchemaTypeValue
  setSchemaTypeValue: React.Dispatch<
    React.SetStateAction<SchemaTypeValue | undefined>
  >

  isAllSchemaFlagSelected?: boolean
  setIsAllSchemaFlagSelected: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >

  schemaListAPIParameter: {
    itemPerPage: number
    page: number
    search: string
    sortBy: string
    sortingOrder: string
    allSearch: string
  }

  orgId: string
  selectInputRef: React.RefObject<SelectRef | null>
  isCredSelected: boolean
}

export interface ICredentialOptions {
  id: string
  value: string
  label: string
  schemaName: string
  schemaVersion: string
  credentialDefinition: string
  credentialDefinitionId: string
  schemaIdentifier: string
  schemaId: string
  credentialId: string
  schemaAttributes?: IAttributes[]
}

export type IConfirmOOBCredentialIssuance = {
  setIssueLoader: React.Dispatch<React.SetStateAction<boolean>>
  schemaType?: SchemaTypes
  credDefId?: string
  schemasIdentifier?: string
  credentialSelected: ICredentials | null | undefined
  orgId: string
  userData?: UserData
  schemaTypeValue?: SchemaTypeValue
  credentialType?: CredentialType
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>
  setFailure: React.Dispatch<React.SetStateAction<string | null>>
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
  setCredentialSelected: React.Dispatch<
    React.SetStateAction<ICredentials | null | undefined>
  >
  selectInputRef: React.RefObject<SelectRef | null>
}

export type IHandleReset = {
  setCredentialSelected: React.Dispatch<
    React.SetStateAction<ICredentials | null | undefined>
  >
  selectInputRef: React.RefObject<SelectRef | null>
  setClear?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface GetAllSchemaListParameter {
  itemPerPage?: number
  page?: number
  search?: string
  sortBy?: string
  allSearch?: string
  token?: string
  ledgerId?: string
}

export interface IGetSchemaCredentials {
  schemaListAPIParameter: {
    itemPerPage: number
    page: number
    search: string
    sortBy: string
    sortingOrder: string
    allSearch: string
  }
  setIsAllSchemaFlagSelected: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >
  schemaType: SchemaTypes | undefined
  setSchemaTypeValue: React.Dispatch<
    React.SetStateAction<SchemaTypeValue | undefined>
  >
  setCredentialType: React.Dispatch<
    React.SetStateAction<CredentialType | undefined>
  >
  setSchemaType: React.Dispatch<React.SetStateAction<SchemaTypes | undefined>>

  isAllSchemaFlagSelected?: boolean

  setCredentialOptions: React.Dispatch<
    React.SetStateAction<ICredentialOptions | undefined>
  >
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>
  setFailure: React.Dispatch<React.SetStateAction<string | null>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  orgId: string
  allSchema?: boolean
  ledgerId?: string
}

export interface ISelectSchmea {
  allSchema: boolean | undefined
  handleFilterChange: (value: string) => Promise<void>
  optionsWithDefault: string[]
}
