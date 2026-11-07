'use client'

import { CertificateDetails, getCertificateDetailsFromBase64 } from '@/lib/x509'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { JSX, useMemo } from 'react'

interface CertificateDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate: {
    commonName?: string
    certificateBase64?: string
    keyType?: string
    status?: string
  } | null
}

const formatDate = (value?: string): string => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const DetailRow = ({
  label,
  value,
  mono = false,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
}): JSX.Element => (
  <div className="grid grid-cols-3 gap-2 py-1.5">
    <span className="text-muted-foreground col-span-1 text-xs font-medium uppercase">
      {label}
    </span>
    <span
      className={`col-span-2 text-sm break-words ${
        mono ? 'font-mono text-xs' : ''
      }`}
    >
      {value === undefined || value === null || value === '' ? '—' : value}
    </span>
  </div>
)

const DetailList = ({
  label,
  values,
}: {
  label: string
  values: string[]
}): JSX.Element => (
  <div className="grid grid-cols-3 gap-2 py-1.5">
    <span className="text-muted-foreground col-span-1 text-xs font-medium uppercase">
      {label}
    </span>
    <span className="col-span-2 text-sm">
      {values.length === 0 ? (
        '—'
      ) : (
        <span className="flex flex-wrap gap-1">
          {values.map((value) => (
            <span
              key={value}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs"
            >
              {value}
            </span>
          ))}
        </span>
      )}
    </span>
  </div>
)

const SectionTitle = ({ children }: { children: string }): JSX.Element => (
  <h4 className="text-muted-foreground mt-4 mb-1 text-sm font-semibold tracking-wide uppercase">
    {children}
  </h4>
)

const CertificateDetailsContent = ({
  certificate,
  details,
}: {
  certificate: CertificateDetailsDialogProps['certificate']
  details?: CertificateDetails
}): JSX.Element => {
  if (!details) {
    return (
      <p className="text-muted-foreground py-6 text-sm">
        Unable to parse this certificate. The stored certificate may be
        malformed or incomplete.
      </p>
    )
  }

  const keyAlgorithm = details.keySize
    ? `${details.publicKeyAlgorithm} (${details.keySize} bit)`
    : details.publicKeyAlgorithm

  return (
    <div className="divide-border divide-y">
      <div>
        <SectionTitle>Certificate</SectionTitle>
        <DetailRow
          label="Common Name"
          value={details.commonName || certificate?.commonName}
        />
        <DetailRow label="Subject" value={details.subject} mono />
        <DetailRow label="Issuer" value={details.issuer} mono />
        <DetailRow label="Serial Number" value={details.serialNumber} mono />
        <DetailRow label="Valid From" value={formatDate(details.notBefore)} />
        <DetailRow label="Valid To" value={formatDate(details.notAfter)} />
        {certificate?.status && (
          <DetailRow label="Status" value={certificate.status} />
        )}
      </div>

      <div>
        <SectionTitle>Algorithms</SectionTitle>
        <DetailRow label="Public Key" value={keyAlgorithm} />
        <DetailRow label="Named Curve" value={details.namedCurve} />
        <DetailRow label="Signature" value={details.signatureAlgorithm} />
        {certificate?.keyType && (
          <DetailRow label="CREDEBL Key Type" value={certificate.keyType} />
        )}
      </div>

      <div>
        <SectionTitle>Extensions</SectionTitle>
        <DetailList
          label="Subject Alt Names"
          values={details.subjectAlternativeNames}
        />
        <DetailList
          label="Issuer Alt Names"
          values={details.issuerAlternativeNames}
        />
        <DetailList label="Key Usage" values={details.keyUsage} />
        <DetailList
          label="Extended Key Usage"
          values={details.extendedKeyUsage}
        />
        <DetailRow label="Is CA" value={details.isCA ? 'Yes' : 'No'} />
        {details.pathLength !== undefined && (
          <DetailRow label="Path Length" value={details.pathLength} />
        )}
        <DetailRow
          label="Subject Key ID"
          value={details.subjectKeyIdentifier}
          mono
        />
        <DetailRow
          label="Authority Key ID"
          value={details.authorityKeyIdentifier}
          mono
        />
      </div>
    </div>
  )
}

const CertificateDetailsDialog = ({
  open,
  onOpenChange,
  certificate,
}: CertificateDetailsDialogProps): JSX.Element => {
  const details = useMemo(
    () => getCertificateDetailsFromBase64(certificate?.certificateBase64 ?? ''),
    [certificate?.certificateBase64],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {certificate?.commonName || 'Certificate Details'}
          </DialogTitle>
          <DialogDescription>
            Full X.509 certificate metadata, including algorithm and extensions.
          </DialogDescription>
        </DialogHeader>

        <CertificateDetailsContent
          certificate={certificate}
          details={details}
        />
      </DialogContent>
    </Dialog>
  )
}

export default CertificateDetailsDialog
