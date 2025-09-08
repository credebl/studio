import { createSlice } from '@reduxjs/toolkit'

interface SidebarState {
  isCollapsed: boolean
}

const initialState: SidebarState = {
  isCollapsed: true,
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleLogo(state) {
      state.isCollapsed = !state.isCollapsed
    },
    setSidebarCollapsed(state, action: { payload: boolean }) {
      state.isCollapsed = action.payload
    },
  },
})

export const { toggleLogo, setSidebarCollapsed } = sidebarSlice.actions
export default sidebarSlice.reducer
