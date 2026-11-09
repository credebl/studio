'use client'

import { buildDidWebIdentifier, didWebToUrl } from '@/lib/did'
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
}: SetDomainValueInputProps): React.JSX.Element => {
  const parts = buildDidWebIdentifier(domainValue, pathValue)
  const did = parts.ok ? `did:web:${parts.identifier}` : null
  const hostedAt = didWebToUrl(did)

  return (
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
          The folders on your domain that hold did.json. Leave empty to host it
          at the domain root.
        </p>
      </div>

      {did && hostedAt && (
        <div className="border-border bg-secondary space-y-1 rounded-lg border p-3 text-sm">
          <p>
            <span className="text-muted-foreground">DID: </span>
            <span className="font-mono break-all">{did}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Host did.json at: </span>
            <span className="font-mono break-all">{hostedAt}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default SetDomainValueInput
