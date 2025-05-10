export interface RequestProof {
  _tags: {
    state: string;
    threadId: string;
    connectionId: string;
  };
  metadata: Record<string, string | number | boolean>;
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

export interface IDashboard { 
    title:string,
    options:IOptions [], 
    backButtonPath :string
}

export interface IOptions {
   type?:string,
   path:string,
   heading:string,
   description:string
}