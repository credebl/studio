'use client'

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const COOKIE_NAME = 'active_theme'
const CREDEBL_THEME = 'credebl'

function setThemeCookie(theme: string): void {
  if (typeof window === 'undefined') {
    return
  }
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === 'https:' ? 'Secure;' : ''
  }`
}

function getThemeFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

type ThemeContextType = {
  readonly activeTheme: string
  readonly setActiveTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ActiveThemeProvider({
  children,
}: {
  readonly children: ReactNode
}): React.JSX.Element {
  const envTheme = process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim()

  const [activeTheme, setActiveTheme] = useState<string>(
    () =>
      // Priority: cookie → env → default
      getThemeFromCookie() ||
      (envTheme && envTheme.length > 0 ? envTheme : CREDEBL_THEME),
  )

  useEffect(() => {
    setThemeCookie(activeTheme)

    // Remove previous theme classes
    Array.from(document.body.classList)
      .filter((className) => className.startsWith('theme-'))
      .forEach((className) => document.body.classList.remove(className))

    // Apply active theme
    document.body.classList.add(`theme-${activeTheme}`)
    if (activeTheme.endsWith('-scaled')) {
      document.body.classList.add('theme-scaled')
    }
  }, [activeTheme])

  const themeContextValue = React.useMemo(
    () => ({ activeTheme, setActiveTheme }),
    [activeTheme],
  )

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeConfig must be used within an ActiveThemeProvider')
  }
  return context
}
