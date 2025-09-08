import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { JSX } from 'react'

interface IApiListParameter {
  itemPerPage: number
  page: number
  search: string
  sortBy: string
  sortingOrder: string
  allSearch: string
}

interface ISchemaListPaginationProps {
  readonly schemaListAPIParameter: IApiListParameter
  readonly paginationNumbers: (string | number)[]
  readonly setSchemaListAPIParameter: React.Dispatch<
    React.SetStateAction<IApiListParameter>
  >
  readonly lastPage: number
}

function SchemaListPagination({
  schemaListAPIParameter,
  paginationNumbers,
  setSchemaListAPIParameter,
  lastPage,
}: ISchemaListPaginationProps): JSX.Element {
  return (
    <div className="mt-6 flex justify-end">
      <Pagination className="m-0 w-fit">
        <PaginationContent>
          {schemaListAPIParameter.page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() =>
                  setSchemaListAPIParameter((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
              />
            </PaginationItem>
          )}

          {paginationNumbers.map((page) => (
            <PaginationItem key={page.toString()}>
              {page === '...' ? (
                <span className="text-muted-foreground px-3 py-2">…</span>
              ) : (
                <PaginationLink
                  className={`${
                    page === schemaListAPIParameter.page
                      ? 'bg-primary text-white'
                      : 'bg-background text-muted-foreground'
                  } rounded-lg px-4 py-2`}
                  href="#"
                  onClick={() =>
                    setSchemaListAPIParameter((prev) => ({
                      ...prev,
                      page: page as number,
                    }))
                  }
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {schemaListAPIParameter.page < lastPage && (
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  setSchemaListAPIParameter((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default SchemaListPagination
