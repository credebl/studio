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
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  emptyMessage = 'No results found.',
  disabled = false,
  clear = undefined,
}: SearchableSelectProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option | undefined>(
    value ? options.find((option) => option.id === value) : undefined,
  )

  React.useEffect(() => {
    if (clear !== undefined) {
      setSelected(undefined)
    }
  }, [clear])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // className={cn(
          //   'w-full justify-between',
          //   'bg-background border-border hover:text-accent-foreground',
          //   'focus:text-accent-foreground focus-visible:ring-ring focus:ring focus-visible:ring-2',
          //   'data-[state=open]:text-accent-foreground',
          //   'transition-colors duration-200',
          //   disabled && 'cursor-not-allowed opacity-50',
          //   className,
          // )}
          disabled={disabled}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
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
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search..."
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
              {options.map((option, index) => (
                <CommandItem
                  key={index}
                  value={option.label}
                  onSelect={() => {
                    setSelected(option)
                    setOpen(false)
                    onValueChange?.(option)
                  }}
                  className={cn(
                    'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm select-none',
                    'text-foreground hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
                    'transition-colors duration-150',
                    'outline-none',
                  )}
                  data-selected={selected?.value === option.value}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {/* {selected?.value === option.value && (
                    <Check className="ml-2 h-4 w-4 flex-shrink-0" />
                  )} */}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
