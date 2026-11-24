export type HolderCredentialFormat = 'sd-jwt-vc' | 'mso_mdoc' | 'w3c-vc'

export interface HolderActionResult<T = undefined> {
  status: 'success' | 'error'
  message: string
  data?: T
}

export interface HolderWalletState {
  available: boolean
  hasWallet: boolean
  dids: HolderDid[]
  message?: string
}

export interface HolderDid {
  id?: string
  did?: string
  method?: string
  keyType?: string
  isPrimary?: boolean
  raw: Record<string, unknown>
}

export interface HolderCredential {
  id: string
  format: HolderCredentialFormat
  title: string
  issuer?: string
  issuedAt?: string
  encoded?: string
  raw: Record<string, unknown>
}

export interface HolderOfferConfiguration {
  id: string
  label: string
  raw: Record<string, unknown>
}

export interface HolderResolvedOffer {
  configurations: HolderOfferConfiguration[]
  raw: unknown
}

export interface HolderConnection {
  id: string
  label: string
  state?: string
  raw: Record<string, unknown>
}

export interface HolderProof {
  id: string
  state?: string
  raw: Record<string, unknown>
}
