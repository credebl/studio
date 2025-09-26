'use client'

import React, {
  JSX,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const COOKIE_NAME = 'active_theme'
const DEFAULT_THEME = 'credebl'

/** Set the theme in a cookie */
function setThemeCookie(theme: string): void {
  if (typeof window === 'undefined') {
    return
  }
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === 'https:' ? 'Secure;' : ''
  }`
}

/** Get the theme from cookie */
function getThemeFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

/** Load CSS file for the selected theme */
function loadThemeCSS(theme: string): void {
  if (typeof document === 'undefined') {
    return
  }
  const id = 'dynamic-theme-css'
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = `/themes/${theme}_theme.css`
}

export type ThemeContextType = {
  activeTheme: string
  setActiveTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ActiveThemeProviderProps {
  readonly children: ReactNode
  readonly initialTheme?: string
}

export function ActiveThemeProvider({
  children,
  initialTheme,
}: ActiveThemeProviderProps): JSX.Element {
  const envTheme: string | undefined =
    process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim()

  /** Determine initial theme */
  const getInitialTheme = (): string => {
    if (initialTheme) {
      return initialTheme
    }
    const cookieTheme = getThemeFromCookie()
    if (cookieTheme) {
      return cookieTheme
    }
    if (envTheme && envTheme.length > 0) {
      return envTheme
    }
    return DEFAULT_THEME
  }

  const [activeTheme, setActiveTheme] = useState<string>(getInitialTheme)

  useEffect(() => {
    setThemeCookie(activeTheme)
    loadThemeCSS(activeTheme)

    // Remove old theme classes
    Array.from(document.body.classList)
      .filter((className) => className.startsWith('theme-'))
      .forEach((className) => document.body.classList.remove(className))

    document.body.classList.add(`theme-${activeTheme}`)
  }, [activeTheme])

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeConfig must be used within an ActiveThemeProvider')
  }
  return context
}
