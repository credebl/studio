// src/lib/orgSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
interface Tenant {
  id: string
  name: string
  logoUrl?: string
}
interface OrgInfo {
  id?: string
  name?: string
  description?: string
  logoUrl?: string
  roles: string[]
  appLaunchDetails?: object[]
}

interface OrgState {
  orgId: string
  ledgerId: string
  selectedOrgId: string
  orgInfo: OrgInfo | null
  orgRoles: string[]
  selectedTenant: Tenant | null
}

const initialState: OrgState = {
  orgId: '',
  ledgerId: '',
  selectedOrgId: '',
  orgInfo: null,
  orgRoles: [],
  selectedTenant: null,
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
    setTenantData: (state, action: PayloadAction<Tenant | null>) => {
      state.selectedTenant = action.payload
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
    resetOrgState: () => initialState,
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
  resetOrgState,
  setTenantData,
} = orgSlice.actions
export default orgSlice.reducer
