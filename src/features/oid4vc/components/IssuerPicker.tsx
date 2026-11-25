import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { IIssuerListItem } from '@/app/oid4vc/interface/interface'
import { JSX } from 'react'
import { getIssuerName } from '@/features/oid4vc/utils/lifecycle'

interface IssuerPickerProps {
  issuers: IIssuerListItem[]
  selectedIssuerId: string
  onSelect: (issuerId: string) => void
}

export default function IssuerPicker({
  issuers,
  selectedIssuerId,
  onSelect,
}: IssuerPickerProps): JSX.Element {
  return (
    <Card className="h-fit p-3">
      <p className="text-muted-foreground px-2 py-2 text-xs font-semibold tracking-wide uppercase">
        Issuers ({issuers.length})
      </p>
      <div className="space-y-1">
        {issuers.map((issuer) => {
          const active = issuer.id === selectedIssuerId
          return (
            <div
              key={issuer.id}
              role="button"
              tabIndex={0}
              className={`cursor-pointer rounded-md border p-3 text-left transition-colors ${
                active
                  ? 'bg-accent border-primary'
                  : 'hover:bg-muted border-transparent'
              }`}
              onClick={() => onSelect(issuer.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onSelect(issuer.id)
                }
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {getIssuerName(issuer)}
                </p>
                {issuer.isPrimary && <Badge variant="secondary">Primary</Badge>}
              </div>
              <p className="text-muted-foreground mt-1 truncate font-mono text-[11px]">
                {issuer.publicIssuerId}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
