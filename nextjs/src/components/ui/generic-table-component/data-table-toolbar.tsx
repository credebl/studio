import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'

interface TableFilterOptions {
  name: string
  placeHolder: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  tableFilterOptions?: TableFilterOptions[]
  onSearchTermChange: (term: string) => void
  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  tableFilterOptions,
  onSearchTermChange,
  searchPlaceholder,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    console.log('Inside useEffect')
    const handler = setTimeout(() => {
      console.log('Inside handler')
      onSearchTermChange(localValue)
    }, 1000) // debounce delay in ms i.e. 1 sec for now, we can change this or can even take from a common config file for all other configs as well

    return () => {
      clearTimeout(handler)
    }
  }, [localValue])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value)
          }}
          className="h-8 w-[250px] lg:w-[350px]"
        />
        <div className="flex gap-x-2">
          {tableFilterOptions ? (
            tableFilterOptions.map(
              (filter) =>
                table.getColumn(filter.name) && (
                  <DataTableFacetedFilter
                    key={filter.name}
                    column={table.getColumn(filter.name)!}
                    title={
                      filter.name.charAt(0).toUpperCase() + filter.name.slice(1)
                    }
                    options={filter.options}
                  />
                ),
            )
          ) : (
            <></>
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
