'use client'

import { JSX, useEffect } from 'react'

export function FaviconUpdater(): JSX.Element | null {
  useEffect(() => {
    const getCookieValue = (name: string): string | undefined => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
      return match?.[2]
    }

    const updateFaviconAndTitle = (): void => {
      const theme = getCookieValue('active_theme') || 'credebl'

      document
        .querySelectorAll("link[rel~='icon']")
        .forEach((el) => el.remove())

      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/x-icon'
      link.href =
        theme === 'sovio' ? '/favicon-sovio.ico' : '/favicon-credebl.ico'
      document.head.appendChild(link)

      document.title =
        theme === 'sovio'
          ? 'SOVIO - Self-Sovereign Identity platform-V2.0.0'
          : 'CREDEBL - Studio'
    }

    updateFaviconAndTitle()

    const handleThemeChange = (): void => {
      updateFaviconAndTitle()
    }

    window.addEventListener('themeChanged', handleThemeChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange)
    }
  }, [])

  return null
}
