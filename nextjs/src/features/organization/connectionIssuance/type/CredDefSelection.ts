import { JSX } from 'react'

export interface ITableData {
  clickId?: string | null
  data: Data[]
}

export interface Data {
  handleChange(value: string): void
  inputType: string
  data: string | JSX.Element
  subData?: string
}

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
