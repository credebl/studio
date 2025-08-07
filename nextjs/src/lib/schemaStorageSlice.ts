import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface W3cData {
  value: string
  label: string
  schemaName: string
  type: string
  schemaVersion: string
  schemaIdentifier: string
  attributes: string
  schemaId: string
  credentialId: string
}

interface SchemaInfo {
  type: string
  w3cSchema?: W3cData
  nonW3cSchema?: string
}

const initialState: SchemaInfo = {
  type: '',
}

const schemaStorageSlice = createSlice({
  name: 'schemaStorage',
  initialState,
  reducers: {
    setSchemaDetails: (state, action: PayloadAction<SchemaInfo>) => {
      state.type = action.payload.type
      if (action.payload.w3cSchema) {
        state.w3cSchema = action.payload.w3cSchema
      }
      if (action.payload.nonW3cSchema) {
        state.nonW3cSchema = action.payload.nonW3cSchema
      }
    },
    resetSchemaDetails: () => initialState,
  },
})

export const { setSchemaDetails, resetSchemaDetails } =
  schemaStorageSlice.actions
export default schemaStorageSlice.reducer
