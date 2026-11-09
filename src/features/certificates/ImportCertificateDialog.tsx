'use client'

import {
  ChainReview,
  ReviewFinding,
  reviewCertificateChain,
} from '@/lib/x509Inspect'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Upload } from 'lucide-react'
import React, { JSX, useState } from 'react'
import {
  X509_CERTIFICATE_IMPORT_METHOD,
  encryptKeyForDidImport,
  x509CertificateKeyMaterial,
} from '@/utils/didKeyImport'
import {
  certificateChainFromFiles,
  isEncryptedPrivateKey,
  privateKeyFromFile,
} from '@/utils/pemFiles'
import { normalizeCertificate, parsePemCertificate } from '@/lib/x509'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import FileUploadButton from '@/features/wallet/FileUploadButton'
import { Label } from '@/components/ui/label'
import { StatusPill } from '@/features/wallet/DetailParts'
import { Textarea } from '@/components/ui/textarea'
import { apiStatusCodes } from '@/config/CommonConstant'
import { cn } from '@/lib/utils'
import { importCertificate } from '@/app/api/x509'
import { parseCertificateChain } from '@/utils/didX509'

interface ImportCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
  onFailure: (message: string) => void
  orgId: string
}

const ROLE_LABELS = {
  leaf: 'Certificate',
  intermediate: 'Intermediate CA',
  root: 'Root CA',
} as const

const formatDate = (date: Date): string =>
  date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const findingClass = (level: ReviewFinding['level']): string => {
  if (level === 'error') {
    return 'text-destructive'
  }
  return level === 'warning' ? 'text-warning' : 'text-muted-foreground'
}

const readFiles = (
  files: File[],
): Promise<{ name: string; bytes: Uint8Array }[]> =>
  Promise.all(
    files.map(async (file) => ({
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
    })),
  )

const ImportCertificateDialog = ({
  open,
  onOpenChange,
  onSuccess,
  onFailure,
  orgId,
}: ImportCertificateDialogProps): JSX.Element => {
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // The certificates in chain order, leaf first, as PEM.
  const [certificates, setCertificates] = useState<string[]>([])
  const [keyType, setKeyType] = useState<'Ed25519' | 'P-256' | null>(null)
  const [review, setReview] = useState<ChainReview | null>(null)
  const [privateKey, setPrivateKey] = useState('')
  const [keyNote, setKeyNote] = useState<string | null>(null)

  const resetCertificates = (): void => {
    setCertificates([])
    setKeyType(null)
    setReview(null)
  }

  const handleCertificateFiles = async (files: File[]): Promise<void> => {
    try {
      const text = certificateChainFromFiles(await readFiles(files))
      const chain = parseCertificateChain(text)
      const parsed = parsePemCertificate(chain[0])
      setCertificates(chain)
      setKeyType(parsed.keyType)
      setReview(await reviewCertificateChain(chain))
      setError(null)
    } catch (err) {
      resetCertificates()
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Unable to read the certificate files. Please check the PEM or DER files.',
      )
    }
  }

  const handleKeyFile = async (files: File[]): Promise<void> => {
    try {
      const [file] = await readFiles(files)
      const text = privateKeyFromFile(file.name, file.bytes)
      setPrivateKey(text)
      setKeyNote(
        isEncryptedPrivateKey(text)
          ? `Loaded ${file.name}. Encrypted keys are not supported here: use an unencrypted PKCS#8 key.`
          : `Loaded ${file.name}.`,
      )
      setError(null)
    } catch (err) {
      setKeyNote(null)
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Unable to read the key file',
      )
    }
  }

  const handleImport = async (): Promise<void> => {
    if (certificates.length === 0 || !keyType || !privateKey || !orgId) {
      return
    }

    setImporting(true)
    setSuccess(null)
    setError(null)

    try {
      const [leaf, ...chain] = certificates.map(normalizeCertificate)

      const encryptedKey = await encryptKeyForDidImport(
        orgId,
        X509_CERTIFICATE_IMPORT_METHOD,
        x509CertificateKeyMaterial(privateKey),
      )

      const response = await importCertificate(orgId, {
        certificate: leaf,
        ...(chain.length > 0 && { certificateChain: chain }),
        keyType,
        encryptedKey,
      })

      if (typeof response === 'string') {
        setError(response)
        onFailure(response)
        return
      }

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const message = data?.message
        setSuccess(message)
        resetCertificates()
        setPrivateKey('')
        setKeyNote(null)
        onSuccess(message)
        setTimeout(() => onOpenChange(false), 1500)
      } else {
        const errorMessage = data?.message
        setError(errorMessage)
        onFailure(errorMessage)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : 'An unexpected error occurred'
      setError(errorMessage)
      onFailure(errorMessage)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = (): void => {
    setSuccess(null)
    setError(null)
    resetCertificates()
    setPrivateKey('')
    setKeyNote(null)
    onOpenChange(false)
  }

  const blocked = !review || review.hasErrors

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import X.509 Certificate</DialogTitle>
        </DialogHeader>

        {success && (
          <AlertComponent
            message={success}
            type="success"
            onAlertClose={() => setSuccess(null)}
          />
        )}
        {error && (
          <AlertComponent
            message={error}
            type="failure"
            onAlertClose={() => setError(null)}
          />
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Certificate (.pem, .crt, .cer, .der) *</Label>
              <FileUploadButton
                id="importCertificateFiles"
                label="Choose certificate file(s)"
                accept=".pem,.crt,.cer,.cert,.der"
                multiple
                onFiles={handleCertificateFiles}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Choose the certificate together with its intermediate and root CA
              certificates if you have them. They are put in order, the
              certificate first. The platform keeps the chain and sends it with
              every credential signed with this certificate, so a wallet can
              trust it through the root.
            </p>
          </div>

          {review && (
            <Card className="bg-muted space-y-3 p-4 text-sm">
              <ul className="space-y-1">
                {review.certificates.map((certificate, index) => (
                  <li
                    key={certificate.fingerprint}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="break-all">
                      <b>
                        {index + 1}. {ROLE_LABELS[certificate.role]}
                      </b>{' '}
                      {certificate.commonName ?? certificate.subject}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-2">
                      {certificate.keyAlgorithm} · until{' '}
                      {formatDate(certificate.notAfter)}
                      {!certificate.validNow && (
                        <StatusPill tone="bad">Not valid</StatusPill>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {review.findings
                .filter((finding) => finding.level !== 'ok')
                .map((finding) => (
                  <p
                    key={`${finding.level}-${finding.message}`}
                    className={cn(findingClass(finding.level))}
                  >
                    {finding.message}
                  </p>
                ))}
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Private Key *</Label>
              <FileUploadButton
                id="importCertificateKeyFile"
                label="Choose key file"
                accept=".pem,.key,.der,.p8"
                onFiles={handleKeyFile}
              />
            </div>
            <Textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Paste the PEM or base64-encoded PKCS#8 private key"
              rows={5}
            />
            {keyNote && (
              <p className="text-muted-foreground text-sm">{keyNote}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || blocked || !privateKey}
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}{' '}
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImportCertificateDialog
