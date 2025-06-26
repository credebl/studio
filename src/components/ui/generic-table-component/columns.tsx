import { CellContext, ColumnDef } from '@tanstack/react-table'

import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { JSX } from 'react'

export type ColumnActionName = 'hide' | 'sort'

export type SortActions = 'asc' | 'desc'

export type CallbackFunction = (
  order: SortActions,
  data?: any,
) => unknown | Promise<unknown>

export interface ITableMetadata {
  enableSelection: Boolean
  filterCallback?: CallbackFunction
}

type ColumnFunctionality = ColumnActionName | { sortCallBack: CallbackFunction }

export interface IColumnData {
  id: string
  title: string
  accessorKey: string
  columnFunction: ColumnFunctionality[]
  cell?: (cell: CellContext<any, unknown>) => JSX.Element
}

export interface TableStyling {
  metadata: ITableMetadata
  columnData: IColumnData[]
}

export function getColumns<T>(tableStyling: TableStyling): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = []

  if (tableStyling.metadata.enableSelection) {
    columns.push({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    })
  }

  tableStyling.columnData.forEach((columnData) => {
    const hasSort = columnData.columnFunction.some(
      (f) => f === 'sort' || (typeof f === 'object' && 'sortCallBack' in f),
    )

    const hasHide = columnData.columnFunction.some((f) => f === 'hide')

    const sortCallback = columnData.columnFunction.find(
      (f): f is { sortCallBack: CallbackFunction } =>
        typeof f === 'object' && 'sortCallBack' in f,
    )?.sortCallBack

    columns.push({
      accessorKey: columnData.accessorKey,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={columnData.title}
          sortCallBack={sortCallback}
        />
      ),
      cell: (cellContext) =>
        columnData.cell ? (
          columnData.cell(cellContext)
        ) : (
          <div className="flex space-x-2">
            <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
              {cellContext.row.getValue(columnData.id)}
            </span>
          </div>
        ),
      enableSorting: hasSort,
      enableHiding: hasHide,
    })
  })

  return columns
}
