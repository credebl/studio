import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ISelectSchema } from '../../emailIssuance/type/EmailIssuance'
import React from 'react'

function SchemaSelectBulk({
  allSchema,
  handleFilterChange,
  optionsWithDefault,
}: ISelectSchema): React.JSX.Element {
  return (
    <div>
      <p className="pb-6 text-xl font-semibold opacity-0">Schema Filter</p>
      <Select
        defaultValue={"Organization's schema"}
        value={allSchema ? 'All schemas' : "Organization's schema"}
        onValueChange={handleFilterChange}
      >
        <SelectTrigger className="min-w-lg rounded-lg border p-2.5 text-sm">
          <SelectValue placeholder="Select schema type" />
        </SelectTrigger>
        <SelectContent>
          {optionsWithDefault.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default SchemaSelectBulk
