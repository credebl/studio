// src/lib/orgSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface ISocket {
  SOCKET_ID: string
}

const initialState: ISocket = {
  SOCKET_ID: '',
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocketId: (state, action: PayloadAction<string>) => {
      state.SOCKET_ID = action.payload
    },
  },
})

export const { setSocketId } = socketSlice.actions
export default socketSlice.reducer
