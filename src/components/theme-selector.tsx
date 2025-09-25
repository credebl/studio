'use client'

import React, { useEffect, useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useThemeConfig } from '@/components/active-theme'

type Theme = {
  name: string
  value: string
}

export function ThemeSelector(): React.JSX.Element {
  const { activeTheme, setActiveTheme } = useThemeConfig()
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    fetch('/api/themes')
      .then((res) => res.json())
      .then((data) => setThemes(data))
      .catch((err) => console.error('Error loading themes:', err))
  }, [])

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
