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
  title: string;
  options: IOptions[];
  backButtonPath: string;
}

export interface IOptions {
  type?: string;
  path: string | null;
  heading: string;
  description: string;
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
  schemaId?: string;
}

export interface ISchema {
  schemaId: string;
  attributes: IAttributesDetails[];
  issuerId: string;
  createdDate: string;

  schemaLedgerId?: string;
  createDateTime?: string;
  name?: string;
  version?: string;
  createdBy?: string;
  publisherDid?: string;
  orgId?: string;
  organizationName?: string;
  userName?: string;
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

interface IEmailData {
  email: string;
}
export interface IEmailValues {
  emailData: IEmailData[];
}
export interface IRequestedAttributes {
  name: string;
  restrictions: Array<{
    schema_id: string;
    cred_def_id: string;
  }>;
}
export interface IPredicate extends IRequestedAttributes {
  p_type: string;
  p_value: number;
}

export interface IConnectionList {
  theirLabel: string;
  connectionId: string;
  createDateTime: string;
  checked?: boolean;
}
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

export interface SelectedUsers {
  userName: string | JSX.Element;
  connectionId: string | JSX.Element;
}

export interface ITableHtml {
  clickId?: string;
  data: (
    | {
        data: string;
        subData?: string;
      }
    | {
        data: React.JSX.Element;
        subData?: string;
      }
  )[];
}

export interface ISchemaAttributeData {
  schemaId: string;
  attributes: IAttributesDetails[];
}

export interface IW3CSchemaAttributeItem {
  schemaId: string;
  schemaName: string;
  attributes: IAttributesDetails[];
}

export type LocalOrgs = {
  connectionId: string;
  theirLabel: string;
  createDateTime: string;
};