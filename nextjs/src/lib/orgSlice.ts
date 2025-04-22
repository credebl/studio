import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrgState {
  orgId: string | null;
}

const initialState: OrgState = {
  orgId: null
};

const orgSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrgId: (state, action: PayloadAction<string | null>) => {
      state.orgId = action.payload;
    },
    clearOrgId: () => initialState
  }
});

export const { setOrgId, clearOrgId } = orgSlice.actions;
export default orgSlice.reducer;
