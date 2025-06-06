import * as React from 'react'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import Loader from '@/components/Loader'
import { useState } from 'react'

/**
 * Props for the DataTable component.
 *
 * @template TData - The shape of a single row of data.
 * @template TValue - The value type for table columns.
 */
interface DataTableProps<TData, TValue> {
  /**
   * Array of data objects to be rendered as rows.
   */
  data: TData[]

  /**
   * Column definitions for rendering the table.
   */
  columns: ColumnDef<TData, TValue>[]

  /**
   * A key from the TData object used as the unique identifier for rows.
   */
  index: keyof TData

  /**
   * Current page index for pagination (zero-based).
   */
  pageIndex: number

  /**
   * Number of rows per page.
   */
  pageSize: number

  /**
   * Total number of pages available.
   */
  pageCount: number

  /**
   * Place holder for search input.
   */
  placeHolder?: string

  /**
   * Callback triggered when the page index changes.
   */
  onPageChange: (pageIndex: number) => void

  /**
   * Callback triggered when the page size changes.
   */
  onPageSizeChange: (pageSize: number) => void

  /**
   * Callback triggered when the search term changes.
   */
  onSearchTerm: (searchTerm: string) => void

  /**
   * Loading state to show data loading state.
   */
  isLoading?: boolean
}

/**
 * A generic, paginated data table component using TanStack Table.
 *
 * @template {TData} data - The type of each row's data.
 * @template {TValue} columns - The value type associated with columns.
 *
 * @param {Object} props The props for the DataTable component.
 * @param {keyof TData} props.index A unique key from the data object used to identify rows.
 * @param {ColumnDef<TData, TValue>[]} props.columns Definitions for each table column.
 * @param {TData[]} props.data The dataset to render in the table.
 * @param {number} props.pageIndex The current page index (zero-based).
 * @param {number} props.pageSize Number of rows to show per page.
 * @param {number} props.pageCount Total number of pages.
 * @param {(pageIndex: number) => void} props.onPageChange Callback triggered when the page index changes.
 * @param {(pageSize: number) => void} props.onPageSizeChange Callback triggered when the page size changes.
 * @param {(searchTerm: string) => void} props.onSearchTerm Callback triggered when the search term changes.
 *
 * @returns The rendered DataTable component.
 */
export function DataTable<TData, TValue>({
  placeHolder,
  data,
  columns,
  index,
  pageIndex,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  onSearchTerm,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    pageCount,
    getRowId: (row) => String(row[index]),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
      if (newState.pageSize !== pageSize) {
        onPageChange(0)
      } else {
        onPageChange(newState.pageIndex)
      }
      if (pageSize !== newState.pageSize) {
        onPageSizeChange(newState.pageSize)
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchPlaceholder={placeHolder}
        table={table}
        onSearchTermChange={onSearchTerm}
      />
      <div className="overflow-hidden rounded-lg border">
        <Table className="divide-muted">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="p-4"
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  <Loader />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className=""
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="p-4" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
