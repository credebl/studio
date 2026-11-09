import React from 'react'
import { StatusPill } from './DetailParts'
import { kmsBackendLabel } from '@/lib/kms'

/** Shows which key store holds a DID's keys; muted dash while unknown. */
const KmsBackendBadge = ({
  backend,
}: {
  backend?: string | null
}): React.JSX.Element => (
  <StatusPill tone="neutral">
    <span className={backend ? undefined : 'opacity-70'}>
      {kmsBackendLabel(backend)}
    </span>
  </StatusPill>
)

export default KmsBackendBadge
