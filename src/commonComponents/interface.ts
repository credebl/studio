export interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	message: string;
	isProcessing: boolean;
	success: string | null;
	failure: string | null;
	setFailure: (flag: string | null) => void;
	setSuccess: (flag: string | null) => void;
}


export interface ISchemaCardProps {
	className?: string,
	schemaName: string,
	version: string,
	schemaId: string,
	issuerDid: string,
	attributes: [],
	created: string,
	isClickable?: boolean
	onClickCallback: (schemaId: string, attributes: string[], issuerDid: string, created: string) => void;
	onClickW3cIssue?: (schemaId: string, schemaName: string, version: string, issuerDid: string, attributes: [], created: string) => void;
	limitedAttributes?: boolean
	w3cSchema:boolean
	noLedger:boolean
  }