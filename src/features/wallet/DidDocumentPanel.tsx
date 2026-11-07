'use client'

import { Check, Copy, Download, ExternalLink } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { didWebToUrl } from '@/lib/did'

interface DidDocumentPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  did: string
  /** The DID document. It is stored as JSON, but a JSON string is accepted too. */
  didDocument: unknown
}

const toJson = (didDocument: unknown): string | null => {
  if (didDocument === null || didDocument === undefined || didDocument === '') {
    return null
  }
  if (typeof didDocument === 'string') {
    try {
      return JSON.stringify(JSON.parse(didDocument), undefined, 2)
    } catch {
      return didDocument
    }
  }
  return JSON.stringify(didDocument, undefined, 2)
}

// Mounted only while the panel is open, so the document is formatted on demand.
const DidDocumentBody = ({
  did,
  didDocument,
}: Pick<DidDocumentPanelProps, 'did' | 'didDocument'>): React.JSX.Element => {
  const [copied, setCopied] = useState(false)
  const json = useMemo(() => toJson(didDocument), [didDocument])
  const hostedUrl = didWebToUrl(did)

  const copy = (): void => {
    if (!json) {
      return
    }
    navigator.clipboard
      .writeText(json)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error) => console.error('could not copy to clipboard', error))
  }

  const download = (): void => {
    if (!json) {
      return
    }
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'did.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 overflow-y-auto px-4 pb-6">
      {hostedUrl && (
        <section className="space-y-3 text-sm">
          <h3 className="text-base font-semibold">Host this document</h3>
          <p className="text-muted-foreground">
            A did:web DID is resolved by fetching its document over HTTPS. Until
            the document is served from the address below, the DID cannot be
            resolved or published.
          </p>
          <div className="bg-muted rounded-md p-3 font-mono text-xs break-all">
            {hostedUrl}
          </div>
          <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
            <li>Download the document as did.json.</li>
            <li>Upload it so it is reachable at the address above.</li>
            <li>
              Open the address in a browser to check that it returns the
              document.
            </li>
          </ol>
          <Button variant="outline" size="sm" asChild>
            <a href={hostedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open hosted address
            </a>
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">DID document</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copy} disabled={!json}>
              {copied ? (
                <Check className="text-success h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={download}
              disabled={!json}
            >
              <Download className="h-4 w-4" />
              Download did.json
            </Button>
          </div>
        </div>
        {json ? (
          <pre className="bg-muted max-h-[60vh] overflow-auto rounded-md p-4 text-xs">
            <code>{json}</code>
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">
            No DID document is available for this DID.
          </p>
        )}
      </section>
    </div>
  )
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
        <DidDocumentBody did={did} didDocument={didDocument} />
      </SheetContent>
    </Sheet>
  )
}
