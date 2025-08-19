'use client'

import {
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

export default function KBar({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const router = useRouter()

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string): void => {
      router.push(url)
    }

    return navItems.flatMap((navItem) => {
      // Only include base action if the navItem has a real URL and is not just a container
      const baseAction =
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

      // Map child items into actions
      const childActions =
        navItem.items?.map((childItem: NavItem) => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          subtitle: `Go to ${childItem.title}`,
          perform: (): void => navigateTo(childItem.url),
        })) ?? []

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions
    })
  }, [router])

  const KBarComponent = ({
    children,
  }: {
    children: React.ReactNode
  }): React.JSX.Element => (
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
  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  )
}
