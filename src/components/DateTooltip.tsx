'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import React from 'react'
import { format } from 'date-fns'

interface DateProps {
  date: string
  id?: string
  children: React.ReactNode
}

const DateTooltip = ({ date, children }: DateProps): React.ReactElement => {
  if (!date) {
    return <>{children}</>
  }

  const updatedDate = new Date(date)
  const formattedDate = format(updatedDate, 'MMM dd, yyyy, h:mm a')

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top">{formattedDate}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default DateTooltip
