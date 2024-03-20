import type React from "react";
import type { ChangeEvent } from "react";

interface SelectFieldProps {
    id: string;
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: string[] | null;
    error?: string | undefined;
    touched?: boolean | undefined;
  }

const SelectField: React.FC<SelectFieldProps> = ({
    id,
    label,
    name,
    value,
    onChange,
    options,
    error,
    touched,
  }) => {
    return (
      <div className="mb-3 relative" id={id}>
        <label htmlFor={name} className="text-sm font-medium text-gray-900 dark:text-gray-300">
          {label}
          {touched && error && <span className="text-red-500 text-xs">*</span>}
        </label>
        <select
          onChange={onChange}
          value={value}
          id={name}
          name={name}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
        >
          <option value="">{`Select ${label}`}</option>
          {options && options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {touched && error && (
          <span className="absolute botton-0 text-red-500 text-xs">
            {error}
          </span>
        )}
      </div>
    );
  };

  export default SelectField;