'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'
import { useTheme } from 'next-themes'

type ThemeChoice = 'light' | 'dark' | 'system'

const OPTIONS: {
  value: ThemeChoice
  label: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

/**
 * Light / dark / system switcher for the bottom of the sidebar. It shows all three options while the sidebar is
 * expanded and a single button that cycles through them when the sidebar is collapsed to icons.
 */
export default function ThemeSwitcher(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const { state, isMobile } = useSidebar()
  const [mounted, setMounted] = useState(false)

  // The saved theme is only known in the browser, so render nothing selected until then to avoid a hydration mismatch.
  useEffect(() => setMounted(true), [])

  const active: ThemeChoice | undefined = mounted
    ? ((theme as ThemeChoice | undefined) ?? 'system')
    : undefined
  const collapsed = state === 'collapsed' && !isMobile

  if (collapsed) {
    const current = OPTIONS.find((option) => option.value === active)
    const next = OPTIONS[(OPTIONS.indexOf(current ?? OPTIONS[2]) + 1) % 3]
    const CurrentIcon = (current ?? OPTIONS[2]).Icon

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto size-8"
            onClick={() => setTheme(next.value)}
            aria-label={`Theme: ${current?.label ?? 'System'}. Switch to ${next.label}`}
          >
            <CurrentIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Theme: {current?.label ?? 'System'} (click for {next.label})
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="bg-muted flex w-full gap-1 rounded-lg p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              'focus-visible:ring-ring flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
              selected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
