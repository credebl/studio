import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Textarea } from '@/components/ui/textarea'

interface ImportPrivateKeyInputProps {
  enabled: boolean
  privateKey: string
  passphrase: string
  error: string | null
  onEnabledChange: (enabled: boolean) => void
  onPrivateKeyChange: (value: string) => void
  onPassphraseChange: (value: string) => void
}

/**
 * Optional private key import for did:key and did:web. The value is parsed and encrypted in the browser by the caller
 * (see `parseKeyMaterial` and `encryptKeyForDidImport`); this component only collects it.
 */
const ImportPrivateKeyInput = ({
  enabled,
  privateKey,
  passphrase,
  error,
  onEnabledChange,
  onPrivateKeyChange,
  onPassphraseChange,
}: ImportPrivateKeyInputProps): React.JSX.Element => (
  <div className="mt-6 space-y-4 rounded-md border p-4">
    <div className="flex items-center space-x-2">
      <Checkbox
        id="haveKeyMaterial"
        checked={enabled}
        onCheckedChange={(checked) => onEnabledChange(checked === true)}
      />
      <Label htmlFor="haveKeyMaterial">Import an existing private key</Label>
    </div>

    {enabled && (
      <>
        <div>
          <Label htmlFor="importPrivateKey">
            Private key <span className="text-destructive text-xs">*</span>
          </Label>
          <Textarea
            id="importPrivateKey"
            name="importPrivateKey"
            rows={4}
            value={privateKey}
            onChange={(event) => onPrivateKeyChange(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="mt-1 font-mono text-xs"
            placeholder="-----BEGIN PRIVATE KEY----- ... or a private JWK JSON"
            aria-invalid={error ? true : undefined}
            aria-describedby="importPrivateKeyHelp"
          />
          {error && (
            <div className="text-destructive mt-1 text-sm">{error}</div>
          )}
          <p
            id="importPrivateKeyHelp"
            className="text-muted-foreground mt-1 text-sm"
          >
            The key is encrypted in your browser to a single-use key before it
            is sent, so it never appears in request bodies or logs. PEM (PKCS#8,
            SEC1 or PKCS#1, optionally encrypted), base64 DER (PKCS#8) or a
            private JWK. Ed25519, P-256, P-384, P-521 and secp256k1 are
            supported; RSA is available for did:web only. The key determines the
            DID.
          </p>
        </div>

        <div>
          <Label htmlFor="importPassphrase">Passphrase (optional)</Label>
          <Input
            id="importPassphrase"
            name="importPassphrase"
            type="password"
            autoComplete="new-password"
            value={passphrase}
            onChange={(event) => onPassphraseChange(event.target.value)}
            placeholder="Passphrase of an encrypted PEM key"
            className="mt-1"
          />
        </div>
      </>
    )}
  </div>
)

export default ImportPrivateKeyInput
