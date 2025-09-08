export interface GetAllSchemaListParameter {
  itemPerPage?: number
  page?: number
  search?: string
  sortBy?: string
  allSearch?: string
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

export interface SchemaDetails {
  attribute: string[]
  issuerDid: string
  createdDate: string
  schemaName?: string
  version?: string
  schemaId?: string
}
