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
	schemaAttributes?:any;
	label?: string;
}

export interface IAttributes {
	attributeName: string
	schemaDataType: string
	displayName: string
	isRequired?: boolean
}

export interface ICredentials {
	value?:String;
	label?: string;
	credentialDefinitionId?: string;
	schemaCredDefName: string;
	schemaName: string;
	schemaVersion: string;
	schemaIdentifier: string;
	schemaAttributes: IAttributes[];
	credentialDefinition?: string;
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
	checked?: boolean;
}

export interface SchemaDetails {
	schemaName: string;
	version: string;
	schemaId: string;
	credDefId: string;
}

export interface W3cSchemaDetails {
	schemaName: string;
	version: string;
	schemaId: string;
	w3cAttributes?: Attributes[];
	issuerDid?:string;
}

export interface IGetSchemaData {
		schemaId: string;
		schemaName: string;
		version: string;
		issuerDid: string;
		attributes: Attribute[];
		created: string;
	}
	
	export interface Attribute {
		attributeName: string;
		schemaDataType: string;
		displayName: string;
		isRequired: boolean;
	}



export interface SelectedUsers {
	userName: string;
	connectionId: string;
}

export interface Attributes {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}

export interface ICredentialdata {
	connectionId: string;
	options?:IOptions;
	attributes?: Attributes[];
	credential?:IW3cPayload;
}
export interface IOptions {
	proofType:string;
	proofPurpose:string;
}

export interface IEmailCredentialData{
	attributes?: Attributes[];
	credential?:IW3cPayload;
}


export interface IW3cPayload {
        "@context": string[];
        type: string[];
        issuer: {
            id: string;
        };
        issuanceDate: string;
        credentialSubject: {
			id: string;
			[key: string]: any; 
        };
}
export interface IssuanceFormPayload {
	userName?: string;
	credentialData: ICredentialdata[];
	credentialDefinitionId?: string;
	orgId: string;
}

export interface W3cIssuanceFormPayload {
	userName?: string;
	credentialData: ICredentialdata[];
	orgId: string;
}

export interface DataTypeAttributes {
	isRequired: any;
	schemaDataType: string;
	attributeName:string
}

export interface Attribute {
	isRequired: boolean;
    attributeName: string;
    schemaDataType: string;
    displayName: string;
}

export interface IIssueAttributes {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}