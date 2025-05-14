import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface Attribute {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}

interface SchemaState {
  attributes: Attribute[]
  issuerDid: string
  createdDate: string
  schemaId: string
}

const initialState: SchemaState = {
  attributes: [],
  issuerDid: '',
  createdDate: '',
  schemaId: '',
}

const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    setSelectedSchema(state, action: PayloadAction<SchemaState>) {
      state.attributes = action.payload.attributes
      state.issuerDid = action.payload.issuerDid
      state.createdDate = action.payload.createdDate
      state.schemaId = action.payload.schemaId
    },
  },
})

export const { setSelectedSchema } = schemaSlice.actions

export default schemaSlice.reducer
