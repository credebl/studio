"use client"

import * as React from "react"

import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Option = {
	value: string
	label: string
	id: string
	schemaName:string
	schemaVersion:string
	schemaId:string
	credentialId:string
  }

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onValueChange?: (value:Option) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option | undefined>(
    value ? options.find((option) => option.id === value) : undefined,
  )

  React.useEffect(() => {
    if (value) {
      setSelected(options.find((option) => option.id === value))
    }
  }, [value, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            "border-yellow-300 focus:ring-yellow-500 focus-visible:ring-yellow-500",
            "data-[state=open]:border-yellow-500",
            className,
          )}
          disabled={disabled}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command className="bg-white">
          <CommandInput placeholder="Search..." className="h-9 text-yellow-900" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option,index) => (
                <CommandItem
                  key={index}
                  value={option.label}
                  onSelect={() => {
                    setSelected(option)
                    setOpen(false)
                    onValueChange?.(option)
                  }}
                  className={cn(
                    "cursor-pointer",
                    "aria-selected:bg-yellow-100 aria-selected:text-yellow-900",
                    "data-[selected=true]:bg-yellow-100 data-[selected=true]:text-yellow-900",
                  )}
                  data-selected={selected?.value === option.value}
                >
                  {option.label}
                  {selected?.value === option.value && <Check className="ml-auto h-4 w-4 text-yellow-600" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
