// src/lib/orgSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrgInfo {
  id?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  roles: string[];
}

interface OrgState {
  orgId: string;
  ledgerId: string;
  orgInfo: OrgInfo | null;
}

const initialState: OrgState = {
  orgId: '',
  ledgerId: '',
  orgInfo: null
};

const orgSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrgId: (state, action: PayloadAction<string>) => {
      state.orgId = action.payload;
    },
    setLedgerId: (state, action: PayloadAction<string>) => {
      state.ledgerId = action.payload;
    },
    setOrgInfo: (state, action: PayloadAction<OrgInfo>) => {
      state.orgInfo = action.payload;
    },
    clearOrgId: (state) => {
      state.orgId = '';
    },
    clearLedgerId: (state) => {
      state.ledgerId = '';
    },
    clearOrgInfo: (state) => {
      state.orgInfo = null;
    }
  }
});

export const {
  setOrgId,
  setLedgerId,
  setOrgInfo,
  clearOrgId,
  clearLedgerId,
  clearOrgInfo
} = orgSlice.actions;
export default orgSlice.reducer;
