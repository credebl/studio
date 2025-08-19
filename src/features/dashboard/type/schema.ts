export interface GetAllSchemaListParameter {
  itemPerPage?: number
  page?: number
  search?: string
  sortBy?: string
  allSearch?: string
}

export interface CreateCredDeffFieldName {
  tag: string
  revocable: boolean
  orgId: string
  schemaLedgerId: string
}
