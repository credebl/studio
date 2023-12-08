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
	createdAt: string;
	protocolVersion: string;
	state: string;
	connectionId: string;
	threadId: string;
	autoAcceptProof: string;
	updatedAt: string;
	isVerified?: boolean;
  }

export interface SchemaDetails {
	attribute:string[],
	issuerDid:string,
	createdDate:string
}
  
export interface IProofRrquestDetails {
	openModal: boolean;
	closeModal: (flag: boolean, id: string, state: boolean) => void;
	onSucess: (verifyPresentationId: string) => void;
	requestId: string;
	userData: object[];
	view: boolean;
}
