'use client'

import DateTooltip from '@/components/DateTooltip'
import { JSX } from 'react'
import { dateConversion } from '@/utils/DateConversion'

export interface IConnectionList {
  connectionId: string
  theirLabel: string
  createDateTime: string
  checked?: boolean
}

export const ConnectionIdCell = ({
  connectionId,
}: {
  connectionId: string
}): JSX.Element => (
  <span className="text-muted-foreground text-sm">
    {connectionId ?? 'Not Available'}
  </span>
)

export const TheirLabelCell = ({ label }: { label: string }): JSX.Element => (
  <span className="text-muted-foreground text-sm">
    {label ?? 'Not Available'}
  </span>
)

export const CreatedOnCell = ({ date }: { date: string }): JSX.Element => {
  const safeDate = date || new Date().toISOString()
  return (
    <DateTooltip date={safeDate}>
      <span className="text-muted-foreground text-sm">
        {dateConversion(safeDate)}
      </span>
    </DateTooltip>
  )
}

interface SelectCheckboxCellProps {
  connection: IConnectionList
  checked: boolean
  onSelect: (connection: IConnectionList, checked: boolean) => void
  disabled?: boolean
}

export const SelectCheckboxCell = ({
  connection,
  checked,
  onSelect,
  disabled = false,
}: SelectCheckboxCellProps): JSX.Element => {
  const handleCheckboxChange = (): void => {
    if (disabled) {
      return
    }
    onSelect(connection, !checked)
  }

  return (
    <button
      type="button"
      onClick={handleCheckboxChange}
      aria-label="Checkbox"
      className={`flex h-4 w-4 items-center justify-center ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onSelect(connection, e.target.checked)}
        className="hidden"
        disabled={disabled}
      />
      <div
        className={`h-full w-full border ${
          checked ? 'bg-primary' : 'bg-transparent'
        }`}
        style={{
          borderColor: 'rgb(31 78 173 / var(--tw-bg-opacity))',
          position: 'relative',
        }}
      >
        {checked && (
          <svg
            className="text-primary-foreground absolute inset-0 h-full w-full"
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
  )
}
