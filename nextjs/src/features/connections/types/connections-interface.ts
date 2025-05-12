import { JSX } from 'react'

export interface IConnectionList {
  theirLabel: string
  connectionId: string
  createDateTime: string
  checked?: boolean
}

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
