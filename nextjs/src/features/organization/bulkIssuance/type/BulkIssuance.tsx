import {
  IAttributes,
  IUploadMessage,
} from '../../connectionIssuance/type/Issuance'

import { SchemaTypes } from '@/features/common/enum'
import { SelectRef } from '../components/BulkIssuance'

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

export type IDownloadSchemaTemplate = (
  credentialSelected: ICredentials | null | undefined,
  schemaType: SchemaTypes,
  selectedTemplate: string | undefined,
  orgId: string,
  setSuccess: (msg: string | null) => void,
  setUploadMessage: (msg: IUploadMessage | null) => void,
  setFailure: (msg: string | null) => void,
  setLoading: (isLoading: boolean) => void,
) => Promise<void>

export interface IContext {
  setLoading: (isLoading: boolean) => void
  setUploadMessage: (msg: IUploadMessage | null) => void
  setSuccess: (msg: string | null) => void
  setFailure: (msg: string | null) => void
  socketId: string
  setUploadedFileName: (fileName: string) => void
  schemaType: SchemaTypes | undefined
  selectedTemplate: string | undefined
  orgId: string
  setRequestId: (requestId: string) => void
  setIsFileUploaded: (status: boolean) => void
  currentPage: IInitialPage
  setCsvData: (data: string[][]) => void
  setCurrentPage: (page: IInitialPage) => void
  isCredSelected: boolean
  setIsAllSchema: (status: boolean) => void
  setSchemaType: (type: SchemaTypes | undefined) => void
  isAllSchema: boolean | undefined
  setCredentialOptionsData: (options: ICredentialOptions) => void
  requestId: string
  setCredentialSelected: (credential: ICredentials | null) => void
  setOpenModal: (status: boolean) => void
  selectInputRef: React.RefObject<SelectRef | null>
  isFileUploaded: boolean
  uploadedFileName: string
  uploadMessage: IUploadMessage | null
  ledgerId: string
}

export interface IInitialPage {
  pageNumber: number
  pageSize: number
  total: number
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
