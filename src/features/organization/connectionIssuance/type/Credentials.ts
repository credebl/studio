export interface IssuedCredential {
  metadata: { [x: string]: { schemaId: string } }
  connectionId: string
  createDateTime: string
  state: string
  isRevocable: boolean
  schemaId: string
  schemaName: string
}
