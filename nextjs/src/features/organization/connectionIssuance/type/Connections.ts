import type { ChangeEvent, JSX } from 'react'

export interface ITableData {
  clickId?: string | null
  data: Data[]
}
export interface ITableHtml {
  clickId?: string
  data: (
    | {
        data: string
        subData?: string
      }
    | {
        data: React.JSX.Element
        subData?: string
      }
  )[]
}

export interface Data {
  handleChange(value: string): void
  inputType: string
  data: string | JSX.Element
  subData?: string
}

export interface IConnectionList {
  theirLabel: string
  connectionId: string
  createDateTime: string
  checked?: boolean
}

export interface TableHeader {
  columnName: string
  subColumnName?: string
  width?: string
}

export interface IDataTable {
  header: TableHeader[]
  searchValue?: string
  data: ITableData[] | ITableHtml[]
  loading: boolean
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  refresh: () => void
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
  searchSortByValue?: (value: string) => void
  isPagination?: boolean
  isSearch: boolean
  isRefresh: boolean
  isSort: boolean
  isHeader: boolean
  message: string
  discription: string
  noExtraHeight?: boolean
  callback?: (clickId: string | null | undefined) => void
  displaySelect?: boolean
  showBtn?: boolean
  pageInfo?: {
    totalItem: number | undefined
    nextPage: number | undefined
    lastPage: number | undefined
  }
  sortOrder?: string
  itemPerPage?: number
}
