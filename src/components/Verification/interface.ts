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
