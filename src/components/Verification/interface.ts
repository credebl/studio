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
export interface ISelectedUser {
	name: any;
	condition: string;
	dataType: string;
	displayName: string;
	attributeName: string;
	schemaName?: string;
	schemaId?: string;
	credDefName?: string;
	isChecked: false;
	value: number;
	selectedOption: 'Select';
	inputError: '';
	selectError: '';
	options: [
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