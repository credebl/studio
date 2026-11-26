import { describe, expect, it } from 'vitest'
import {
  fallbackOnce,
  resolveThemeName,
  themeFaviconPath,
  themeLogoPath,
} from '@/lib/theme-assets'

describe('theme asset paths', () => {
  it('builds light and dark logo paths', () => {
    expect(themeLogoPath('credebl', false)).toBe('/logos/credebl_logo.svg')
    expect(themeLogoPath('credebl', true)).toBe('/logos/credebl_logo_dark.svg')
  })

  it('builds the favicon path', () => {
    expect(themeFaviconPath('credebl')).toBe('/favicons/favicon-credebl.ico')
  })
})

describe('fallbackOnce', () => {
  it('swaps to the fallback on the first failure', () => {
    const img = { src: '/logos/acme_logo_dark.svg', dataset: {} }
    fallbackOnce(img, '/logos/credebl_logo_dark.svg')
    expect(img.src).toBe('/logos/credebl_logo_dark.svg')
  })

  it('does not touch the image again, so a failing fallback cannot loop', () => {
    const img = { src: '/logos/acme_logo_dark.svg', dataset: {} }
    fallbackOnce(img, '/logos/credebl_logo_dark.svg')
    img.src = 'changed'
    fallbackOnce(img, '/logos/credebl_logo_dark.svg')
    expect(img.src).toBe('changed')
  })
})

describe('resolveThemeName', () => {
  it('keeps the shipped theme, ignoring case and spaces', () => {
    expect(resolveThemeName(' CREDEBL ')).toBe('credebl')
    expect(resolveThemeName('credebl-scaled')).toBe('credebl-scaled')
  })

  it('falls back to the default for anything else or nothing', () => {
    expect(resolveThemeName('acme')).toBe('credebl')
    expect(resolveThemeName('')).toBe('credebl')
    expect(resolveThemeName(undefined)).toBe('credebl')
    expect(resolveThemeName(null)).toBe('credebl')
  })
})
