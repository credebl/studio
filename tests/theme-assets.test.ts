import { describe, expect, it } from 'vitest'
import {
  fallbackOnce,
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
    const img = { src: '/logos/sovio_logo_dark.svg', dataset: {} }
    fallbackOnce(img, '/logos/credebl_logo_dark.svg')
    expect(img.src).toBe('/logos/credebl_logo_dark.svg')
  })

  it('does not touch the image again, so a failing fallback cannot loop', () => {
    const img = { src: '/logos/sovio_logo_dark.svg', dataset: {} }
    fallbackOnce(img, '/logos/credebl_logo_dark.svg')
    img.src = 'changed'
    fallbackOnce(img, '/logos/credebl_logo_dark.svg')
    expect(img.src).toBe('changed')
  })
})
