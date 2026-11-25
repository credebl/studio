export type KmsBackend = 'askar' | 'node' | 'openbao' | 'mixed'

const KMS_BACKEND_LABELS: Record<KmsBackend, string> = {
  askar: 'Askar',
  node: 'Node',
  openbao: 'OpenBao',
  mixed: 'Mixed',
}

/** Readable label for a KMS backend; '—' when it is not known (yet). */
export function kmsBackendLabel(backend?: string | null): string {
  if (!backend) {
    return '—'
  }
  const key = backend.toLowerCase()
  return Object.hasOwn(KMS_BACKEND_LABELS, key)
    ? KMS_BACKEND_LABELS[key as KmsBackend]
    : backend
}
