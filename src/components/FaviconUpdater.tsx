'use client'

import { ACTIVE_THEME, themeFaviconPath } from '@/lib/theme-assets'
import { JSX, useEffect } from 'react'

const APP_ENV = ACTIVE_THEME
const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE?.trim()

const DEFAULT_CONFIG = {
  favicon: themeFaviconPath(APP_ENV),
  title: APP_TITLE ? APP_TITLE : 'CREDEBL - Studio',
}

export function FaviconUpdater(): JSX.Element | null {
  useEffect(() => {
    const updateFaviconAndTitle = (): void => {
      // Pick config from map or fallback
      const { favicon, title } = DEFAULT_CONFIG

      document
        .querySelectorAll("link[rel~='icon']")
        .forEach((el) => el.remove())

      // Add new favicon
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/x-icon'
      link.href = favicon
      document.head.appendChild(link)

      document.title = title
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
