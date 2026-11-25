import { Pencil, Trash2 } from 'lucide-react'
import {
  getIssuerDescription,
  getIssuerName,
} from '@/features/oid4vc/utils/lifecycle'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IIssuerListItem } from '@/app/oid4vc/interface/interface'
import { JSX } from 'react'

interface IssuerSummaryCardProps {
  issuer: IIssuerListItem
  onEdit: (issuer: IIssuerListItem) => void
  onDelete: (issuer: IIssuerListItem) => void
}

export default function IssuerSummaryCard({
  issuer,
  onEdit,
  onDelete,
}: IssuerSummaryCardProps): JSX.Element {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h3 className="truncate text-xl font-semibold">
            {getIssuerName(issuer)}
          </h3>
          <p className="text-muted-foreground text-sm">
            {getIssuerDescription(issuer) || 'No description provided'}
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <span className="font-mono break-all">{issuer.publicIssuerId}</span>
            <span className="break-all">{issuer.authorizationServerUrl}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onEdit(issuer)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive gap-1.5"
            onClick={() => onDelete(issuer)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}
