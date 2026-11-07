'use client'

import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Status chips use the theme-aware classes from globals.css, so they stay readable in light and dark mode.
export const STATUS_CLASSES = {
  good: 'status-accepted',
  warn: 'status-pending',
  bad: 'status-rejected',
  neutral: 'bg-muted text-muted-foreground',
} as const

export const StatusPill = ({
  tone,
  children,
}: {
  tone: keyof typeof STATUS_CLASSES
  children: React.ReactNode
}): React.JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      STATUS_CLASSES[tone],
    )}
  >
    {children}
  </span>
)

export const CopyValue = ({
  value,
  mono = true,
}: {
  value: string
  mono?: boolean
}): React.JSX.Element => {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-start gap-2">
      <span className={cn('min-w-0 break-all', mono && 'font-mono text-sm')}>
        {value}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            aria-label="Copy to clipboard"
            onClick={() => {
              navigator.clipboard
                .writeText(value)
                .then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                })
                .catch((error) =>
                  console.error('could not copy to clipboard', error),
                )
            }}
          >
            {copied ? (
              <Check className="text-success h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export const Detail = ({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: React.ReactNode
}): React.JSX.Element => (
  <div
    className={cn('min-w-0 space-y-1', wide && 'sm:col-span-2 lg:col-span-3')}
  >
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className="text-sm font-medium">{children}</dd>
  </div>
)
