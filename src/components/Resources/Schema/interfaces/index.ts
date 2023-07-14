import { Pagination } from 'flowbite-react';
export interface GetAllSchemaListParameter {
    itemPerPage: number,
    page: number,
    search: string,
    sortBy: string
}

type DataItem = {
    createDateTime: string;
    name: string;
    version: string;
    attributes: string[];
    schemaLedgerId: string;
    createdBy: number;
    publisherDid: string;
    orgId: number;
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
    orgId: number; 
    schemaLedgerId: string | undefined; 
  }

  export interface FieldName {
  schemaName: string; 
  schemaVersion: string; 
  attributes: string[]; 
  orgId: number; 
}

export interface createSchema {
  schemaName: string;
  schemaVersion: string;
  attributes: string[];
  orgId: number;
}

export interface createCredDeffFieldName {
  tag: string;
  revocable: boolean;
  orgId: number;
  schemaLedgerId: string;
}




