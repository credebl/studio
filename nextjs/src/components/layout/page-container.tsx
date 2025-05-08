import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  const Content = (
    <div className='flex min-h-[calc(100dvh-52px)] w-full flex-col p-4 md:px-6 mb-5'>
      {children}
    </div>
  );

  return scrollable ? (
    <ScrollArea className='h-[calc(100dvh-52px)] w-full'>{Content}</ScrollArea>
  ) : (
    Content
  );
}
