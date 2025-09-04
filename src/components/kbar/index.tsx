'use client'

import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from 'kbar'
import React, { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { NavItem } from '../../../types'
import RenderResults from './render-result'
import { navItems } from '@/constants/data'

export type KBarAction = {
  id: string
  name: string
  shortcut?: [string, string] // use `?` instead of `| undefined`
  keywords: string
  section: string
  subtitle: string
  perform: () => void
} | null

export type ChildAction = {
  id: string
  name: string
  shortcut?: [string, string] // optional tuple
  keywords: string
  section: string
  subtitle: string
  perform: () => void
}

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

export default function KBar({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()

  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    const handleRefresh = (): void => {
      setRefreshKey((k) => k + 1)
    }

    // listen for refresh navigation events
    router.refresh = new Proxy(router.refresh, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apply(target, thisArg, args: []): any {
        handleRefresh()
        return target.apply(thisArg, args)
      },
    })
  }, [router])

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string): void => {
      router.push(url)
    }

    const createBaseAction = (navItem: NavItem): KBarAction =>
      (navItem.url !== '#'
        ? {
            id: `${navItem.title.toLowerCase()}Action`,
            name: navItem.title,
            shortcut: navItem.shortcut,
            keywords: navItem.title.toLowerCase(),
            section: 'Navigation',
            subtitle: `Go to ${navItem.title}`,
            perform: (): void => navigateTo(navItem.url),
          }
        : null)

    const convertChildItemToAction = (
      childItem: NavItem,
      navItem: NavItem,
    ): ChildAction => ({
      id: `${childItem.title.toLowerCase()}Action`,
      name: childItem.title,
      shortcut: childItem.shortcut,
      keywords: childItem.title.toLowerCase(),
      section: navItem.title,
      subtitle: `Go to ${childItem.title}`,
      perform: (): void => navigateTo(childItem.url),
    })
    // Map child items into actions
    const createChildActions = (navItem: NavItem): ChildAction[] =>
      navItem.items?.map((childItem: NavItem) =>
        convertChildItemToAction(childItem, navItem),
      ) ?? []

    return navItems.flatMap((navItem) => {
      const baseAction = createBaseAction(navItem)
      const childActions = createChildActions(navItem)

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions
    })
  }, [router])

  return (
    <KBarProvider actions={actions}>
      <KBarComponent key={`${pathname}-${refreshKey}`}>
        {children}
      </KBarComponent>
    </KBarProvider>
  )
}
