import React from "react";
import Select, { type SingleValue } from "react-select";

interface OptionType {
  value: string;
  label: string;
  schemaAttributes?: { schemaDataType?: string }[];
  attributes?: { schemaDataType?: string }[];
}

interface CustomSelectProps {
  credentialOptions: OptionType[];
  handleInputChange: (newValue: string) => void;
  handleSelectChange: (selectedOption: SingleValue<OptionType>) => void;
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
  return (
    <Select
      id="email-issuance"
      placeholder="Select Schema-Credential definition"
      className="basic-single"
      classNamePrefix="select"
      isDisabled={false}
      isClearable={true}
      isRtl={false}
      isSearchable={true}
      instanceId="long-value-select"
      name="color"
      options={credentialOptions?.map((option) => ({
        ...option,
        isDisabled: (option.schemaAttributes || option.attributes || []).some(
          (attr) => attr.schemaDataType === "array"
        ),
      }))}
      onInputChange={handleInputChange}
      onChange={(selectedOption) => handleSelectChange(selectedOption as SingleValue<OptionType>)}
      value={credentialOptions?.find((option) => option.value === searchValue)}
      ref={selectInputRef}
      styles={{
        control: (base, state) => ({
          ...base,
          border: state.isFocused ? "2px solid #4174DD" : "1px solid #9CA3AF",
          boxShadow: state.isFocused ? "0 0 2px rgba(79, 70, 229, 0.5)" : "none",
          "&:hover": {
            border: "2px solid #4174DD",
          },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#DCE6F9",
        }),
        option: (base, { isFocused, isSelected, isDisabled }) => ({
          ...base,
          backgroundColor: isDisabled
            ? "#E5E7EB"
            : isSelected
            ? "white"
            : isFocused
            ? "#DCE6F9"
            : "white",
          color: isDisabled ? "#9CA3AF" : isSelected ? "#4174DD" : "#1F4EAD",
          cursor: isDisabled ? "not-allowed" : "pointer",
          "&:hover": {
            backgroundColor: isDisabled ? "#E5E7EB" : "#DCE6F9",
          },
        }),
      }}
    />
  );
};

export default CustomSelect;
