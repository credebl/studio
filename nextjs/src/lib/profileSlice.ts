import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface ProfileState {
  id: string | null
  profileImg: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
}

const initialState: ProfileState = {
  id: null,
  profileImg: null,
  firstName: null,
  lastName: null,
  email: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileState>) => ({
      ...state,
      ...action.payload,
    }),
    clearProfile: () => initialState,
  },
})

export const { setProfile, clearProfile } = profileSlice.actions
export default profileSlice.reducer
