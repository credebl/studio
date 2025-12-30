'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Upload } from 'lucide-react'
import React, { JSX, useState } from 'react'
import { normalizeCertificate, parsePemCertificate } from '@/lib/x509'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiStatusCodes } from '@/config/CommonConstant'
import { importCertificate } from '@/app/api/x509'

interface ImportCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
  onFailure: (message: string) => void
  orgId: string
}

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
  const [parsedCert, setParsedCert] = useState<{
    keyType: 'ed25519' | 'p256'
    commonName?: string
    certificatePem: string
  } | null>(null)
  const [privateKey, setPrivateKey] = useState('')

  const handlePemUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    const text = await file.text()
    if (!text.includes('BEGIN CERTIFICATE')) {
      setError('Invalid X.509 PEM file')
      return
    }
    const parsed = parsePemCertificate(text)
    setParsedCert({ ...parsed, certificatePem: text })
    setError(null)
  }

  const handleImport = async (): Promise<void> => {
    if (!parsedCert || !privateKey || !orgId) {
      return
    }

    setImporting(true)
    setSuccess(null)
    setError(null)

    try {
      const normalizedCert = normalizeCertificate(parsedCert.certificatePem)

      const response = await importCertificate(orgId, {
        certificate: normalizedCert,
        privateKey,
        keyType: parsedCert.keyType,
      })

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const message = data?.message
        setSuccess(message)
        setParsedCert(null)
        setPrivateKey('')
        onSuccess(message)
        setTimeout(() => onOpenChange(false), 1500)
      } else {
        const errorMessage = data?.message
        setError(errorMessage)
        onFailure(errorMessage)
      }
    } catch {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      onFailure(errorMessage)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = (): void => {
    setSuccess(null)
    setError(null)
    setParsedCert(null)
    setPrivateKey('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
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
            <Label>Certificate (.pem) *</Label>
            <Input type="file" accept=".pem,.crt" onChange={handlePemUpload} />
          </div>

          {parsedCert && (
            <Card className="bg-muted p-4 text-sm">
              <p>
                <b>Common Name:</b> {parsedCert.commonName || '—'}
              </p>
              <p>
                <b>Key Type:</b> {parsedCert.keyType}
              </p>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Private Key *</Label>
            <Input
              type="text"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter private key"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !parsedCert || !privateKey}
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
