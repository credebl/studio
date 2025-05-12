'use client'
import { ICustomCheckboxProps } from '@/common/interface'
import React, { useEffect, useState } from 'react'

const CustomCheckbox: React.FC<ICustomCheckboxProps> = ({
  showCheckbox,
  isSelectedSchema,
  isVerificationUsingEmail,
  onChange,
  schemaData,
}) => {
  const [checked, setChecked] = useState<boolean>(false)
  const handleCheckboxChange = async () => {
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
            checked={checked}
            onChange={handleCheckboxChange}
            className="hidden"
          />
          <div
            className={`h-full w-full border-2 ${checked ? 'bg-primary-700' : ''}`}
            style={{
              borderColor: 'rgb(31 78 173 / var(--tw-bg-opacity))',
              position: 'relative',
            }}
          >
            {checked && (
              <svg
                className="absolute top-0 left-0 h-full w-full text-[var(--color-white)]"
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
  )
}

export default CustomCheckbox
