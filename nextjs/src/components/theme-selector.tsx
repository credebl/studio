'use client'

import { CheckIcon } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import React from 'react'
import { useThemeConfig } from '@/components/active-theme'

const themes = [
  { name: 'CREDEBL', value: 'credebl' },
  { name: 'SOVIO', value: 'sovio' },
]

export function ThemeSelector(): React.JSX.Element {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  return (
    <>
      {themes.map((theme) => (
        <DropdownMenuItem
          key={theme.value}
          onClick={() => setActiveTheme(theme.value)}
          className="flex items-center justify-between"
        >
          <span>{theme.name}</span>
          {activeTheme === theme.value && <CheckIcon className="h-4 w-4" />}
        </DropdownMenuItem>
      ))}
    </>
  )
}
