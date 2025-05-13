'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { IconBrightness } from '@tabler/icons-react'
import { useTheme } from 'next-themes'

export function ModeToggle(): React.JSX.Element {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle size-8"
      onClick={toggleTheme}
    >
      <IconBrightness />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
