import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { JSX } from 'react'

import { SchemaListPaginationProps } from '../type/interface'

function SchemaListPagination({
  schemasListParameter,
  setSchemasListParameter,
  totalItems,
}: Readonly<SchemaListPaginationProps>): JSX.Element {
  const pages = Array.from({ length: totalItems }, (_, i) => i + 1)
    .filter(
      (page) =>
        page === 1 ||
        page === totalItems ||
        Math.abs(page - schemasListParameter.page) <= 1,
    )
    .reduce<(number | string)[]>((acc, page, i, arr) => {
      if (
        i > 0 &&
        typeof page === 'number' &&
        typeof arr[i - 1] === 'number' &&
        page - arr[i - 1] > 1
      ) {
        acc.push(`ellipsis-${arr[i - 1]}-${page}`)
      }
      acc.push(page)
      return acc
    }, [])

  return (
    <Pagination>
      <PaginationContent>
        {schemasListParameter.page > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setSchemasListParameter((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }}
            />
          </PaginationItem>
        )}

        {pages.map((page) => {
          if (typeof page === 'string') {
            return (
              <span key={page} className="text-muted-foreground px-2">
                ...
              </span>
            )
          }
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setSchemasListParameter((prev) => ({
                    ...prev,
                    page,
                  }))
                }}
                className={`rounded-lg px-4 py-2 ${
                  schemasListParameter.page === page
                    ? 'bg-primary text-[var(--color-white)]'
                    : 'bg-background text-muted-foreground'
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {schemasListParameter.page < totalItems && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setSchemasListParameter((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}

export default SchemaListPagination
