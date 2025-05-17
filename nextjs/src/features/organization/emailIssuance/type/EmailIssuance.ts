import { ICredentials, IEmailCredentialData } from "../../connectionIssuance/type/Issuance";

export interface UserData {
    formData: FormDatum[];
}
interface FromikFormDatum {
  formData: FormDatum[];
  email: string;
  attributes: { name: string; value: string }[];
}
export interface FormDatum {
    email:      string;
    attributes: ICredentialSubjectData[] | Attribute[];
    credentialData?:IEmailCredentialData;
}
export interface Attribute {
    id?:string;
    attributeName:  string;
    schemaDataType: string;
    displayName:    string;
    isRequired:     boolean;
    value:          string;
    name:           string;
}
export interface InnerAttribute{
    value:string;
    name:string;
    isRequired:boolean;
    dataType?: string;

}

export interface TransformedAttribute{
    emailId : string;
    attributes:InnerAttribute []
}

export interface FromDataFromik {
    formData: FromData[]
}

export interface FromData{
    email: string;
    attributes: {
        value: string;
        name: string;
        isRequired: boolean | undefined;
        attributeName: string;
        schemaDataType: string;
        displayName: string;
    }[];
}
// export interface IEmailCredentialData {
//     attributes?: IAttributesData[];
//     credential?: IW3cEmailPayload;
// }
// export interface IW3cEmailPayload {
//     "@context": string[];
//     type: string[];
//     issuer: IIssuerData;
//     issuanceDate: string;
//     credentialSubject: ICredentialSubjectData;
// }




// export interface IEmailCredentialOffer {
//     emailId: string;
//     attributes?: IAttributesData[];
//     credential?: IW3cEmailPayload;
//     options?: IOptionData;
//     issuer?:{id:string};
//     credentialSubject?:Attribute | ICredentialSubjectData;
// }

export interface IAttributesData {
	isRequired: boolean;
	name: string;
	value: string;
	dataType?: string;
}


export interface ICredentialOption {
	id: string
	label: string
	value?: string
    name?: string;
    version?: string;
    type?: string;
    attributes?: IAttributes[];
    schemaLedgerId?: string;
    credentialDefinitionId?: string;
    schemaCredDefName?: string;
    schemaName: string;
    schemaVersion?: string;
    schemaIdentifier?: string;
    schemaAttributes?: IAttributes[];
    credentialDefinition?: string;
}

// export interface IOptionData {
// 	proofType: string;
// 	proofPurpose: string;
// };

// export interface IIssuerData {
// 	id: string;
// }

export interface ICredentialSubjectData {
	id?: string;
	[key: string]: string | number | boolean | null | undefined;
};

// export interface ICredentials {
//     name?: string;
//     version?: string;
//     type?: string;
//     attributes?: IAttributes[];
//     schemaLedgerId?: string;
//     value?: string;
//     label?: string;
//     credentialDefinitionId?: string;
//     schemaCredDefName?: string;
//     schemaName: string;
//     schemaVersion: string;
//     schemaIdentifier: string;
//     schemaAttributes?: IAttributes[];
//     credentialDefinition?: string;
// }

export interface IAttributes {
	attributeName: string
	schemaDataType: string
	displayName: string
	isRequired?: boolean
}
