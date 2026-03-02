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

interface SearchableSelectProps<T> {
  options: T[]
  getOptionValue: (option: T) => string
  getOptionLabel: (option: T) => string

  value?: string
  onValueChange?: (option: T) => void
  onSearchChange?: (searchValue: string) => void

  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  enableInternalSearch?: boolean
  className?: string
}

export function SelectiveSearchEcosystem<T>({
  options = [],
  value,
  onValueChange,
  getOptionValue,
  getOptionLabel,
  placeholder = 'Select an option',
  emptyMessage = 'No results found.',
  disabled = false,
  onSearchChange,
  enableInternalSearch = true,
  className,
}: SearchableSelectProps<T>): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const wait = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const selected = React.useMemo(
    () => options.find((opt) => getOptionValue(opt) === value),
    [options, value, getOptionValue],
  )

  React.useEffect(() => {
    if (!open) {
      setSearchValue('')
    }
  }, [open])

  const handleSearchChange = (search: string): void => {
    setSearchValue(search)
    if (!enableInternalSearch && onSearchChange) {
      clearTimeout(wait.current)
      wait.current = setTimeout(() => {
        onSearchChange(search)
      }, 500) // Reduced to 500ms for better UX
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
          className={cn('flex w-full items-center justify-between', className)}
        >
          <span className="text-muted-foreground truncate">
            {selected ? getOptionLabel(selected) : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={enableInternalSearch}>
          <CommandInput
            placeholder="Search..."
            value={searchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const val = getOptionValue(option)
                const label = getOptionLabel(option)

                return (
                  <CommandItem
                    key={val}
                    value={label}
                    onSelect={() => {
                      onValueChange?.(option)
                      setOpen(false)
                    }}
                  >
                    <span className="truncate">{label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
