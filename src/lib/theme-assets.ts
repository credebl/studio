export const DEFAULT_THEME_ASSET = 'credebl'

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
