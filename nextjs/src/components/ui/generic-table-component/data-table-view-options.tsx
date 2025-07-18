import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip'

import { Button } from '@/components/ui/button'
import { CardTitle } from '../card'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { ToolTipDataForCredDef } from '@/features/dashboard/components/TooltipData'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const hasHideableColumns = table.getAllColumns().some((column) => {
    return (column.columnDef as any)?.enableHiding === true
  })

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {hasHideableColumns && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasHideableColumns ? (
          table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' &&
                column.getCanHide() &&
                (column.columnDef as any)?.enableHiding === true,
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id.length > 10 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>{column.id.slice(0, 10) + '...'}</div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4}>
                        <div>{column.id}</div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  column.id
                )}
              </DropdownMenuCheckboxItem>
            ))
        ) : (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">
            No columns to hide
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
