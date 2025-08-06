import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface AuthState {
  token: string
  refreshToken: string
  sessionId: string
}

const initialState: AuthState = {
  token: '',
  refreshToken: '',
  sessionId: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    logout: (state) => {
      state.token = ''
      state.refreshToken = ''
    },
  },
})

export const { setToken, setRefreshToken, setSessionId, logout } =
  authSlice.actions
export default authSlice.reducer
