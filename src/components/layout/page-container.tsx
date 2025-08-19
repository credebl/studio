import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function PageContainer({
  children,
  scrollable = true,
}: {
  children: React.ReactNode
  scrollable?: boolean
}): React.ReactElement {
  const Content = (
    <div className="bg-background mb-4 flex min-h-[calc(100dvh-52px)] w-full flex-col p-4 md:px-6">
      {children}
    </div>
  )

  return scrollable ? (
    <ScrollArea className="h-[calc(100dvh-52px)] w-full">{Content}</ScrollArea>
  ) : (
    Content
  )
}
