import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface Ecosystem {
  id: string
  name: string
}

const initialState: Ecosystem = {
  id: '',
  name: '',
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
  },
})

export const { setEcosystemName, setEcosystemId } = ecosystemSlice.actions
export default ecosystemSlice.reducer
