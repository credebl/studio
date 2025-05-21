export interface IAttribute {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}
export interface IAttributes {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired?: boolean
}
export interface ISchemaData {
  schemaId: string
  schemaName: string
  attributes: IAttribute[]
}

export interface ICustomCheckboxProps {
  isSelectedSchema: boolean
  showCheckbox: boolean
  isVerificationUsingEmail?: boolean
  onChange: (checked: boolean, schemaData?: ISchemaData) => void
  schemaData?: ISchemaData
}

export interface ISchemaCardProps {
  className?: string
  schemaName: string
  selectedSchemas: ISchema[]
  version: string
  schemaId: string
  issuerDid: string
  attributes: []
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
  onSelectionChange?: (selectedSchemas: []) => void
  w3cSchema?: boolean
  noLedger?: boolean
  isVerification?: boolean
  isVerificationUsingEmail?: boolean
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

export interface GetAllSchemaListParameter {
  itemPerPage?: number
  page?: number
  search?: string
  sortBy?: string
  allSearch?: string
  token: string
  ledgerId: string
}
