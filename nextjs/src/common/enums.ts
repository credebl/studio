export enum DidMethod {
  INDY = 'did:indy',
  KEY = 'did:key',
  WEB = 'did:web',
  POLYGON = 'did:polygon'
}

export enum Network {
  TESTNET = 'testnet',
  MAINNET = 'mainnet'
}
export enum PolygonNetworks {
  TESTNET = 'Polygon Testnet',
  MAINNET = 'Polygon Mainnet'
}
export enum Ledgers {
  INDY = 'indy',
  POLYGON = 'polygon',
  NO_LEDGER = 'noLedger'
}

export enum DataType {
  NUMBER = 'number',
  INTEGER = 'integer',
  STRING = 'string',
  DATE_TIME = 'datetime-local',
  ARRAY = 'array'
}

export enum Features {
	SEND_INVITATION = 'send_invitations',
	CRETAE_ORG = 'create_org',
	CRETAE_SCHEMA = 'create_schema',
	ISSUANCE = 'issuance',
	VERIFICATION = 'verification',
  }

  export enum SchemaTypes {
    schema_INDY = 'indy',
    schema_W3C = 'w3c'
}