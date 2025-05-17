"use client"

import * as React from "react"

import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IAttribute } from "@/common/interface"
import { ICredentialOption } from "@/features/organization/emailIssuance/type/EmailIssuance"

export type Option = {
	value: string
	label: string
	id: string
	schemaName: string
	schemaVersion?: string
	schemaId?: string
	credentialId?: string
	schemaIdentifier?:string
}

export type OptionBulk = {
	value: string
	label: string
	id: string
	schemaName?: string
	schemaVersion?: string
	credentiaDefinitionId?: string
	credentiaDefinition?: string
	schemaIdentifier?: string,
	schemaAttributes?: IAttribute[]
}

interface SearchableSelectProps<T extends BaseOption = Option> {
	options: Option[] | OptionBulk | T[]
	value?: string
	onValueChange?: (value: Option | ICredentialOption) => void
	placeholder?: string
	emptyMessage?: string
	className?: string
	disabled?: boolean
}
export interface BaseOption {
	id?: string
	label?: string
	value?: string
}

export function SearchableSelect<T extends BaseOption = Option>({
	options,
	value,
	onValueChange,
	placeholder = "Select an option",
	emptyMessage = "No results found.",
	className,
	disabled = false,
}: Readonly<SearchableSelectProps<T>>) {
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
						"bg-popover/60 focus:bg-popover focus-visible:bg-popover",
						"data-[state=open]:secondary-foreground",
						className,
					)}
					disabled={disabled}
				>
					{selected ? selected.label : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
				<Command className="bg-popover">
					<CommandInput placeholder="Search..." className="h-9 text-accent-foreground" />
					<CommandList>
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup className="max-h-64 overflow-auto">
							{options && options.map((option, index) => (
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
										"aria-selected:bg-primary/60 aria-selected:text-accent-foreground",
										"data-[selected=true]:foreground data-[selected=true]:text-accent-foreground",
									)}
									data-selected={selected?.value === option.value}
								>
									{option.label}
									{selected?.value === option.value && <Check className="ml-auto h-4 w-4 text-accent-foreground" />}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
