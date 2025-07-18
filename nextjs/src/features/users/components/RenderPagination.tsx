import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const renderPagination = (
  currentPage: number,
  totalPages: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  prevPage: number,
  nextPage: number,
  onPageChange: (page: number) => void,
): React.JSX.Element | null => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-6">
      <Pagination className="mb-4 justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => hasPrevPage && onPageChange(prevPage)}
              className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1
            const isActive = page === currentPage

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  className={
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : ''
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => hasNextPage && onPageChange(nextPage)}
              className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default renderPagination
