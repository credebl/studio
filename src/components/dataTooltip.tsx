'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import React from 'react'

interface TooltipProps<Type> {
  data: Type[]
  renderItem: (item: Type) => string
  id?: string
  children: React.ReactNode
}
// Fix this later
// eslint-disable-next-line comma-spacing
const DataTooltip = <Type,>({
  data,
  renderItem,
  children,
}: TooltipProps<Type>): React.JSX.Element => {
  const content = data.map(renderItem).join(', ')

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default DataTooltip
