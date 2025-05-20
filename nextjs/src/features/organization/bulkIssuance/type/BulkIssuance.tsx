import { IAttributes } from '../../connectionIssuance/type/Issuance'

export interface GetAllSchemaListParameter {
  itemPerPage?: number
  page?: number
  search?: string
  sortBy?: string
  allSearch?: string
  token?: string
  ledgerId?: string
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
