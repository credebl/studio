export const DEFAULT_THEME_ASSET = 'credebl'

/**
 * Themes that ship with this repository. Add a name here together with its
 * `public/themes/<name>_theme.css`, logos and favicon.
 */
export const KNOWN_THEMES: readonly string[] = [DEFAULT_THEME_ASSET]

/**
 * Normalise a configured theme name. Anything that is not a shipped theme,
 * such as a stale NEXT_PUBLIC_ACTIVE_THEME or an old `active_theme` cookie,
 * resolves to the default so the app never asks for assets that do not exist.
 */
export const resolveThemeName = (raw?: string | null): string => {
  const name = raw?.toLowerCase().trim() ?? ''
  const base = name.replace(/-scaled$/, '')
  return KNOWN_THEMES.includes(base) ? name : DEFAULT_THEME_ASSET
}

export const ACTIVE_THEME = resolveThemeName(
  process.env.NEXT_PUBLIC_ACTIVE_THEME,
)

export const themeLogoPath = (theme: string, dark: boolean): string =>
  `/logos/${theme}_logo${dark ? '_dark' : ''}.svg`

export const themeFaviconPath = (theme: string): string =>
  `/favicons/favicon-${theme}.ico`

interface ImageLike {
  src: string
  dataset: DOMStringMap
}

/**
 * Swap a broken image for the default asset, once. Setting `src` to the URL
 * that just failed would fire the error event again and loop forever, so a
 * second failure leaves the image alone.
 */
export const fallbackOnce = (img: ImageLike, fallbackSrc: string): void => {
  if (img.dataset.fallbackApplied === 'true') {
    return
  }
  img.dataset.fallbackApplied = 'true'
  img.src = fallbackSrc
}
