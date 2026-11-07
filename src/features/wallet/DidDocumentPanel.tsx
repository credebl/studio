'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import DidDocumentView from './DidDocumentView'
import React from 'react'

interface DidDocumentPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  did: string
  didDocument: unknown
}

export default function DidDocumentPanel({
  open,
  onOpenChange,
  did,
  didDocument,
}: DidDocumentPanelProps): React.JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            DID document
          </SheetTitle>
          <SheetDescription className="font-mono text-xs break-all">
            {did}
          </SheetDescription>
        </SheetHeader>
        <DidDocumentView did={did} didDocument={didDocument} />
      </SheetContent>
    </Sheet>
  )
}
