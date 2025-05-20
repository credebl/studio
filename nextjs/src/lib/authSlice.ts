import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface AuthState {
  token: string
  authToken: string
  refreshToken: string
}

const initialState: AuthState = {
  token: '',
  authToken: '',
  refreshToken: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload
    },
    logout: (state) => {
      state.token = ''
      state.refreshToken = ''
      state.authToken = ''
    },
  },
})

export const { setToken, setAuthToken, setRefreshToken, logout } = authSlice.actions
export default authSlice.reducer
