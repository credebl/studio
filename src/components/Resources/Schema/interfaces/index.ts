import type { SchemaTypeValue } from "../../../../common/enums";

export interface GetAllSchemaListParameter {
  itemPerPage: number,
  page: number,
  search: string,
  sortBy: string,
  allSearch: string
}

export interface IAttributes {
  attributeName: string;
  schemaDataType: string;
  displayName: string;
	isRequired?: boolean;
}
export interface Values {
  schemaName: string;
  schemaVersion: string;
  attribute: IAttributes[]
}


type DataItem = {
  createDateTime: string;
  name: string;
  version: string;
  attributes: string[];
  schemaLedgerId: string;
  createdBy: string;
  publisherDid: string;
  orgId: string;
  issuerId: string;
};

export type DataResponse = {
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;
  data: DataItem[];
};

export type PaginationData = {
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;
};

export interface CredDeffFieldNameType {
  tag: string;
  revocable: boolean;
  orgId: string;
  schemaLedgerId: string;
}

export interface FieldName {
  type: string,
  schemaPayload: schemaDetails
  }
export interface schemaDetails {
  schemaName: string;
  schemaVersion: string;
  schemaType?:SchemaTypeValue;
  attributes: IAttributes[];
  description?:string;
  orgId: string;
}

export interface createSchema {
  schemaName: string;
  schemaVersion: string;
  attributes: IAttributes[]
  orgId: string;
}

export interface createCredDeffFieldName {
  tag: string;
  revocable: boolean;
  orgId: string;
  schemaLedgerId: string;
}

export interface IAttributes {
	id?: string;
	attributeName: string;
	schemaDataType: string;
	displayName: string;
	isRequired?: boolean;
}
export interface IFormData {
	schemaName: string;
	schemaVersion: string;
  schemaType?:SchemaTypeValue;
  description?:string;
	attribute: IAttributes[];
}


