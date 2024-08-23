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

export interface IAttribute {
    attributeName: string;
    schemaDataType: string;
    displayName: string;
    isRequired: boolean;
}

export interface ISchemaData {
    schemaId: string;
    schemaName: string;
    attributes: IAttribute[];
}

export interface ICustomCheckboxProps {
	showCheckbox: boolean;
	isVerificationUsingEmail?: boolean;
	onChange: (checked: boolean, schemaData?: ISchemaData) => void;
	schemaData?: ISchemaData;
  }  

export interface ISchemaCardProps {
	className?: string;
	schemaName: string;
	version: string;
	schemaId: string;
	issuerDid: string;
	attributes: [];
	created: string;
	isClickable?: boolean;
	showCheckbox?: boolean;
	onClickCallback: (schemaId: string, attributes: string[], issuerDid: string, created: string) => void;

    onClickW3CCallback: (W3CSchemaData: {
		schemaId: string;
		schemaName: string;
		version: string;
		issuerDid: string;
		attributes: [];
		created: string;
	}) => void;
	
	onClickW3cIssue?: (schemaId: string, schemaName: string, version: string, issuerDid: string, attributes: [], created: string) => void;
	onChange?: (checked: boolean, schemaData: ISchemaData[]) => void;
	limitedAttributes?: boolean;
	onSelectionChange?: (selectedSchemas: any[]) => void; 
	w3cSchema?:boolean;
	noLedger?:boolean;
	isVerification?: boolean;
	isVerificationUsingEmail?: boolean;
  }