'use client'

import {
  Archive,
  ArchiveRestore,
  Eye,
  MoreVertical,
  Star,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DidActionType } from './DidActionDialog'
import { IDidListData } from '@/features/organization/components/interfaces/organization'
import React from 'react'

interface DidRowActionsProps {
  item: IDidListData
  /** Owners and admins may change DIDs; other roles can only look at them. */
  canManage: boolean
  onDetails: () => void
  onAction: (type: DidActionType) => void
}

/** The actions of one DID in the list: Details, Set Primary DID, Archive or Restore, and Delete. */
export default function DidRowActions({
  item,
  canManage,
  onDetails,
  onAction,
}: DidRowActionsProps): React.JSX.Element {
  const archived = Boolean(item.isArchived)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="DID actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={onDetails}>
          <Eye className="h-4 w-4" />
          Details
        </DropdownMenuItem>

        {canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={item.isPrimaryDid || archived}
              onSelect={() => onAction('primary')}
            >
              <Star className="h-4 w-4" />
              Set as primary DID
            </DropdownMenuItem>
            {archived ? (
              <DropdownMenuItem onSelect={() => onAction('unarchive')}>
                <ArchiveRestore className="h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={item.isPrimaryDid}
                onSelect={() => onAction('archive')}
              >
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={item.isPrimaryDid}
              onSelect={() => onAction('delete')}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
