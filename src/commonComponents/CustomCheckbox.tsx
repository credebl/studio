import React, { useEffect, useState } from 'react';
import { setToLocalStorage } from '../api/Auth';
import { storageKeys } from '../config/CommonConstant';
import type { ICustomCheckboxProps, ISchemaData } from './interface';

const CustomCheckbox: React.FC<ICustomCheckboxProps> = ({ showCheckbox, isSelectedSchema, isVerificationUsingEmail, onChange, schemaData }) => {
  const [checked, setChecked] = useState<boolean>(false);
  const handleCheckboxChange = async () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onChange(newChecked, schemaData);
  };
  useEffect(() => {
    setChecked(isSelectedSchema);
  }, [isSelectedSchema]);

  return (
    <>
      {showCheckbox && (
        <button
          className={`w-4 h-4 ${isVerificationUsingEmail ? 'flex items-center' : 'absolute bottom-8 right-4'}`}
          onClick={handleCheckboxChange}
          aria-label="Checkbox"
        >          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckboxChange}
            className="hidden"
          />
          <div
            className={`w-full h-full border-2 ${checked ? 'bg-primary-700' : ''}`}
            style={{ borderColor: 'rgb(31 78 173 / var(--tw-bg-opacity))', position: 'relative' }}
          >
            {checked && (
              <svg
                className="absolute top-0 left-0 w-full h-full text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </button>
      )}
    </>
  );
};

export default CustomCheckbox;
