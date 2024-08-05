import React, { useState } from 'react';

interface CustomCheckboxProps {
  showCheckbox: boolean;
  isVerificationUsingEmail?: boolean;
  onChange: (checked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ showCheckbox, isVerificationUsingEmail, onChange }) => {
  console.log('in customChecjkbox')
  const [checked, setChecked] = useState<boolean>(false);

  const handleCheckboxChange = () => {
        const newChecked = !checked;
        setChecked(newChecked);
        onChange(newChecked);
    };

  return (
    <>
      {showCheckbox && (
        <div
        className={`w-4 h-4 ${isVerificationUsingEmail ? 'flex items-center cursor-pointer' : 'absolute bottom-8 right-4 cursor-pointer'}`}
        onClick={handleCheckboxChange}
      >
          <input
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
        </div>
      )}
    </>
  );
};

export default CustomCheckbox;
