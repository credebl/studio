import { ChangeEvent, JSX, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'

import { Button } from '@/components/ui/button'
import { EmptyMessage } from '@/components/EmptyMessage'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export interface ITableData {
  clickId?: string | null
  data: Data[]
}

export interface IDataTable {
  header: TableHeader[]
  searchValue?: string
  data: ITableData[]
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
  pageInfo?:
    | {
        totalItem: number | undefined
        nextPage: number | undefined
        lastPage: number | undefined
      }
    | object
  sortOrder?: string
  itemPerPage?: number
}

const SortDataTable: React.FC<IDataTable> = ({
  header,
  searchValue,
  displaySelect,
  data,
  loading,
  callback,
  showBtn,
  onInputChange,
  refresh,
  currentPage,
  onPageChange,
  totalPages,
  pageInfo,
  searchSortByValue,
  isPagination,
  isSearch,
  isRefresh,
  isSort,
  isHeader,
  message,
  discription,
  sortOrder,
  itemPerPage,
}) => {
  const [selectedValue, setSelectedValue] = useState(sortOrder ?? '')

  const handleSortByValues = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const newSelectedValue = event.target.value
    setSelectedValue(newSelectedValue)
    if (searchSortByValue) {
      searchSortByValue(newSelectedValue)
    }
  }

  const {
    totalItem = 0,
    nextPage = 0,
    lastPage = 0,
  } = (pageInfo || {}) as {
    totalItem?: number
    nextPage?: number
    lastPage?: number
  }
  const startItem = (nextPage - 2) * (itemPerPage || 10) + 1
  const endItem = Math.min((nextPage - 1) * (itemPerPage || 10), totalItem)

  const sortValues = [
    {
      label: 'Descending',
      value: 'desc',
    },
    { label: 'Ascending', value: 'asc' },
  ]

  return (
    <section className="w-full bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto min-h-80">
        <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg dark:bg-gray-800">
          {isHeader && (
            <div className="flex flex-col items-center justify-between space-y-3 p-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-1/2">
                {isSearch && (
                  <form className="flex items-center">
                    <input
                      type="hidden"
                      name="_csrf"
                      value={new Date().getTime()}
                    />
                    <div className="relative w-full">
                      <Search
                        className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <Input
                        type="search"
                        id="simple-search"
                        placeholder="Search"
                        className="pl-9"
                        value={searchValue}
                        onChange={onInputChange}
                      />
                    </div>
                  </form>
                )}
              </div>

              <div className="flex flex-shrink-0 items-stretch justify-end space-y-2 sm:w-auto sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                {isRefresh && (
                  <button
                    onClick={refresh}
                    className="bg-white-700 hover:bg-secondary-700 mt-2 mr-4 items-center rounded-lg focus:z-10 sm:mt-0 sm:mr-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 20C9.76667 20 7.875 19.225 6.325 17.675C4.775 16.125 4 14.2333 4 12C4 9.76667 4.775 7.875 6.325 6.325C7.875 4.775 9.76667 4 12 4C13.15 4 14.25 4.2375 15.3 4.7125C16.35 5.1875 17.25 5.86667 18 6.75V4H20V11H13V9H17.2C16.6667 8.06667 15.9375 7.33333 15.0125 6.8C14.0875 6.26667 13.0833 6 12 6C10.3333 6 8.91667 6.58333 7.75 7.75C6.58333 8.91667 6 10.3333 6 12C6 13.6667 6.58333 15.0833 7.75 16.25C8.91667 17.4167 10.3333 18 12 18C13.2833 18 14.4417 17.6333 15.475 16.9C16.5083 16.1667 17.2333 15.2 17.65 14H19.75C19.2833 15.7667 18.3333 17.2083 16.9 18.325C15.4667 19.4417 13.8333 20 12 20Z"
                        fill="#1F4EAD"
                      ></path>
                    </svg>
                  </button>
                )}

                {isSort && (
                  <div className="flex w-full items-center space-x-3 sm:w-auto">
                    <select
                      id="small"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      name="selectedValue"
                      value={selectedValue}
                      onChange={handleSortByValues}
                    >
                      {sortValues.map((sort) => (
                        <option key={sort.value} value={sort.value}>
                          {sort.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  {header &&
                    header.length > 0 &&
                    header.map((ele) => (
                      <th
                        key={ele.columnName}
                        scope="col"
                        className={`p-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-white ${ele.width}`}
                      >
                        <div>{ele.columnName}</div>
                        {ele.subColumnName && (
                          <div className="flex text-gray-500">
                            {ele.subColumnName}{' '}
                          </div>
                        )}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {loading ? (
                  <tr className="text-center">
                    <td
                      className="p-2 text-center text-gray-500"
                      colSpan={header.length}
                    >
                      <div>
                        <div className="mb-4 flex w-full items-center justify-center text-center">
                          <Loader />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : data?.length ? (
                  data?.map((ele, ind) => (
                    <tr
                      key={ind}
                      className={`${
                        ind % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''
                      }`}
                    >
                      {ele.data.map((subEle, ind) => (
                        <td
                          key={ind}
                          className={
                            'p-4 align-middle text-sm font-normal whitespace-nowrap text-gray-900 dark:text-white'
                          }
                        >
                          <div>
                            <div>{subEle.data}</div>
                            {subEle.subData}
                          </div>
                        </td>
                      ))}
                      {displaySelect ||
                        (showBtn && (
                          <Button
                            onClick={() => {
                              if (callback) {
                                callback(ele?.clickId)
                              }
                            }}
                            className="bg-primary hover:bg-primary-800 mt-2 mr-2 mb-2 rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:ring-4 focus:outline-none"
                          >
                            Select
                          </Button>
                        ))}
                    </tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td
                      className="p-2 text-center text-gray-500"
                      colSpan={header.length}
                    >
                      <div className="mx-auto flex h-full w-full items-center justify-center">
                        <EmptyMessage
                          title={message}
                          description={discription}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loading && isPagination && data.length > 0 ? (
            ''
          ) : (
            <nav
              className="flex w-full flex-col items-center justify-between space-y-2 p-3 sm:flex-row sm:space-y-0"
              aria-label="Table navigation"
            >
              {!loading && data?.length > 0 && (
                <span className="mt-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  Showing
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {startItem}-{endItem}{' '}
                  </span>
                  of
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalItem}
                  </span>
                </span>
              )}
              {lastPage > 1 && data?.length > 0 && (
                <Pagination className="flex items-center justify-end">
                  <PaginationContent className="justify-end">
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => {
                          if (currentPage > 1) {
                            onPageChange(currentPage - 1)
                          }
                        }}
                        isActive={false}
                        className="bg-muted text-muted-foreground hover:bg-muted/80 mr-4 cursor-pointer rounded-md px-4 py-2 transition-colors"
                      >
                        Prev
                      </PaginationLink>
                    </PaginationItem>

                    {Array.from({ length: totalPages })
                      .map((_, idx) => idx + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1,
                      )
                      .map((page, index, array) => {
                        const isCurrent = currentPage === page
                        const prevPage = array[index - 1]
                        const showEllipsis = index > 0 && page - prevPage > 1

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="text-muted-foreground px-2">
                                ...
                              </span>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => onPageChange(page)}
                                isActive={isCurrent}
                                className={cn(
                                  'cursor-pointer rounded-md px-4 py-2 transition-colors',
                                  isCurrent
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                )}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        )
                      })}

                    <PaginationItem>
                      <PaginationLink
                        onClick={() => {
                          if (currentPage < totalPages) {
                            onPageChange(currentPage + 1)
                          }
                        }}
                        isActive={false}
                        className="bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer rounded-md px-4 py-2 transition-colors"
                      >
                        Next
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </nav>
          )}
        </div>
      </div>
    </section>
  )
}

export default SortDataTable
