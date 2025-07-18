export interface IAttribute {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
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

export interface IAlertComponent {
  message: string | null
  type: string
  viewButton?: boolean
  path?: string
  onAlertClose: () => void
}
