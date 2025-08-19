'use client'

import React, { useEffect } from 'react'

import { CheckIcon } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useThemeConfig } from '@/components/active-theme'

const themes = [
  { name: 'CREDEBL', value: 'credebl' },
  { name: 'SOVIO', value: 'sovio' },
]

export function ThemeSelector(): React.JSX.Element {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  useEffect(() => {
    const updateFaviconAndTitle = (): void => {
      document
        .querySelectorAll("link[rel~='icon']")
        .forEach((el) => el.remove())

      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/x-icon'
      link.href =
        activeTheme === 'sovio' ? '/favicon-sovio.ico' : '/favicon-credebl.ico'
      document.head.appendChild(link)

      document.title =
        activeTheme === 'sovio'
          ? 'SOVIO - Self-Sovereign Identity platform-V2.0.0'
          : 'CREDEBL - Studio'
    }

    updateFaviconAndTitle()
  }, [activeTheme])

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
