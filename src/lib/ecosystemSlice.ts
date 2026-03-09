import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface Ecosystem {
  id: string
  name: string
  ecosystemEnableStatus: boolean
}

const initialState: Ecosystem = {
  id: '',
  name: '',
  ecosystemEnableStatus: false,
}

const ecosystemSlice = createSlice({
  name: 'ecosystem',
  initialState,
  reducers: {
    setEcosystemName: (state, action: PayloadAction<{ name: string }>) => {
      state.name = action.payload.name
    },
    setEcosystemId: (state, action: PayloadAction<{ id: string }>) => {
      state.id = action.payload.id
    },
    setEcosystemEnableStatus: (state, action: PayloadAction<boolean>) => {
      state.ecosystemEnableStatus = action.payload
    },
  },
})

export const { setEcosystemName, setEcosystemId, setEcosystemEnableStatus } =
  ecosystemSlice.actions
export default ecosystemSlice.reducer
