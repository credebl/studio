import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface OrgData {
  name: string
  description: string
  countryId: string | null
  stateId: string | null
  cityId: string | null
  website: string
  logoFile: File | null
  logoPreview: string
}
interface SharedLedgerConfig {
  orgName: string
  orgId: string
  walletName: string
  maskedSeeds: string
  seeds: string
  submitSharedWallet?: () => void
}

interface WalletSpinupState {
  step: number
  formData: OrgData | null
  orgId: string | null
  orgName: string
  walletSpinupStatus: boolean
  ledgerConfig: boolean
  createOrgForm: boolean
  sharedLedgerConfig: SharedLedgerConfig | null
}

const initialState: WalletSpinupState = {
  step: 1,
  formData: null,
  orgId: null,
  orgName: '',
  walletSpinupStatus: false,
  ledgerConfig: false,
  createOrgForm: true,
  sharedLedgerConfig: null,
}

const walletSpinupSlice = createSlice({
  name: 'walletSpinup',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload
    },
    setFormData: (state, action: PayloadAction<OrgData>) => {
      state.formData = action.payload
    },
    setOrgId: (state, action: PayloadAction<string | null>) => {
      state.orgId = action.payload
    },
    setOrgName: (state, action: PayloadAction<string>) => {
      state.orgName = action.payload
    },
    setWalletSpinupStatus: (state, action: PayloadAction<boolean>) => {
      state.walletSpinupStatus = action.payload
    },
    setLedgerConfig: (state, action: PayloadAction<boolean>) => {
      state.ledgerConfig = action.payload
    },
    setIsCreateOrgForm: (state, action: PayloadAction<boolean>) => {
      state.createOrgForm = action.payload
    },
    setSharedLedgerConfig: (
      state,
      action: PayloadAction<SharedLedgerConfig>,
    ) => {
      state.sharedLedgerConfig = action.payload
    },
    clearSharedLedgerConfig: (state) => {
      state.sharedLedgerConfig = null
    },
  },
})

export const {
  setStep,
  setFormData,
  setOrgId,
  setOrgName,
  setWalletSpinupStatus,
  setLedgerConfig,
  setIsCreateOrgForm,
  setSharedLedgerConfig, // Fixed casing
  clearSharedLedgerConfig,
} = walletSpinupSlice.actions

export default walletSpinupSlice.reducer
