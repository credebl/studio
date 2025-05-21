import type { ChangeEvent, JSX } from 'react'

export interface TableHeader {
  columnName: string
  subColumnName?: string
  width?: string
}

export interface Data {
  handleChange?(value: string): void
  inputType?: string
  data: string | JSX.Element
  subData?: string
}
export interface IDataTableData {
  header: TableHeader[]
  searchValue?: string
  data: ITableData[]
  loading: boolean
  onInputChange: (e: ChangeEvent) => void
  isSearch: boolean
  isRefresh: boolean
  isSort: boolean
  isHeader: boolean
  message: string
  refresh: () => void
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
  searchSortByValue?: (value: string) => void
  callback?: (clickId: string | null | undefined) => void
  displaySelect?: boolean
  showBtn?: boolean
  isPagination?: boolean
  discription: string
  noExtraHeight?: boolean
  pageInfo?: {
    totalItem: number | undefined
    nextPage: number | undefined
    lastPage: number | undefined
  }

  sortOrder?: string
  itemPerPage?: number
}
export interface ITableData {
  clickId?: string | null
  data: Data[]
}
