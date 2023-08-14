export interface SchemaState {
	schemaId: string;
	issuerDid: string;
	issuerDidNew?:string;
	attributes: string[];
	createdDateTime: string;
	ledger:string
	ledgerShow?:any
}

export interface CredDefData {
	credentialDefinitionId: string;
	revocable: boolean;
	schemaLedgerId: string;
	tag: string;
}
