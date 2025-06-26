import { JSX } from 'react'

export interface IConnectionList {
  theirLabel: string
  connectionId: string
  createDateTime: string
  checked?: boolean
}

export interface ITableData {
  id?: string
  clickId?: string | null
  data: Data[]
}

export interface Data {
  handleChange(value: string): void
  inputType: string
  data: string | JSX.Element
  subData?: string
}
export interface Connection {
  createDateTime: string
  createdBy: string
  orgId: string
  state: string
  theirLabel: string
  connectionId: string
}

export interface ConnectionResponse {
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number
  previousPage: number
  lastPage: number
  data: Connection[]
}

export enum ConnectionApiSortFields {
  CREATE_DATE_TIME = 'createDateTime',
  THEIR_LABEL = 'theirLabel',
  CONNECTIONID = 'connectionId',
}
export enum ConnectionState {
  completed = 'completed',
  abandoned = 'abandoned',
}

export const ConnectionStateUserText: Record<ConnectionState, string> = {
  [ConnectionState.completed]: 'Completed',
  [ConnectionState.abandoned]: 'Abandoned',
}
