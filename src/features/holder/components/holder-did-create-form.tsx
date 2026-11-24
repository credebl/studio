'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  type EncryptedKey,
  KeyImportError,
  type KeyImportKeyMaterial,
  encryptKeyMaterialForImport,
  isKeyImportSession,
  parseKeyMaterial,
} from '@/utils/keyImport'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createDidAction,
  createDidImportSessionAction,
} from '@/app/holder/actions'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormStatus } from './form-status'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type HolderDidMethod = 'key' | 'web' | 'polygon'

interface HolderDidCreateFormProps {
  onSuccess?: () => void
}

const polygonPrivateKeyMaterial = (value: string): KeyImportKeyMaterial => {
  const hex = value.trim().replace(/^0x/i, '')
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new KeyImportError(
      'did:polygon needs a 64-character hex secp256k1 private key.',
    )
  }
  return { privateKey: hex }
}

/**
 * Shared DID creation form for holder onboarding and the DIDs panel.
 *
 * When an external key is imported, the browser requests a single-use public
 * key from the platform and encrypts the key material before submitting. Only
 * the opaque JWE and session id are sent to the server action; the plaintext
 * private key never leaves the browser.
 */
export function HolderDidCreateForm({
  onSuccess,
}: HolderDidCreateFormProps): React.JSX.Element {
  const [state, formAction, pending] = useActionState(createDidAction, null)
  const [method, setMethod] = useState<HolderDidMethod>('key')
  const [importExistingKey, setImportExistingKey] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [encryptedKey, setEncryptedKey] = useState<EncryptedKey | null>(null)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const [preparing, startPreparing] = useTransition()

  useEffect(() => {
    if (state?.status === 'success') {
      setPrivateKey('')
      setPassphrase('')
      setEncryptedKey(null)
      onSuccess?.()
    }
  }, [state, onSuccess])

  const resetEncryptedKey = (): void => {
    setEncryptedKey(null)
    setPrepareError(null)
  }

  const prepareKey = (): void => {
    resetEncryptedKey()
    startPreparing(async () => {
      try {
        const session = await createDidImportSessionAction(method)
        if (session.status !== 'success' || !isKeyImportSession(session.data)) {
          setPrepareError(
            session.status === 'error'
              ? session.message
              : 'Could not create an import session.',
          )
          return
        }
        const material =
          method === 'polygon'
            ? polygonPrivateKeyMaterial(privateKey)
            : parseKeyMaterial(privateKey, passphrase)
        setEncryptedKey(
          await encryptKeyMaterialForImport(session.data, material),
        )
      } catch (error) {
        setPrepareError(
          error instanceof Error
            ? error.message
            : 'Could not encrypt the private key.',
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <FormStatus state={state} />

      {prepareError ? (
        <Alert variant="destructive">
          <AlertDescription>{prepareError}</AlertDescription>
        </Alert>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="holder-did-method">Method</Label>
          <Select
            name="method"
            value={method}
            onValueChange={(value) => {
              setMethod(value as HolderDidMethod)
              resetEncryptedKey()
            }}
            disabled={pending || preparing}
            required
          >
            <SelectTrigger id="holder-did-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="key">did:key</SelectItem>
              <SelectItem value="web">did:web</SelectItem>
              <SelectItem value="polygon">did:polygon</SelectItem>
              <SelectItem value="x509" disabled>
                did:x509 (unavailable on platform v2.3.0)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            did:x509 needs a holder-scoped import API. Track{' '}
            <a
              className="underline"
              href="https://github.com/credebl/platform/issues/1864"
              target="_blank"
              rel="noreferrer"
            >
              credebl/platform#1864
            </a>
            .
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="holder-did-key-type">Key type</Label>
          <Input id="holder-did-key-type" value="Ed25519" readOnly />
          <input type="hidden" name="keyType" value="ed25519" />
        </div>

        {method === 'web' ? (
          <div className="space-y-2">
            <Label htmlFor="holder-did-domain">Domain (did:web)</Label>
            <Input
              id="holder-did-domain"
              name="domain"
              placeholder="example.com"
              required
            />
          </div>
        ) : null}

        {method === 'polygon' ? (
          <div className="space-y-2">
            <Label htmlFor="holder-did-network">Network</Label>
            <Input
              id="holder-did-network"
              name="network"
              placeholder="polygon:testnet"
              onChange={resetEncryptedKey}
              required
            />
          </div>
        ) : null}

        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="holder-import-existing-key"
              checked={importExistingKey}
              onCheckedChange={(checked) => {
                setImportExistingKey(checked === true)
                resetEncryptedKey()
              }}
              disabled={pending || preparing}
            />
            <Label htmlFor="holder-import-existing-key">
              Import my own private key
            </Label>
          </div>
          <p className="text-muted-foreground text-xs">
            Use an existing PEM, base64 DER or private JWK. For did:polygon,
            supply a 64-character hex secp256k1 key.
          </p>

          {importExistingKey ? (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="holder-private-key">Private key</Label>
                <Textarea
                  id="holder-private-key"
                  value={privateKey}
                  onChange={(event) => {
                    setPrivateKey(event.target.value)
                    resetEncryptedKey()
                  }}
                  placeholder="-----BEGIN PRIVATE KEY----- or a private JWK"
                  rows={4}
                  disabled={pending || preparing}
                />
              </div>
              {method !== 'polygon' ? (
                <div className="space-y-2">
                  <Label htmlFor="holder-key-passphrase">
                    Passphrase (encrypted PEM only, optional)
                  </Label>
                  <Input
                    id="holder-key-passphrase"
                    type="password"
                    value={passphrase}
                    onChange={(event) => {
                      setPassphrase(event.target.value)
                      resetEncryptedKey()
                    }}
                    disabled={pending || preparing}
                  />
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={prepareKey}
                disabled={preparing || pending || !privateKey.trim()}
              >
                {preparing ? 'Encrypting…' : 'Encrypt private key'}
              </Button>
              {encryptedKey ? (
                <p className="text-sm" role="status">
                  Encrypted key is ready. Your private key stays in this
                  browser.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {encryptedKey ? (
          <>
            <input
              type="hidden"
              name="encryptedKeySessionId"
              value={encryptedKey.sessionId}
            />
            <input
              type="hidden"
              name="encryptedKeyJwe"
              value={encryptedKey.jwe}
            />
          </>
        ) : null}

        <Button
          type="submit"
          disabled={
            pending || preparing || (importExistingKey && !encryptedKey)
          }
        >
          {pending ? 'Creating…' : 'Create DID'}
        </Button>
      </form>
    </div>
  )
}
