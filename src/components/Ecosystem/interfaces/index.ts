import type { IAttributes } from '../../Resources/Schema/interfaces';

export interface IEcosystem {
    id: string
    name: string
    description: string
    logoUrl: string
    joinedDate?: string
    role?: string
    autoEndorsement:boolean
    ecosystemOrgs?: {
        ecosystemRole: {
            name: string
        }
    }[]
}

export interface Ecosystem {
    id: string
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    lastChangedBy: string
    autoEndorsement:boolean
    name: string
    description: string
    logoUrl: string
    website: string
    roles: string[] 
    logoFile:string
}

export interface EditEntityModalProps {
	openModal: boolean;
	setMessage: (message: string) => void;
	setOpenModal: (flag: boolean) => void;
	onEditSuccess?: () => void;
	entityData: Ecosystem | null;
	isOrganization: boolean;
}

export interface EditEntityValues {
	name: string;
	description: string;
}

export interface ILogoImage {
	logoFile: string | File;
	imagePreviewUrl: string | ArrayBuffer | null | File;
	fileName: string;
}

export interface ISelectedRequest {
	attribute: IAttributes[];
	issuerDid: string;
	createdDate: string;
	schemaId: string;
}

export interface IEndorsementList {
	id: string;
	endorserDid: string;
	authorDid: string;
	status: string;
	type: string;
	ecosystemOrgs: {
		orgId: string;
	};
	requestPayload: string;
	responsePayload: string;
	createDateTime: string;
}

export interface EndorsementInterface {
  getEndorsementListData: () => void;
}
