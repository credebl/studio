'use client'

import DidWebPreview from './DidWebPreview'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { cn } from '@/lib/utils'

interface SetDomainValueInputProps {
  domainValue: string
  setDomainValue: (value: string) => void
  pathValue: string
  setPathValue: (value: string) => void
  domainError?: string | null
}

const SetDomainValueInput = ({
  domainValue,
  setDomainValue,
  pathValue,
  setPathValue,
  domainError,
}: SetDomainValueInputProps): React.JSX.Element => (
  <div className="relative mb-3 space-y-4">
    <div>
      <div className="flex pt-4 pb-2">
        <Label htmlFor="domainValue">Enter Domain</Label>
        <span className="text-destructive text-xs">*</span>
      </div>
      <Input
        id="domainValue"
        value={domainValue}
        onChange={(e) => setDomainValue(e.target.value)}
        placeholder="example.com"
        className={cn(
          'block h-11 w-full truncate rounded-lg p-2.5 text-sm',
          domainError ? 'border-destructive' : '',
        )}
      />
      {domainError && (
        <span className="text-destructive mt-1 block text-xs">
          {domainError}
        </span>
      )}
    </div>

    <div>
      <Label htmlFor="pathValue" className="pb-2">
        Path (optional)
      </Label>
      <Input
        id="pathValue"
        value={pathValue}
        onChange={(e) => setPathValue(e.target.value)}
        placeholder="folder/sub-folder, e.g. iec/0522012345"
        className="block h-11 w-full truncate rounded-lg p-2.5 text-sm"
      />
      <p className="text-muted-foreground mt-1 text-xs">
        The folders on your domain that hold did.json. Leave empty to host it at
        the domain root.
      </p>
    </div>

    <DidWebPreview domain={domainValue} path={pathValue} />
  </div>
)

export default SetDomainValueInput
