'use client'

import * as React from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Option = {
  clear?: boolean
  value: string
  label: string
  id: string
  schemaName: string
  schemaIdentifier?: string
  schemaVersion: string
  schemaId: string
  credentialId: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  clear?: boolean
  onValueChange?: (value: Option) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  onSearchChange?: (searchValue: string) => void
  enableInternalSearch?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  emptyMessage = 'No results found.',
  disabled = false,
  clear = undefined,
  onSearchChange,
  enableInternalSearch = true,
}: SearchableSelectProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option | undefined>(
    value ? options.find((option) => option.id === value) : undefined,
  )
  const [searchValue, setSearchValue] = React.useState('')
  const wait = React.useRef<NodeJS.Timeout>(undefined)
  React.useEffect(() => {
    if (clear !== undefined) {
      setSelected(undefined)
    }
  }, [clear])

  const handleSearchChange = (search: string): void => {
    setSearchValue(search)
    if (!enableInternalSearch) {
      clearTimeout(wait.current)
      wait.current = setTimeout(() => {
        onSearchChange?.(search)
      }, 1000)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="flex min-w-lg justify-between"
        >
          <span className="max-w-md truncate">
            {selected?.label ?? value ?? placeholder}
          </span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[var(--radix-popover-trigger-width)] p-0',
          'bg-popover border-border shadow-md',
        )}
        align="start"
      >
        <Command className="bg-transparent" shouldFilter={enableInternalSearch}>
          <CommandInput
            placeholder="Search..."
            value={searchValue}
            onValueChange={handleSearchChange}
            className={cn(
              'h-9 border-0 bg-transparent',
              'text-foreground placeholder:text-muted-foreground',
              'focus:ring-0 focus:outline-none',
            )}
          />
          <CommandList className="max-h-64">
            <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup className="p-1">
              {(options || []).map((option, index) => (
                <CommandItem
                  key={`${option.schemaIdentifier ?? index}-${option.label}`}
                  value={option.id}
                  onSelect={() => {
                    setSelected(option)
                    setOpen(false)
                    onValueChange?.(option)
                  }}
                  className={cn()}
                  data-selected={selected?.id === option.id}
                >
                  <span className="flex-1 truncate">
                    {option.label}
                    <span className="sr-only"> {option.schemaIdentifier}</span>
                  </span>{' '}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
