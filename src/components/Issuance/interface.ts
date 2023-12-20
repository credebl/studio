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

export interface IssuedCredential {
	metadata: { [x: string]: { schemaId: string } };
	connectionId: string;
	createDateTime: string;
	state: string;
	isRevocable: boolean;
	schemaId: string;
}

export interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	isProcessing: boolean;
}

export interface IConnectionList {
	theirLabel: string;
	connectionId: string;
	createDateTime: string;
}
