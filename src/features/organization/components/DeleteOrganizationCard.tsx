import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
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
}: Readonly<DeleteOrganizationCardProps>): React.JSX.Element {
  const isButtonDisabled = isDisabled || count === 0

  return (
    <Card
      className={`border-border relative h-full w-full overflow-hidden rounded-xl border p-6 py-4 shadow-xl transition-all transition-transform duration-300 ${
        isDisabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
      }`}
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
            className={
              isButtonDisabled
                ? 'cursor-not-allowed bg-transparent opacity-50 hover:bg-transparent'
                : 'bg-transparent hover:bg-transparent'
            }
          >
            <DeleteIcon />
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
