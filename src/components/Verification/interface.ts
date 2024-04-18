export interface SchemaState {
	schemaId: string;
	issuerDid: string;
	attributes: string[];
	createdDateTime: string;
}

export interface CredDefData {
	credentialDefinitionId: string;
	revocable: boolean;
	schemaLedgerId: string;
	tag: string;
}

export interface RequestProof {
	_tags: {
		state: string;
		threadId: string;
		connectionId: string;
	};
	metadata: Record<string, any>;
	id: string;
	presentationId: string;
	createdAt: string;
	protocolVersion: string;
	state: string;
	connectionId: string;
	threadId: string;
	autoAcceptProof: string;
	createDateTime: string;
	isVerified?: boolean;
}

export interface SchemaDetails {
	attribute: string[];
	issuerDid: string;
	createdDate: string;
	schemaName?: string;
	version?: string;
	schemaId?: string;
}

export interface IProofRrquestDetails {
	verifyLoading: boolean;
	openModal: boolean;
	closeModal: (flag: boolean, id: string, state: boolean) => void;
	onSucess: (verifyPresentationId: string) => void;
	requestId: string;
	userData: object[];
	view: boolean;
	userRoles?: string[];
}

export interface IConnectionList {
	theirLabel: string;
	connectionId: string;
	createDateTime: string;
}

export interface SchemaDetail {
	schemaName: string;
	version: string;
	schemaId: string;
	credDefId: string;
}
export interface IW3cSchemaDetails {
	schemaName: string;
	version: string;
	schemaId: string;
	w3cAttributes?: IAttributesData[];
	issuerDid?:string;
	created?:string;
}

export interface IAttributesData {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}


export interface IInput {
	attributeName: string;
	value: string;
}
export interface IAttribute {
	displayName: string;
	attributeName: string;
	schemaDataType: string;
	schemaName?: string;
	credDefName?: string;
	schemaId?: string;
	credDefId?: string;
}
export interface SelectedUsers {
	userName: string;
	connectionId: string;
}

interface IAttributes {
	schemaId: string;
	credDefId?: string | undefined;
	attributeName: string;
	condition: undefined;
	value: number | undefined;
}
export interface VerifyCredentialPayload {
	connectionId: string;
	attributes: IAttributes;
	comment: string;
	orgId: string;
}

export type SelectedOption = "Select" | "Greater than" | "Less than" | "Greater than or equal to" | "Less than or equal to"; 

export interface ISelectedUser {
	name?: string;
	condition?: string;
	dataType: string;
	displayName?: string;
	attributeName: string;
	schemaName?: string;
	schemaId?: string;
	credDefName?: string;
	isChecked: false;
	value: number;
	selectedOption?: SelectedOption;
	inputError?: '';
	selectError?: '';
	options?: [
		{
			label: string;
			value: string;
		},
	];
}

export interface IOption {
	value: string | number;
	label: string;
  }  
export interface ISelectedAttributes {
	displayName: string;
	attributeName: string;
	isChecked: boolean;
	value: string;
	condition: string;
	options: IOption[];
	dataType: string;
	schemaName?: string;
	credDefName?: string;
	schemaId?: string;
	credDefId?: string;
	selectedOption: string;
	inputError: string;
	selectError: string;
  }

 export interface IRequestedAttributes {
    name: string;
    restrictions: Array<{
        schema_id: string;
        cred_def_id: string;
    }>;
}
interface IEmailData {
    email: string;
}
export interface IEmailValues {
    emailData: IEmailData[];
}

export interface IPredicate extends IRequestedAttributes {
	p_type: string;
	p_value: number;
}
export interface IRequestedPredicates {
    [key: string]: IPredicate;
}

export interface IAttributesDetails {
    attributeName: string;
    schemaDataType: string;
    displayName: string;
    isRequired: boolean;
}

export interface ISchemaData {
    createDateTime: string;
    name: string;
    version: string;
    attributes: IAttributesDetails[];
    schemaLedgerId: string;
    createdBy: string;
    publisherDid: string;
    orgId: string;
    issuerId: string;
    organizationName: string;
    userName: string;
}

export interface ISchema {
    schemaId: string;
    attributes: IAttributesDetails[];
    issuerId: string;
    createdDate: string;
}
