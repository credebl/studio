'use client'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type Props = {
  open: boolean
  onOpenChange: (val: boolean) => void
  children: React.JSX.Element
  title?: string
  description?: string
}

export default function SidePanelComponent({
  open,
  onOpenChange,
  children,
  title = 'Connection Details',
}: Readonly<Props>): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full space-y-2 p-4 md:min-w-[60%]"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm"></SheetDescription>
        </SheetHeader>
        <Card className="overflow-y-auto">
          <div className="p-4">{children}</div>
        </Card>

        <div className="flex justify-end">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
