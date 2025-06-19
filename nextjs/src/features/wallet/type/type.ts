export interface IDidListData {
  id: string
  did: string
  isPrimaryDid: boolean
}

export interface IUpdatePrimaryDid {
  id: string
  did: string
}

export interface IPolygonKeys {
  privateKey: string
  publicKeyBase58: string
  address: string
}

export interface IFormValues {
  method: string
  ledger: string
  network: string
  domain: string
  privatekey: string
  endorserDid: string
  did: string
}

export interface OrgRole {
  name: string
}

export interface UserOrgRole {
  orgId: string | null
  organisation: {
    id: string
    name: string
  } | null
  orgRole: OrgRole
}

export interface Organization {
  id: string
  name: string
  userOrgRoles: UserOrgRole[]
}

export interface DidData {
  seed: string
  keyType: string
  method: string
  network: string
  domain: string
  role: string
  privatekey: string
  did: string
  endorserDid: string
  isPrimaryDid: boolean
}
