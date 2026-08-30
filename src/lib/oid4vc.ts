import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface IOid4vc {
  issuance: {
    issuerId: string
  }
}

const initialState: IOid4vc = {
  issuance: {
    issuerId: '',
  },
}

const oid4vcSlice = createSlice({
  name: 'oid4vc',
  initialState,
  reducers: {
    addIssuer: (state, action: PayloadAction<string>) => {
      state.issuance.issuerId = action.payload
    },
    clearProfile: () => initialState,
  },
})

export const { addIssuer } = oid4vcSlice.actions
export default oid4vcSlice.reducer
