'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDidAction, createWalletAction } from '../actions'
import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FormStatus } from '@/features/holder/components/form-status'
import type { HolderActionResult } from '@/features/holder/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [didState, didAction, didPending] = useActionState(
    createDidAction,
    null,
  )

  useEffect(() => {
    if (walletState?.status === 'success') {
      router.refresh()
    }
  }, [walletState, router])

  useEffect(() => {
    if (didState?.status === 'success') {
      router.push('/holder')
    }
  }, [didState, router])

  const walletStatus: HolderActionResult | null = walletState
  const didStatus: HolderActionResult | null = didState

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
      <FormStatus state={didStatus} />

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
              Start with did:key unless you control a domain for did:web.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={didAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="did-method">Method</Label>
                <Select name="method" defaultValue="key" required>
                  <SelectTrigger id="did-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="key">did:key</SelectItem>
                    <SelectItem value="web">did:web</SelectItem>
                    <SelectItem value="polygon">did:polygon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="did-key-type">Key type</Label>
                <Select name="keyType" defaultValue="ed25519" required>
                  <SelectTrigger id="did-key-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ed25519">Ed25519</SelectItem>
                    <SelectItem value="secp256k1">Secp256k1</SelectItem>
                    <SelectItem value="rsa">RSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="did-domain">Domain (did:web)</Label>
                  <Input
                    id="did-domain"
                    name="domain"
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="did-network">Network (optional)</Label>
                  <Input
                    id="did-network"
                    name="network"
                    placeholder="bcovrin:testnet"
                  />
                </div>
              </div>
              <Button type="submit" disabled={didPending}>
                {didPending ? 'Creating…' : 'Create DID'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
