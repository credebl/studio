'use client'

import {
  Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from 'kbar'
import React, { useMemo } from 'react'

import { NavItem } from '../../../types'
import RenderResults from './render-result'
import { navItems } from '@/constants/data'
import { useRouter } from 'next/navigation'

/**
 * Helper to generate navigation actions
 */
function createActions(router: ReturnType<typeof useRouter>): Action[] {
  const navigateTo = (url: string): void => {
    router.push(url)
  }

  return navItems.flatMap((navItem) => {
    const baseAction: Action | null =
      navItem.url !== '#'
        ? {
            id: `${navItem.title.toLowerCase()}Action`,
            name: navItem.title,
            shortcut: navItem.shortcut,
            keywords: navItem.title.toLowerCase(),
            section: 'Navigation',
            subtitle: `Go to ${navItem.title}`,
            perform: (): void => navigateTo(navItem.url),
          }
        : null

    const childActions: Action[] =
      navItem.items?.map(
        (childItem: NavItem): Action => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          subtitle: `Go to ${childItem.title}`,
          perform: (): void => navigateTo(childItem.url),
        }),
      ) ?? []

    return baseAction ? [baseAction, ...childActions] : childActions
  })
}

/**
 * Separate component for KBar UI
 */
function KBarComponent({
  children,
}: {
  readonly children: React.ReactNode
}): React.JSX.Element {
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm">
          <KBarAnimator className="bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg shadow-lg">
            <div className="bg-card sticky top-0 z-10">
              <KBarSearch className="bg-card w-full px-6 py-4 outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden" />
            </div>
            <div className="max-h-[400px]">
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  )
}

export default function KBar({
  children,
}: {
  readonly children: React.ReactNode
}): React.JSX.Element {
  const router = useRouter()
  const actions = useMemo(() => createActions(router), [router])

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  )
}
