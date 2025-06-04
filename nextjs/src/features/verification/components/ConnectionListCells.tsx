'use client'

import { JSX, useEffect, useState } from 'react'

import DateTooltip from '@/components/DateTooltip'
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
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  return (
    <input
      type="checkbox"
      className="h-4 w-4 cursor-pointer rounded"
      checked={isChecked}
      onChange={(e) => {
        const newChecked = e.target.checked
        setIsChecked(newChecked)
        onSelect(connection, newChecked)
      }}
      disabled={disabled}
    />
  )
}
