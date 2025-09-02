'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

type Field = {
  label: string
  value: string | number | React.ReactNode
  copyable?: boolean
  badge?: boolean
}

type Props = {
  open: boolean
  onOpenChange: (val: boolean) => void
  title?: string
  description?: string
  fields: Field[]
}

export default function SidePanelComponent({
  open,
  onOpenChange,
  title = 'Connection Details',
  description = 'Detailed view of selected connection',
  fields,
}: Props): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-xl min-w-[500px] space-y-2 p-4"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            {description}
          </SheetDescription>
        </SheetHeader>

        <Card>
          <CardContent className="space-y-4 p-8">
            {fields.map((field, index) => (
              <div key={`${field.label}-${index}`} className="space-y-1">
                <div className="text-muted-foreground text-sm">
                  {field.label}
                </div>
                <div className="flex items-center justify-between">
                  {field.badge ? (
                    <Badge variant="default">{field.value}</Badge>
                  ) : (
                    <div className="font-medium break-all">{field.value}</div>
                  )}
                  {field.copyable && typeof field.value === 'string' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(field.value as string)
                        toast.success('Copied to clipboard')
                      }}
                    >
                      <Copy className="text-muted-foreground h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
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
