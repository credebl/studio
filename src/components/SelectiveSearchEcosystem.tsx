'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

// 1. Define a generic interface
interface SearchableSelectProps<T> {
  options: T[]
  // How to extract the unique key, label, and value from your object
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
  clearTrigger?: any // Changed from 'clear' boolean to a trigger
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
  clearTrigger,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const wait = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Find the currently selected object based on the 'value' string passed in
  const selected = React.useMemo(() => 
    options.find((opt) => getOptionValue(opt) === value),
    [options, value, getOptionValue]
  )

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) setSearchValue('')
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
          className={cn("flex w-full justify-between items-center", className)}
        >
          <span className="truncate">
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
                    value={label} // Command's internal filtering uses 'value' prop
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