import { buildDidWebIdentifier, didWebToUrl } from '@/lib/did'
import React from 'react'

interface DidWebPreviewProps {
  domain: string
  path: string
}

/** Shows the did:web identifier built from a domain and path, and the address its did.json must be hosted at. */
const DidWebPreview = ({
  domain,
  path,
}: DidWebPreviewProps): React.JSX.Element | null => {
  const parts = buildDidWebIdentifier(domain, path)
  if (!parts.ok) {
    return null
  }
  const did = `did:web:${parts.identifier}`
  const hostedAt = didWebToUrl(did)
  if (!hostedAt) {
    return null
  }

  return (
    <div className="border-border bg-secondary space-y-1 rounded-lg border p-3 text-sm">
      <p>
        <span className="text-muted-foreground">DID: </span>
        <span className="font-mono break-all">{did}</span>
      </p>
      <p>
        <span className="text-muted-foreground">Host did.json at: </span>
        <span className="font-mono break-all">{hostedAt}</span>
      </p>
    </div>
  )
}

export default DidWebPreview
