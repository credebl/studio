import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function PageContainer({
  children,
  scrollable = true,
  fitWidth = false,
}: {
  children: React.ReactNode
  scrollable?: boolean
  /**
   * Keep the content within the page width so long values wrap and wide tables scroll inside their own container.
   * Radix renders the scroll viewport's content as a table, which otherwise grows to the widest unbroken line, and the
   * content's minimum width would otherwise widen the whole layout.
   */
  fitWidth?: boolean
}): React.ReactElement {
  const Content = (
    <div
      className={cn(
        'bg-background mb-4 flex min-h-[calc(100dvh-52px)] w-full flex-col p-4 md:px-6',
        fitWidth && '[contain:inline-size]',
      )}
    >
      {children}
    </div>
  )

  return scrollable ? (
    <ScrollArea
      className={cn('h-[calc(100dvh-52px)] w-full', fitWidth && 'min-w-0')}
      viewportClassName={fitWidth ? '[&>div]:block!' : undefined}
    >
      {Content}
    </ScrollArea>
  ) : (
    Content
  )
}
