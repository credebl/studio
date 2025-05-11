// components/organization/delete-organization-card.tsx
import { Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import React from 'react'

interface DeleteOrganizationCardProps {
  title?: string
  description?: string
  count?: number
  isDisabled?: boolean
  onDeleteClick: () => void
}

export function DeleteOrganizationCard({
  title,
  description,
  count,
  isDisabled = false,
  onDeleteClick,
}: DeleteOrganizationCardProps) {
  const isButtonDisabled = isDisabled || count === 0

  return (
    <Card
      className={
        isDisabled
          ? 'opacity-75'
          : 'border-border relative h-full w-full cursor-pointer overflow-hidden rounded-xl border p-6 py-4 shadow-xl transition-all transition-transform duration-300'
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>

          <Button
            variant="destructive"
            size="icon"
            onClick={onDeleteClick}
            disabled={isButtonDisabled}
            className={isButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {count !== undefined && (
          <div className="mt-1 flex items-center">
            <span className="text-muted-foreground mr-2 text-sm">Total:</span>
            <Badge variant="secondary">{count}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
