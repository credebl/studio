export interface SchemaState {
	schemaId: string;
	issuerDid: string;
	attributes: string[];
	createdDateTime: string;
}

export interface CredDefData {
	createDateTime: string;
	credentialDefinitionId: string;
	revocable: boolean;
	schemaLedgerId: string;
	tag: string;
}

export interface IValues {
	value: string;
}

export interface IAttributes {
	attributeName: string
	schemaDataType: string
	displayName: string
}

export interface ICredentials {
	credentialDefinitionId: string;
	schemaCredDefName: string;
	schemaName: string;
	schemaVersion: string;
	schemaAttributes: IAttributes | boolean;
	credentialDefinition: string;
}

export interface IUploadMessage {
	message: string
	type : "success" | "failure"
}
