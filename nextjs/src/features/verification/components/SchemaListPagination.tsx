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
}: SchemaListPaginationProps): JSX.Element {
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

        {Array.from({ length: totalItems })
          .map((_, i) => i + 1)
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
              page - (arr[i - 1] as number) > 1
            ) {
              acc.push('...')
            }
            acc.push(page)
            return acc
          }, [])
          .map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="text-muted-foreground px-2"
                >
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
                      page: page as number,
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
