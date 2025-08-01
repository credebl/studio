'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React, { Fragment, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { IconSlash } from '@tabler/icons-react'
import { useAppSelector } from '@/lib/hooks'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'

export function Breadcrumbs(): React.JSX.Element | null {
  const items = useBreadcrumbs()
  const [copied, setCopied] = React.useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const alias = React.useMemo(() => searchParams.get('alias'), [searchParams])
  const isOrganizationUUIDPath = useMemo(() => {
    if (pathname === '/dashboard') {
      return true
    }
    return false
  }, [pathname])
  const orgId = useAppSelector((state) => state.organization.orgId)

  if (items.length === 0) {
    return null
  }

  function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {isOrganizationUUIDPath ? (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink onClick={() => copyToClipboard(orgId)}>
                <div className="relative"></div>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : (
          <>
            {items.map((item, index) => {
              const decodedTitle = decodeURIComponent(item.title)

              return (
                <Fragment
                  key={item.link ? item.link : `${item.title}-${index}`}
                >
                  {index !== items.length - 1 && (
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink
                        href={
                          item.link === '/organizations'
                            ? '/dashboard'
                            : item.link || `/schemas/${item.title}`
                        }
                      >
                        {decodedTitle}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                  {index < items.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block">
                      <IconSlash />
                    </BreadcrumbSeparator>
                  )}
                  {index === items.length - 1 && (
                    <BreadcrumbPage>
                      {alias ? (
                        <button
                          className="relative"
                          onClick={() => copyToClipboard(decodedTitle)}
                        >
                          {alias}
                          {copied && (
                            <div className="absolute top-7 z-50 ml-2 rounded-md bg-black px-2 py-1 text-xs font-semibold text-white">
                              Copied!
                            </div>
                          )}
                        </button>
                      ) : (
                        decodedTitle
                      )}
                    </BreadcrumbPage>
                  )}
                </Fragment>
              )
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
