'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Info } from 'lucide-react'
import { JSX } from 'react'

interface TooltipInfoProps {
  text: string
}

const TooltipInfo = ({ text }: TooltipInfoProps): JSX.Element => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="bg-background absolute top-3 right-3 cursor-pointer rounded-full p-1 shadow">
          <Info className="text-muted-foreground h-4 w-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export default TooltipInfo
