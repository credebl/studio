'use client'

import React, { useState } from 'react'

interface IProps {
  value: string
  className?: string
  hideValue?: boolean
}

const CopyDid: React.FC<IProps> = ({
  value,
  className = '',
  hideValue = false,
}) => {
  const [copied, setCopied] = useState(false)

  const copyTextVal = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {!hideValue && (
        <span title={value} className={className}>
          {value}
        </span>
      )}
      <button
        type="button"
        className="shrink-0"
        onClick={(e) => !copied && copyTextVal(e)}
        aria-label="Copy DID"
      >
        {copied ? (
          <svg
            className="h-5 w-5 text-[var(--color-green)]"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="green"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path d="M5 12l5 5l10 -10" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-[var(--color-black)] dark:text-[var(--color-white)]"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default CopyDid
