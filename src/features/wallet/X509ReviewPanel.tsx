'use client'

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import {
  ChainReview,
  InspectedCertificate,
  KeyReview,
  ReviewFinding,
} from '@/lib/x509Inspect'
import { CopyValue, Detail, StatusPill } from './DetailParts'
import React from 'react'

const ROLE_LABELS = {
  leaf: 'Leaf certificate',
  intermediate: 'Intermediate CA',
  root: 'Root CA',
} as const

const formatDate = (date: Date): string =>
  date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const FindingRow = ({
  finding,
}: {
  finding: ReviewFinding
}): React.JSX.Element => {
  let icon = <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" />
  if (finding.level === 'error') {
    icon = <XCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
  } else if (finding.level === 'warning') {
    icon = <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
  }
  return (
    <li className="flex items-start gap-2 text-sm">
      {icon}
      <span>{finding.message}</span>
    </li>
  )
}

const CertificateCard = ({
  certificate,
  position,
}: {
  certificate: InspectedCertificate
  position: number
}): React.JSX.Element => {
  let validity = <StatusPill tone="good">Valid</StatusPill>
  if (!certificate.validNow) {
    validity = (
      <StatusPill tone="bad">
        {new Date() < certificate.notBefore ? 'Not valid yet' : 'Expired'}
      </StatusPill>
    )
  }

  return (
    <div className="border-border space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">
          {position}. {ROLE_LABELS[certificate.role]}
        </h4>
        <div className="flex gap-2">
          {certificate.isCa && <StatusPill tone="neutral">CA</StatusPill>}
          {validity}
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Detail label="Subject" wide>
          <span className="break-all">{certificate.subject}</span>
        </Detail>
        <Detail label="Issuer" wide>
          <span className="break-all">{certificate.issuer}</span>
        </Detail>
        <Detail label="Valid from">{formatDate(certificate.notBefore)}</Detail>
        <Detail label="Valid until">{formatDate(certificate.notAfter)}</Detail>
        <Detail label="Public key">{certificate.keyAlgorithm}</Detail>
        <Detail label="Signature">{certificate.signatureAlgorithm}</Detail>
        <Detail label="Serial number">
          <span className="font-mono break-all">
            {certificate.serialNumber}
          </span>
        </Detail>
        {certificate.isCa && certificate.pathLength !== undefined && (
          <Detail label="Path length">{certificate.pathLength}</Detail>
        )}
        {certificate.subjectAltNames.length > 0 && (
          <Detail label="Alternative names" wide>
            <span className="break-all">
              {certificate.subjectAltNames.join(', ')}
            </span>
          </Detail>
        )}
        <Detail label="SHA-256 fingerprint" wide>
          <CopyValue value={certificate.fingerprint} />
        </Detail>
      </dl>
    </div>
  )
}

interface X509ReviewPanelProps {
  chain: ChainReview
  keyReview: KeyReview
}

/** What was uploaded: every certificate of the chain with its details, how the chain checks out and what the key is. */
export default function X509ReviewPanel({
  chain,
  keyReview,
}: X509ReviewPanelProps): React.JSX.Element {
  const keyFinding: ReviewFinding = {
    level: ((): ReviewFinding['level'] => {
      if (keyReview.match === 'match') {
        return 'ok'
      }
      return keyReview.match === 'mismatch' ? 'error' : 'warning'
    })(),
    message: keyReview.detail,
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {[...chain.findings, keyFinding].map((finding) => (
          <FindingRow
            key={`${finding.level}-${finding.message}`}
            finding={finding}
          />
        ))}
      </ul>

      {chain.expectedDid && (
        <div className="border-border bg-secondary space-y-1 rounded-md border p-3 text-sm">
          <p className="text-muted-foreground">The DID that will be created</p>
          <CopyValue value={chain.expectedDid} />
        </div>
      )}

      <div className="space-y-3">
        {chain.certificates.map((certificate, index) => (
          <CertificateCard
            key={certificate.fingerprint}
            certificate={certificate}
            position={index + 1}
          />
        ))}
      </div>

      <div className="border-border space-y-1 rounded-md border p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-semibold">Private key</h4>
          {keyReview.match === 'match' && (
            <StatusPill tone="good">Matches the leaf</StatusPill>
          )}
          {keyReview.match === 'mismatch' && (
            <StatusPill tone="bad">Does not match</StatusPill>
          )}
          {keyReview.match === 'unverifiable' && (
            <StatusPill tone="warn">Checked on import</StatusPill>
          )}
        </div>
        <p className="text-muted-foreground">{keyReview.description}</p>
        <p className="text-muted-foreground">
          The key stays in your browser. It is encrypted before it is sent.
        </p>
      </div>
    </div>
  )
}
