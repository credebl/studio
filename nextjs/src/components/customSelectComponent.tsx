'use client';

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface OptionType {
  value: string;
  label: string;
  schemaAttributes?: { schemaDataType?: string }[];
  attributes?: { schemaDataType?: string }[];
}

interface CustomSelectProps {
  credentialOptions: OptionType[];
  handleInputChange: (newValue: string) => void;
  handleSelectChange: (selectedOption: OptionType | null) => void;
  searchValue: string;
  selectInputRef?: React.Ref<any>;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  credentialOptions,
  handleInputChange,
  handleSelectChange,
  searchValue,
  selectInputRef,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Debounce the search input to prevent excessive updates
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleInputChange(searchTerm);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm, handleInputChange]);

  const filteredOptions = React.useMemo(() => {
    return credentialOptions?.map((option) => ({
      ...option,
      isDisabled: (option.schemaAttributes || option.attributes || []).some(
        (attr) => attr.schemaDataType === "array"
      ),
    })).filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [credentialOptions, searchTerm]);

  const selectedOption = React.useMemo(() => {
    return credentialOptions?.find((option) => option.value === searchValue);
  }, [credentialOptions, searchValue]);

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={selectedOption?.value}
      onValueChange={(value) => {
        const option = credentialOptions.find(opt => opt.value === value);
        handleSelectChange(option || null);
      }}
    >
      <SelectTrigger ref={selectInputRef} className="w-full">
        <SelectValue placeholder="Select Schema-Credential definition">
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="p-0">
        <div className="p-2">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
            onClick={(e) => e.stopPropagation()} // Prevent select from closing when clicking input
          />
        </div>
        <ScrollArea className="h-72">
          <SelectGroup>
            {filteredOptions?.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.isDisabled}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.isDisabled && (
                      <Badge variant="outline" className="ml-2">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectLabel className="text-center py-4 text-muted-foreground">
                No options found
              </SelectLabel>
            )}
          </SelectGroup>
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;