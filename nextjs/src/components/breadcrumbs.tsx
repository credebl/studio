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
import { UUID_REGEX } from '@/config/CommonConstant'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'

export function Breadcrumbs(): React.JSX.Element | null {
  const items = useBreadcrumbs()
  const [copied, setCopied] = React.useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const alias = React.useMemo(() => searchParams.get('alias'), [searchParams])
  const isOrganizationUUIDPath = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean) // remove empty strings
    return (
      parts.length === 2 &&
      parts[0] === 'organizations' &&
      UUID_REGEX.test(parts[1])
    )
  }, [pathname])

  if (items.length === 0) {
    return null
  }

  function copyToClipboard(text: string): void {
    window.navigator.clipboard.writeText(text)
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
              <BreadcrumbLink onClick={() => copyToClipboard(items[1].title)}>
                <div className="relative">
                  Overview
                  {copied && (
                    <div className="absolute top-7 z-50 ml-2 rounded-md bg-black px-2 py-1 text-xs font-semibold text-white">
                      Copied!
                    </div>
                  )}
                </div>
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
                        href={item.link || `/schemas/${item.title}`}
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
