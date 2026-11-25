'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import BindingChoiceForm from './BindingChoiceForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ResolvedHolderOffer } from '@/lib/holderBinding'
import { useAppSelector } from '@/lib/hooks'

export const HolderOfferRedemption = (): React.JSX.Element => {
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [offerUri, setOfferUri] = useState('')
  const [offer, setOffer] = useState<ResolvedHolderOffer | null>(null)
  const [primaryDidUrl, setPrimaryDidUrl] = useState<string | null>(null)
  const [dids, setDids] = useState<string[]>([])
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orgId) {
      return
    }

    let active = true
    const loadWalletState = async (): Promise<void> => {
      const [primaryResponse, didResponse] = await Promise.allSettled([
        fetch(`/api/holder/primary-did?orgId=${encodeURIComponent(orgId)}`),
        fetch(`/api/holder/dids?orgId=${encodeURIComponent(orgId)}`),
      ])

      if (!active) {
        return
      }

      if (primaryResponse.status === 'fulfilled' && primaryResponse.value.ok) {
        const body = (await primaryResponse.value.json()) as {
          didUrl?: string | null
        }
        setPrimaryDidUrl(body.didUrl ?? null)
      }
      if (didResponse.status === 'fulfilled' && didResponse.value.ok) {
        const body = (await didResponse.value.json()) as { dids?: string[] }
        setDids(Array.isArray(body.dids) ? body.dids : [])
      }
    }

    void loadWalletState()
    return () => {
      active = false
    }
  }, [orgId])

  const resolve = async (): Promise<void> => {
    setResolving(true)
    setError(null)
    setOffer(null)

    try {
      const response = await fetch('/api/holder/offers/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialOfferUri: offerUri.trim() }),
      })

      if (!response.ok) {
        const body = (await response.json()) as { message?: string }
        setError(body.message ?? 'Unable to resolve the credential offer')
        return
      }

      setOffer((await response.json()) as ResolvedHolderOffer)
    } catch {
      setError('Unable to resolve the credential offer')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Redeem a credential offer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label htmlFor="credential-offer-uri">Credential offer URI</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="credential-offer-uri"
              value={offerUri}
              onChange={(event) => setOfferUri(event.target.value)}
              placeholder="openid-credential-offer://..."
              disabled={resolving}
            />
            <Button
              type="button"
              onClick={resolve}
              disabled={!offerUri.trim() || resolving}
              className="sm:w-fit"
            >
              {resolving ? 'Resolving…' : 'Resolve offer'}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            The offer is resolved on the server. Its transaction code is never
            displayed or stored in the UI.
          </p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {offer && (
        <BindingChoiceForm
          key={offer.credentialOfferUri}
          offer={offer}
          primaryDidUrl={primaryDidUrl}
          dids={dids}
        />
      )}
    </div>
  )
}

export default HolderOfferRedemption
