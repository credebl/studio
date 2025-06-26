'use client'

import React, { useEffect, useState } from 'react'

import { ICustomCheckboxProps } from '@/common/interface'

const CustomCheckbox: React.FC<ICustomCheckboxProps> = ({
  showCheckbox,
  isSelectedSchema,
  isVerificationUsingEmail,
  onChange,
  schemaData,
}) => {
  const [checked, setChecked] = useState<boolean>(false)
  const handleCheckboxChange = async (): Promise<void> => {
    const newChecked = !checked
    setChecked(newChecked)
    onChange(newChecked, schemaData)
  }
  useEffect(() => {
    setChecked(isSelectedSchema)
  }, [isSelectedSchema])

  return (
    <>
      {showCheckbox && (
        <button
          className={`h-4 w-4 ${isVerificationUsingEmail ? 'flex items-center' : 'absolute right-4 bottom-8'}`}
          onClick={handleCheckboxChange}
          aria-label="Checkbox"
        >
          {' '}
          <input
            type="checkbox"
            checked={Boolean(checked)}
            onChange={handleCheckboxChange}
            className="hidden"
          />
          <div
            className={`h-full w-full border ${checked ? 'bg-primary' : ''}`}
            style={{
              borderColor: 'rgb(31 78 173 / var(--tw-bg-opacity))',
              position: 'relative',
            }}
          >
            {checked && (
              <svg
                className="text-primary-foreground absolute top-0 left-0 h-full w-full"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
  )
}

export default CustomCheckbox
