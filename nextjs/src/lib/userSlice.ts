// src/lib/userSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface UserInfo {
  email: string
  firstName: string
  lastName: string
}

interface UserState {
  userInfo: UserInfo
}

const initialState: UserState = {
  userInfo: {
    email: '',
    firstName: '',
    lastName: '',
  },
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfileDetails: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload
    },
  },
})

export const { setUserProfileDetails } = userSlice.actions
export default userSlice.reducer
