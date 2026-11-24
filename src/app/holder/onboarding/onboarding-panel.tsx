'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FormStatus } from '@/features/holder/components/form-status'
import type { HolderActionResult } from '@/features/holder/types'
import { HolderDidCreateForm } from '@/features/holder/components/holder-did-create-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWalletAction } from '../actions'
import { useRouter } from 'next/navigation'

interface OnboardingPanelProps {
  hasWallet: boolean
  didCount: number
}

export function OnboardingPanel({
  hasWallet,
  didCount,
}: OnboardingPanelProps): React.JSX.Element {
  const router = useRouter()

  const [walletState, walletAction, walletPending] = useActionState(
    createWalletAction,
    null,
  )

  useEffect(() => {
    if (walletState?.status === 'success') {
      router.refresh()
    }
  }, [walletState, router])

  const walletStatus: HolderActionResult | null = walletState

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {hasWallet ? 'Create your first DID' : 'Set up your personal wallet'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {hasWallet
            ? 'A DID gives issuers and verifiers a stable way to identify you.'
            : 'One personal wallet is created for your account. No organization is required.'}
        </p>
      </div>

      <FormStatus state={walletStatus} />

      {!hasWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Create wallet</CardTitle>
            <CardDescription>
              The platform provisions a tenant on its shared base agent for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={walletAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-label">Wallet label</Label>
                <Input
                  id="wallet-label"
                  name="label"
                  placeholder="My wallet"
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-image">
                  Connection image URL (optional)
                </Label>
                <Input
                  id="wallet-image"
                  name="connectionImageUrl"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                />
              </div>
              <Button type="submit" disabled={walletPending}>
                {walletPending ? 'Creating…' : 'Create my wallet'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {hasWallet && didCount === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Create DID</CardTitle>
            <CardDescription>
              Start with did:key, or import an existing key for did:key, did:web
              or did:polygon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HolderDidCreateForm onSuccess={() => router.push('/holder')} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
