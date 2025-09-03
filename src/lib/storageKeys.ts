import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { SelectedUsers } from '@/features/organization/connectionIssuance/type/Issuance'

interface AuthState {
  W3C_SCHEMA_DATA?: W3cSchemaDetails
  W3C_SCHEMA_DETAILS?: W3cSchemaDetails
  ALL_SCHEMAS?: boolean
  ORG_DID?: string
  SCHEMA_ATTR?: SchemaDetails
  SCHEMA_ID?: string
  CRED_DEF_ID?: string
  SELECTED_CONNECTIONS?: LocalOrgs[]
  SELECTED_USER?: SelectedUsers[] | SelectedUsersString[]
}
interface SelectedUsersString {
  userName: string
  connectionId: string
}

const initialState: AuthState = {
  ALL_SCHEMAS: false,
  W3C_SCHEMA_DATA: {
    schemaId: '',
    schemaName: '',
    version: '',
    issuerDid: '',
    attributes: [],
    created: '',
  },
}
interface W3cSchemaDetails {
  schemaId: string
  schemaName: string
  version: string
  issuerDid: string
  attributes: []
  created: string
}
export interface SchemaDetails {
  attribute: string[]
  issuerDid: string
  createdDate: string
  schemaName?: string
  version?: string
  schemaId?: string
}

type LocalOrgs = {
  connectionId: string
  theirLabel: string
  createDateTime: string
}

const storageKeys = createSlice({
  name: 'storageKeys',
  initialState,
  reducers: {
    setW3cSchemaData: (state, action: PayloadAction<W3cSchemaDetails>) => {
      state.W3C_SCHEMA_DATA = action.payload
    },
    setSchemaDetails: (state, action: PayloadAction<W3cSchemaDetails>) => {
      state.W3C_SCHEMA_DETAILS = action.payload
    },
    setAllSchema: (state, action: PayloadAction<boolean>) => {
      state.ALL_SCHEMAS = action.payload
    },
    setOrgDid: (state, action: PayloadAction<string>) => {
      state.ORG_DID = action.payload
    },
    setSchemaAttr: (state, action: PayloadAction<SchemaDetails>) => {
      state.SCHEMA_ATTR = action.payload
    },
    setSchemaId: (state, action: PayloadAction<string>) => {
      state.SCHEMA_ID = action.payload
    },
    setCredDefId: (state, action: PayloadAction<string>) => {
      state.CRED_DEF_ID = action.payload
    },
    setSelectedConnection: (state, action: PayloadAction<LocalOrgs[]>) => {
      state.SELECTED_CONNECTIONS = action.payload
    },
    clearSelectedConnection: (state) => {
      state.SELECTED_CONNECTIONS = []
    },
    clearSelectedUser: (state) => {
      state.SELECTED_USER = []
    },
    setSelectedUser: (state, action: PayloadAction<SelectedUsers[]>) => {
      state.SELECTED_USER = action.payload
    },
    clearStorage: () => initialState,
  },
})

export const {
  clearSelectedUser,
  setSelectedUser,
  setW3cSchemaData,
  setSchemaDetails,
  setAllSchema,
  setOrgDid,
  setCredDefId,
  setSchemaAttr,
  setSchemaId,
  clearStorage,
  setSelectedConnection,
  clearSelectedConnection,
} = storageKeys.actions
export default storageKeys.reducer
