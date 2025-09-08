import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { EmptyListMessage } from '@/components/EmptyListComponent'
import type { IDataTable } from '../../type/Connections'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { useState } from 'react'

const SortDataTable: React.FC<IDataTable> = ({
  header,
  searchValue,
  data,
  loading,
  onInputChange,
  currentPage,
  onPageChange,
  refresh,
  pageInfo,
  searchSortByValue,
  isPagination,
  isSearch,
  isRefresh,
  isSort,
  isHeader,
  message,
  discription,
  noExtraHeight,
  sortOrder,
  itemPerPage,
}) => {
  const [selectedValue, setSelectedValue] = useState(sortOrder ?? '')

  const handleSortByValues = (event: { target: { value: string } }): void => {
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
  const mul = (nextPage - 2) * (itemPerPage || 10)
  const startItem = mul + 1
  const endItem = Math.min((nextPage - 1) * (itemPerPage || 10), totalItem)

  const sortValues = [
    {
      label: 'Descending',
      value: 'desc',
    },
    { label: 'Ascending', value: 'asc' },
  ]

  let tableRows: React.ReactNode = <></>

  if (loading) {
    tableRows = (
      <tr className="text-center">
        <td colSpan={header.length}>
          <div className="mb-4 flex w-full items-center justify-center text-center">
            <Loader />
          </div>
        </td>
      </tr>
    )
  } else if (data?.length) {
    tableRows = data.map(() =>
      data.map((ele, rowIndex) => (
        <tr
          key={ele.clickId}
          className={`${rowIndex % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
        >
          {ele.data.map((subEle, colIndex) => (
            <td
              key={`${ele.clickId}-${colIndex}`}
              className="p-4 align-middle text-sm font-normal whitespace-nowrap text-gray-900 dark:text-white"
            >
              <div>{subEle.data}</div>
              {subEle.subData}
            </td>
          ))}
        </tr>
      )),
    )
  } else {
    tableRows = (
      <tr className="text-center">
        <td colSpan={header.length}>
          <div className="mx-auto flex h-full w-full items-center justify-center">
            <EmptyListMessage
              message={message}
              description={discription}
              noExtraHeight={noExtraHeight}
            />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <Pagination>
      <section className="w-full bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto">
          <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg dark:bg-gray-800">
            {isHeader && (
              <div className="flex flex-col items-center justify-between space-y-3 p-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-1/2">
                  {isSearch && (
                    <form className="flex items-center">
                      <div className="relative max-w-xs flex-grow">
                        <Input
                          type="text"
                          placeholder="Search . ."
                          value={searchValue}
                          onChange={onInputChange}
                          className="w-full pl-8"
                        />
                        <IconSearch className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                      </div>
                    </form>
                  )}
                </div>

                <div className="flex flex-shrink-0 items-stretch justify-end space-y-2 sm:w-auto sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                  {isRefresh && (
                    <button
                      onClick={refresh}
                      className="bg-white-700 mt-2 mr-4 items-center rounded-lg p-4 focus:z-10 sm:mt-0 sm:mr-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-primary hover:text-primary-950"
                      >
                        <path d="M12 20C9.76667 20 7.875 19.225 6.325 17.675C4.775 16.125 4 14.2333 4 12C4 9.76667 4.775 7.875 6.325 6.325C7.875 4.775 9.76667 4 12 4C13.15 4 14.25 4.2375 15.3 4.7125C16.35 5.1875 17.25 5.86667 18 6.75V4H20V11H13V9H17.2C16.6667 8.06667 15.9375 7.33333 15.0125 6.8C14.0875 6.26667 13.0833 6 12 6C10.3333 6 8.91667 6.58333 7.75 7.75C6.58333 8.91667 6 10.3333 6 12C6 13.6667 6.58333 15.0833 7.75 16.25C8.91667 17.4167 10.3333 18 12 18C13.2833 18 14.4417 17.6333 15.475 16.9C16.5083 16.1667 17.2333 15.2 17.65 14H19.75C19.2833 15.7667 18.3333 17.2083 16.9 18.325C15.4667 19.4417 13.8333 20 12 20Z"></path>
                      </svg>
                    </button>
                  )}

                  {isSort && (
                    <div className="flex w-full items-center space-x-3 sm:w-auto">
                      <select
                        id="small"
                        className="focus:ring-primary-450 focus:border-primary-450 dark:focus:ring-primary-450 dark:focus:border-primary-450 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
                <thead className="bg-gray-50 dark:bg-gray-700">
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
                <tbody className="bg-white dark:bg-gray-800">{tableRows}</tbody>
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
                    Showing{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {startItem}-{endItem}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalItem}
                    </span>
                  </span>
                )}
                {lastPage > 1 && data?.length > 0 && (
                  <div className="items-center">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={() =>
                            currentPage > 1 && onPageChange(currentPage - 1)
                          }
                          className={`bg-primary/50 rounded px-3 py-1 ${
                            currentPage === 1
                              ? 'pointer-events-none cursor-not-allowed opacity-50'
                              : ''
                          }`}
                        />
                      </PaginationItem>
                      {Array.from({ length: lastPage }, (_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            className={` ${currentPage === index + 1 ? 'bg-primary' : 'bg-primary/50'}`}
                            isActive={currentPage === index + 1}
                            onClick={() => onPageChange(index + 1)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            currentPage < lastPage &&
                            onPageChange(currentPage + 1)
                          }
                          aria-disabled={currentPage === lastPage}
                          tabIndex={currentPage === lastPage ? -1 : 0}
                          className="bg-primary/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </div>
                )}
              </nav>
            )}
          </div>
        </div>
      </section>
    </Pagination>
  )
}

export default SortDataTable
