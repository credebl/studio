'use client'

import {
  ChainReview,
  KeyReview,
  reviewCertificateChain,
  reviewPrivateKey,
} from '@/lib/x509Inspect'
import { ErrorMessage, Field, useFormikContext } from 'formik'
import {
  certificateChainFromFiles,
  isEncryptedPrivateKey,
  privateKeyFromFile,
} from '@/utils/pemFiles'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import FileUploadButton from './FileUploadButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import X509ReviewPanel from './X509ReviewPanel'
import { parseCertificateChain } from '@/utils/didX509'
import { parseKeyMaterial } from '@/utils/keyImport'

interface X509FormValues {
  certificateChain: string
  privateKey: string
  passphrase: string
  isPrimaryDid: boolean
}

interface X509Review {
  chain: ChainReview
  key: KeyReview
}

/**
 * The did:x509 import form in two steps. Step 1 takes the certificate chain, the leaf private key and an optional
 * passphrase, pasted or uploaded as PEM or DER files. Step 2 shows what was read, with the details of every
 * certificate and the checks that passed or failed, and imports once nothing blocks it. It renders its own footer.
 */
export default function X509DidFields({
  loading,
}: {
  loading: boolean
}): React.JSX.Element {
  const { values, setFieldValue, setFieldError, setFieldTouched } =
    useFormikContext<X509FormValues>()

  const [review, setReview] = React.useState<X509Review | null>(null)
  const [reviewing, setReviewing] = React.useState(false)

  // Reads the chain and the key. Anything unreadable is reported on its field and keeps the user on step 1.
  const startReview = async (): Promise<void> => {
    setReviewing(true)
    try {
      let chain: string[] = []
      try {
        chain = parseCertificateChain(values.certificateChain)
      } catch (error) {
        setFieldTouched('certificateChain', true, false)
        setFieldError(
          'certificateChain',
          error instanceof Error ? error.message : 'Invalid certificate chain',
        )
        return
      }
      try {
        parseKeyMaterial(values.privateKey, values.passphrase)
      } catch (error) {
        setFieldTouched('privateKey', true, false)
        setFieldError(
          'privateKey',
          error instanceof Error ? error.message : 'Invalid private key',
        )
        return
      }

      setReview({
        chain: await reviewCertificateChain(chain),
        key: await reviewPrivateKey(values.privateKey, chain[0]),
      })
    } finally {
      setReviewing(false)
    }
  }

  // Messages shown under the upload buttons.
  const [uploadNote, setUploadNote] = React.useState<{
    chain?: string
    key?: string
  }>({})

  const readUploadedFiles = (
    files: File[],
  ): Promise<{ name: string; bytes: Uint8Array }[]> =>
    Promise.all(
      files.map(async (file) => ({
        name: file.name,
        bytes: new Uint8Array(await file.arrayBuffer()),
      })),
    )

  const uploadCertificates = async (files: File[]): Promise<void> => {
    try {
      const text = certificateChainFromFiles(await readUploadedFiles(files))
      const count = text.match(/-----BEGIN CERTIFICATE-----/g)?.length ?? 0
      setFieldValue('certificateChain', text)
      setFieldError('certificateChain', undefined)
      setUploadNote((prev) => ({
        ...prev,
        chain: `Loaded ${count} certificate${count === 1 ? '' : 's'} from ${files.length} file${files.length === 1 ? '' : 's'}, leaf first. Check the order below.`,
      }))
    } catch (error) {
      setUploadNote((prev) => ({ ...prev, chain: undefined }))
      setFieldTouched('certificateChain', true, false)
      setFieldError(
        'certificateChain',
        error instanceof Error ? error.message : 'Unable to read the file',
      )
    }
  }

  const uploadPrivateKey = async (file: File): Promise<void> => {
    try {
      const [uploaded] = await readUploadedFiles([file])
      const text = privateKeyFromFile(uploaded.name, uploaded.bytes)
      setFieldValue('privateKey', text)
      setFieldError('privateKey', undefined)
      setUploadNote((prev) => ({
        ...prev,
        key: isEncryptedPrivateKey(text)
          ? `Loaded ${file.name}. This key is encrypted: enter its passphrase below.`
          : `Loaded ${file.name}.`,
      }))
    } catch (error) {
      setUploadNote((prev) => ({ ...prev, key: undefined }))
      setFieldTouched('privateKey', true, false)
      setFieldError(
        'privateKey',
        error instanceof Error ? error.message : 'Unable to read the file',
      )
    }
  }

  const blocked =
    !review || review.chain.hasErrors || review.key.match === 'mismatch'

  return (
    <div className="col-span-1 space-y-4 rounded-md border p-4 sm:col-span-2">
      {review ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Review before importing</h3>
            <span className="text-muted-foreground text-xs">Step 2 of 2</span>
          </div>
          <X509ReviewPanel chain={review.chain} keyReview={review.key} />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPrimaryDid"
              checked={values.isPrimaryDid}
              onCheckedChange={(checked) =>
                setFieldValue('isPrimaryDid', checked === true)
              }
            />
            <Label htmlFor="isPrimaryDid">Set as the primary DID</Label>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              Upload the certificate chain and key
            </h3>
            <span className="text-muted-foreground text-xs">Step 1 of 2</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="certificateChain">
                Certificate chain{' '}
                <span className="text-destructive text-xs">*</span>
              </Label>
              <FileUploadButton
                id="certificateChainFile"
                label="Upload certificate file(s)"
                accept=".pem,.crt,.cer,.cert,.der"
                multiple
                onFiles={(files) => uploadCertificates(files)}
              />
            </div>
            <Field
              as={Textarea}
              id="certificateChain"
              name="certificateChain"
              autoComplete="off"
              spellCheck={false}
              rows={12}
              className="mt-1 font-mono text-xs"
              placeholder={
                '-----BEGIN CERTIFICATE-----\n... leaf certificate ...\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\n... root CA ...\n-----END CERTIFICATE-----'
              }
            />
            <ErrorMessage
              name="certificateChain"
              component="div"
              className="text-destructive mt-1 text-sm"
            />
            {uploadNote.chain && (
              <p className="text-muted-foreground mt-1 text-sm">
                {uploadNote.chain}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-sm">
              Paste PEM certificates, or upload your PEM or DER files (select
              all the certificate files at once; they are put in order). The
              leaf comes first and the root CA last. The DID is derived from the
              chain and restricted to the common name of the leaf.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="privateKey">
                Leaf private key{' '}
                <span className="text-destructive text-xs">*</span>
              </Label>
              <FileUploadButton
                id="privateKeyFile"
                label="Upload key file"
                accept=".pem,.key,.der,.p8,.json"
                onFiles={(files) => uploadPrivateKey(files[0])}
              />
            </div>
            <Field
              as={Textarea}
              id="privateKey"
              name="privateKey"
              autoComplete="off"
              spellCheck={false}
              rows={8}
              className="mt-1 font-mono text-xs"
              placeholder="-----BEGIN PRIVATE KEY----- ... or a private JWK JSON"
            />
            <ErrorMessage
              name="privateKey"
              component="div"
              className="text-destructive mt-1 text-sm"
            />
            {uploadNote.key && (
              <p className="text-muted-foreground mt-1 text-sm">
                {uploadNote.key}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-sm">
              The key is encrypted in your browser to a single-use key before it
              is sent, so it never appears in request bodies or logs. It must
              belong to the leaf certificate.
            </p>
          </div>

          <div>
            <Label htmlFor="passphrase">Passphrase (optional)</Label>
            <Field
              as={Input}
              id="passphrase"
              name="passphrase"
              type="password"
              autoComplete="new-password"
              placeholder="Passphrase of an encrypted PEM key"
              className="mt-1"
            />
          </div>
        </>
      )}

      <div className="bg-background sticky -bottom-6 -mx-4 -mb-4 flex justify-end gap-2 border-t px-4 py-3">
        {review ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setReview(null)}
            >
              Back
            </Button>
            <Button type="submit" disabled={loading || blocked}>
              {loading ? 'Importing...' : 'Import'}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={
              reviewing || !values.certificateChain || !values.privateKey
            }
            onClick={startReview}
          >
            {reviewing ? 'Reading...' : 'Review'}
          </Button>
        )}
      </div>
    </div>
  )
}
