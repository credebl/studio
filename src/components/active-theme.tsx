'use client'

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const CREDEBL_THEME = 'credebl'
const COOKIE_NAME = 'active_theme'

type ThemeContextType = {
  readonly activeTheme: string
  readonly setActiveTheme: (theme: string) => void
  readonly resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') {
    return
  }
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') {
    return
  }
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export function ActiveThemeProvider({
  children,
}: {
  readonly children: ReactNode
}): React.JSX.Element {
  const envTheme = process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim()
  const defaultTheme =
    envTheme && envTheme.length > 0 ? envTheme : CREDEBL_THEME
  const [activeTheme, setActiveTheme] = useState<string>(defaultTheme)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookie(COOKIE_NAME, activeTheme)
    }

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

  const resetTheme = (): void => {
    clearCookie(COOKIE_NAME)
    setActiveTheme(defaultTheme)
  }

  const themeContextValue = React.useMemo(
    () => ({ activeTheme, setActiveTheme, resetTheme }),
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
