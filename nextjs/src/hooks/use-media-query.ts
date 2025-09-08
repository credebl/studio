import { useEffect, useState } from 'react'

export function useMediaQuery() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    setIsOpen(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent): void => {
      setIsOpen(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return (): void => mediaQuery.removeEventListener('change', handler)
  }, [])

  return { isOpen }
}
