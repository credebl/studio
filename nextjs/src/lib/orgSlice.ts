// src/lib/orgSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface OrgInfo {
  id?: string
  name?: string
  description?: string
  logoUrl?: string
  roles: string[]
}

interface OrgState {
  orgId: string
  ledgerId: string
  selectedOrgId: string
  orgInfo: OrgInfo | null
  orgRoles: string[]
}

const initialState: OrgState = {
  orgId: '',
  ledgerId: '',
  selectedOrgId: '',
  orgInfo: null,
  orgRoles: [],
}

const orgSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrgId: (state, action: PayloadAction<string>) => {
      state.orgId = action.payload
    },
    setLedgerId: (state, action: PayloadAction<string>) => {
      state.ledgerId = action.payload
    },
    setOrgInfo: (state, action: PayloadAction<OrgInfo>) => {
      state.orgInfo = action.payload
    },
    setSelectedOrgId: (state, action: PayloadAction<string>) => {
      state.selectedOrgId = action.payload
    },
    setOrgRoles: (state, action: PayloadAction<string[]>) => {
      state.orgRoles = action.payload
    },
    clearOrgId: (state) => {
      state.orgId = ''
    },
    clearLedgerId: (state) => {
      state.ledgerId = ''
    },
    clearOrgInfo: (state) => {
      state.orgInfo = null
    },
  },
})

export const {
  setOrgId,
  setLedgerId,
  setOrgInfo,
  setSelectedOrgId,
  setOrgRoles,
  clearOrgId,
  clearLedgerId,
  clearOrgInfo,
} = orgSlice.actions
export default orgSlice.reducer
