import { ChangeEvent, JSX, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'

import { Button } from '@/components/ui/button'
import { EmptyMessage } from '@/components/EmptyMessage'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { cn } from '@/lib/utils'

export interface TableHeader {
  columnName: string
  subColumnName?: string
  width?: string
}

export interface Data {
  id?: string
  handleChange?(value: string): void
  inputType?: string
  data: string | JSX.Element
  subData?: string
}

export interface ITableData {
  clickId: string
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
  callback?: (clickId: string) => void
  displaySelect?: boolean
  showBtn?: boolean
  pageInfo?:
    | {
        totalItem: number
        nextPage: number
        lastPage: number
      }
    | object
  sortOrder?: string
  itemPerPage?: number
}

interface ProofRowProps {
  ele: ITableData
  showBtn?: boolean
  displaySelect?: boolean
  callback?: (clickId: string) => void
}

const ProofRow: React.FC<ProofRowProps> = ({
  ele,
  showBtn,
  displaySelect,
  callback,
}) => {
  const showSelectButton = showBtn && !displaySelect
  const rowClass = Number(ele.clickId) % 2 !== 0 ? 'bg-muted/30' : ''

  return (
    <tr key={ele.clickId} className={rowClass}>
      {ele.data.map((subEle, idx) => (
        <td
          key={subEle.id ?? `${ele.clickId}-${idx}`}
          className="p-4 align-middle text-sm font-normal whitespace-nowrap"
        >
          <div>
            <div>{subEle.data}</div>
            {subEle.subData}
          </div>
        </td>
      ))}
      {showSelectButton && (
        <td>
          <Button
            onClick={() => callback?.(ele.clickId)}
            className="bg-primary hover:bg-primary mt-2 mr-2 mb-2 rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:ring-4 focus:outline-none"
          >
            Select
          </Button>
        </td>
      )}
    </tr>
  )
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
  } = (pageInfo ?? {}) as {
    totalItem?: number
    nextPage?: number
    lastPage?: number
  }

  const startItem = Math.max((nextPage - 2) * (itemPerPage ?? 10) + 1, 1)
  const endItem = Math.min((nextPage - 1) * (itemPerPage ?? 10), totalItem)

  const sortValues = [
    { label: 'Descending', value: 'desc' },
    { label: 'Ascending', value: 'asc' },
  ]

  const renderTableBody = (): JSX.Element[] | JSX.Element => {
    if (loading) {
      return (
        <tr key="loading-row" className="hover:bg-muted/30 text-center">
          <td className="p-2 text-center" colSpan={header.length}>
            <div className="mb-4 flex w-full items-center justify-center text-center">
              <Loader />
            </div>
          </td>
        </tr>
      )
    }

    if (data?.length) {
      return data.map((ele) => (
        <ProofRow
          key={ele.clickId}
          ele={ele}
          showBtn={showBtn}
          displaySelect={displaySelect}
          callback={callback}
        />
      ))
    }

    return (
      <tr key="empty-row" className="text-center">
        <td className="p-2 text-center" colSpan={header.length}>
          <div className="mx-auto flex h-full w-full items-center justify-center">
            <EmptyMessage title={message} description={discription} />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <section className="w-full">
      <div className="mx-auto min-h-80">
        <div className="relative overflow-hidden shadow-md sm:rounded-lg">
          {isHeader && (
            <div className="flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              {isSearch && (
                <form className="mb-4 flex w-full items-center sm:w-1/2">
                  <div className="relative max-w-xs flex-grow">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchValue}
                      onChange={onInputChange}
                      className="w-full pl-8"
                    />
                    <IconSearch className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  </div>
                </form>
              )}

              <div className="flex flex-shrink-0 items-stretch justify-end space-y-2 sm:w-auto sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                {isRefresh && (
                  <button
                    onClick={refresh}
                    className="mt-2 mr-4 rounded-lg focus:z-10 sm:mt-0 sm:mr-0"
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
                      className="block w-full rounded-lg border p-2 text-sm"
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

          <div className="overflow-hidden shadow sm:rounded-lg">
            <table className="divide-muted dark:divide-muted min-w-full divide-y border">
              <thead className="bg-muted dark:bg-muted">
                <tr>
                  {header.map((ele) => (
                    <th
                      key={ele.columnName}
                      scope="col"
                      className={`text-muted-foreground p-4 text-left text-xs font-medium tracking-wider uppercase ${ele.width}`}
                    >
                      <div>{ele.columnName}</div>
                      {ele.subColumnName && (
                        <div className="flex">{ele.subColumnName}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>

          {isPagination && data?.length > 0 && !loading && lastPage > 1 && (
            <nav className="flex w-full flex-col items-center justify-between space-y-2 p-3 sm:flex-row sm:space-y-0">
              <span className="mt-2 text-sm font-normal">
                Showing{' '}
                <span className="font-semibold">
                  {startItem}-{endItem}
                </span>{' '}
                of <span className="font-semibold">{totalItem}</span>
              </span>

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
            </nav>
          )}
        </div>
      </div>
    </section>
  )
}

export default SortDataTable
