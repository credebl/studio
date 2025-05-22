import { SchemaTypeValue } from '@/common/enums'

export interface ISchemaData {
  schemaId: string
  schemaName: string
  attributes: IAttributes[]
}

export interface IAttributesDetails {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}

export interface ISchema {
  schemaLedgerId?: string
  schemaId: string
  attributes: IAttributesDetails[]
  issuerId: string
  createdDate: string
}

export interface IAttributesDetails {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}

export interface ISchemaCardProps {
  className?: string
  schemaName: string
  selectedSchemas?: ISchema[]
  version: string
  schemaId: string
  issuerDid: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any
  created: string
  isClickable?: boolean
  showCheckbox?: boolean
  onClickCallback?: (SchemaData: {
    schemaId: string
    attributes: string[]
    issuerDid: string
    created: string
  }) => void

  onClickW3CCallback?: (W3CSchemaData: {
    schemaId: string
    schemaName: string
    version: string
    issuerDid: string
    attributes: []
    created: string
  }) => void

  onClickW3cIssue?: (
    schemaId: string,
    schemaName: string,
    version: string,
    issuerDid: string,
    attributes: [],
    created: string,
  ) => void
  onChange?: (checked: boolean, schemaData: ISchemaData[]) => void
  limitedAttributes?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectionChange?: (selectedSchemas: any[]) => void
  w3cSchema?: boolean
  noLedger?: boolean
  isVerification?: boolean
  isVerificationUsingEmail?: boolean
}

export interface IW3cSchemaDetails {
  schemaName: string
  version: string
  schemaId: string
  w3cAttributes?: IAttributesData[]
  issuerDid?: string
  created?: string
}

export interface IAttributesData {
  isRequired: boolean
  name: string
  value: string
  dataType: string
}

export interface SchemaListItem {
  attribute: string[]
  issuerDid: string
  createdDate: string
  schemaName?: string
  version?: string
  schemaId?: string
}

export interface SchemaDetail {
  schemaName: string
  schemaVersion?: string
  schemaType?: SchemaTypeValue
  attributes: IAttributes[]
  description?: string
  orgId: string
}
export interface FieldName {
  type: string
  schemaPayload: SchemaDetail
}

export interface IAttributes {
  id?: string
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired?: boolean
}
export interface IFormData {
  schemaName: string
  schemaVersion?: string
  schemaType?: SchemaTypeValue
  description?: string
  attribute: IAttributes[]
}

export interface CredDeffFieldNameType {
  tag: string
  revocable: boolean
  orgId: string
  schemaLedgerId: string
}

export interface Values {
  tagName: string
  revocable: boolean
}

export interface ICredDefCard {
  tag: string
  credentialDefinitionId: string
  schemaLedgerId: string
  revocable: boolean
}
