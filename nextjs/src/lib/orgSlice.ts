import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrgState {
  orgId: string;
  ledgerId: string;
}

const initialState: OrgState = {
  orgId: '',
  ledgerId: ''
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
    clearOrgId: (state) => {
      state.orgId = '';
    },
    clearLedgerId: (state) => {
      state.ledgerId = '';
    }
  }
});

export const { setOrgId, clearOrgId, setLedgerId, clearLedgerId } =
  orgSlice.actions;
export default orgSlice.reducer;
