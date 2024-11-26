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
	name?:string;
	version?:string;
	type?:string;
	attributes?:IAttributes[];
	schemaLedgerId?:string;
	value?:String;
	label?: string;
	credentialDefinitionId?: string;
	schemaCredDefName?: string;
	schemaName: string;
	schemaVersion: string;
	schemaIdentifier: string;
	schemaAttributes?: IAttributes[];
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
	schemaName: string;
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
	w3cAttributes?: IAttributesData[];
	issuerDid?:string;
}

export interface IGetSchemaData {
		schemaId: string;
		schemaName: string;
		version: string;
		issuerDid: string;
		attributes: IAttribute[];
		created: string;
	}
	
export interface IAttribute {
		attributeName: string;
		schemaDataType: string;
		displayName: string;
		isRequired: boolean;
}

export interface SelectedUsers {
	userName: string;
	connectionId: string;
}

export interface IAttributesData {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}

export interface ICredentialdata {
	connectionId: string;
	options?:IOptions;
	attributes?: IAttributesData[];
	credential?:IW3cPayload;
}
export interface IOptions {
	proofType:string;
	proofPurpose:string;
}

export interface IEmailCredentialData{
	attributes?: IAttributesData[];
	credential?:IW3cPayload;
}

	export interface IW3cPayload {
		"@context": string[];
		type: string[];
		issuer: IIssuerData;
		issuanceDate: string;
		credentialSubject:ICredentialSubjectData;
	}

	export interface ICredentialSubjectData  {
		id: string;
		[key: string]: any; 
	};
	export interface IIssuerData {
		id: string;
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

export interface IIssueAttributes {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}

export interface ICredentialOffer {
	emailId: string;
	attributes?: IAttributesData[];
	credential?: IW3cPayload;
	options?:IOptionData;
  }

  export interface IOptionData  {
	proofType: string;
	proofPurpose: string;
  };
  
  export interface ITransformedData {
	credentialOffer: ICredentialOffer[];
	credentialDefinitionId?: string;
	protocolVersion?: string;
	isReuseConnection?: boolean;
	credentialType?: string;
  }