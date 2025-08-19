import { IConnectionList } from '../type/Issuance'
import { JSX } from 'react'

interface SelectCheckboxCellProps {
  connection: IConnectionList
  disabled?: boolean
  getIsSelected: () => boolean
  getToggleSelectedHandler: () => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void
  onSelect: (connection: IConnectionList, selected: boolean) => void
}

export const SelectCheckboxCell = ({
  connection,
  disabled = false,
  getIsSelected,
  getToggleSelectedHandler,
  onSelect,
}: SelectCheckboxCellProps): JSX.Element => {
  const isChecked = getIsSelected()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSelect(connection, e.target.checked) // <-- your custom logic
    getToggleSelectedHandler()(e) // <-- TanStack logic
  }

  return (
    <label
      className={`relative flex h-4 w-4 items-center justify-center rounded-sm border ${
        isChecked ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        className="peer absolute h-full w-full opacity-0"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      {isChecked && (
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
    </label>
  )
}
