'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { cn } from '@/lib/utils'

interface SetDomainValueInputProps {
  domainValue: string
  setDomainValue: (value: string) => void
  domainError?: string | null
}

const SetDomainValueInput = ({ 
  domainValue, 
  setDomainValue, 
  domainError 
}: SetDomainValueInputProps): React.JSX.Element => {
  return (
    <div className="relative mb-3">
      <div className="flex pb-4 pt-4">
        <Label htmlFor="domainValue">Enter Domain</Label>
        <span className="text-destructive text-xs">*</span>
      </div>

      <Input
        id="domainValue"
        value={domainValue}
        onChange={(e) => setDomainValue(e.target.value)}
        placeholder="Please enter domain"
        className={cn(
          'block h-11 w-full truncate rounded-lg p-2.5 text-sm', 
          domainError ? 'border-destructive' : ''
        )}
      />

      {domainError && (
        <span className="text-destructive text-xs mt-1 block">
          {domainError}
        </span>
      )}
    </div>
  )
}

export default SetDomainValueInput