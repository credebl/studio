import {
  CredDefData,
  ISchema,
  ISchemaAttributeData,
  ISelectedAttributes,
  IW3CSchemaAttributeItem,
  LocalOrgs,
  SelectedUsers,
} from '../features/verification/type/interface'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface VerificationState {
  schemaAttributes: ISchemaAttributeData[]
  selectedSchemas: ISchema[]
  orgId: string
  routeType: string
  schemaId: string[] | null
  attributeData: ISelectedAttributes[]
  selectedConnections: LocalOrgs[]
  selectedUser: SelectedUsers[]
  w3cSchemaAttributes: IW3CSchemaAttributeItem[]
  CRED_DEF_ID: string
  CredDefData: CredDefData[]
  SCHEMA_CRED_DEFS: CredDefData[]
}

const initialState: VerificationState = {
  schemaAttributes: [],
  selectedSchemas: [],
  orgId: '',
  routeType: '',
  schemaId: null,
  attributeData: [],
  selectedConnections: [],
  selectedUser: [],
  w3cSchemaAttributes: [],
  CRED_DEF_ID: '',
  CredDefData: [],
  SCHEMA_CRED_DEFS: [],
}

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setSchemaAttributes(state, action: PayloadAction<ISchemaAttributeData[]>) {
      state.schemaAttributes = action.payload
    },
    setSelectedSchemasData(state, action: PayloadAction<ISchema[]>) {
      state.selectedSchemas = action.payload
    },
    setOrgId(state, action: PayloadAction<string>) {
      state.orgId = action.payload
    },
    setVerificationRouteType(state, action: PayloadAction<string>) {
      state.routeType = action.payload
    },
    setSchemaId(state, action: PayloadAction<string[] | null>) {
      state.schemaId = action.payload
    },
    setSelectedAttributeData(
      state,
      action: PayloadAction<ISelectedAttributes[]>,
    ) {
      state.attributeData = action.payload
    },
    setSelectedConnections(state, action: PayloadAction<LocalOrgs[]>) {
      state.selectedConnections = action.payload
    },
    setSelectedUser(state, action: PayloadAction<SelectedUsers[]>) {
      state.selectedUser = action.payload
    },
    setW3CSchemaAttributes(
      state,
      action: PayloadAction<IW3CSchemaAttributeItem[]>,
    ) {
      state.w3cSchemaAttributes = action.payload
    },
    setCredDefId: (state, action: PayloadAction<string>) => {
      state.CRED_DEF_ID = action.payload
    },
    setCredDefData: (state, action: PayloadAction<CredDefData[]>) => {
      state.CredDefData = action.payload
    },
    setSchemaCredDefs: (state, action: PayloadAction<CredDefData[]>) => {
      state.SCHEMA_CRED_DEFS = action.payload
    },
    resetVerificationState(state) {
      state.schemaAttributes = []
      state.selectedSchemas = []
      state.orgId = ''
      state.routeType = ''
      state.schemaId = null
      state.attributeData = []
      state.selectedConnections = []
      state.selectedUser = []
      state.w3cSchemaAttributes = []
      state.CRED_DEF_ID = ''
      state.CredDefData = []
      state.SCHEMA_CRED_DEFS = []
    },
    resetAttributeData(state) {
      state.attributeData = []
    },
    resetSelectedSchemas(state) {
      state.selectedSchemas = []
    },
    resetSchemaAttributes(state) {
      state.schemaAttributes = []
    },
    resetSelectedConnections(state) {
      state.selectedConnections = []
    },
    resetSelectedUser(state) {
      state.selectedUser = []
    },
    resetW3CSchemaAttributes(state) {
      state.w3cSchemaAttributes = []
    },
    resetSchemaId(state) {
      state.schemaId = null
    },
    resetOrgId(state) {
      state.orgId = ''
    },
    resetRouteType(state) {
      state.routeType = ''
    },
    resetCredDefId(state) {
      state.CRED_DEF_ID = ''
    },
    resetCredDefData(state) {
      state.CredDefData = []
    },
    resetSchemaCredDefs(state) {
      state.SCHEMA_CRED_DEFS = []
    },
  },
})

export const {
  setSchemaAttributes,
  setSelectedSchemasData,
  setOrgId,
  setVerificationRouteType,
  setSchemaId,
  setSelectedAttributeData,
  setSelectedConnections,
  setSelectedUser,
  setW3CSchemaAttributes,
  setCredDefId,
  setCredDefData,
  setSchemaCredDefs,
  resetVerificationState,
  resetAttributeData,
  resetSelectedSchemas,
  resetSchemaAttributes,
  resetSelectedConnections,
  resetSelectedUser,
  resetW3CSchemaAttributes,
  resetSchemaId,
  resetOrgId,
  resetRouteType,
  resetCredDefId,
  resetCredDefData,
  resetSchemaCredDefs,
} = verificationSlice.actions

export default verificationSlice.reducer
