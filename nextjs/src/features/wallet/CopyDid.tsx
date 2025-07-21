'use client'

import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IProps {
  value: string
  className?: string
  hideValue?: boolean
}

const CopyDid = ({
  value,
  className,
  hideValue,
}: IProps): React.JSX.Element => {
  const [copied, setCopied] = useState(false)

  function copyTextVal(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    e.stopPropagation()

    setCopied(true)
    navigator.clipboard.writeText(value)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex items-center gap-2">
      {!hideValue && (
        <span title={value} className={className}>
          {value}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-6 w-6 shrink-0', hideValue ? 'ml-0' : 'ml-2')}
        onClick={(e) => !copied && copyTextVal(e)}
      >
        {copied ? (
          <Check className="text-success h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export default CopyDid
