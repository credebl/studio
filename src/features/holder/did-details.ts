import type { HolderDid } from './types'

export const formatDidDate = (value?: string): string => {
  if (!value) {
    return 'Not reported'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const iso = date.toISOString()
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`
}

export const didRelationshipSummary = (did: HolderDid): string => {
  const parts = [
    did.authenticationCount
      ? `${did.authenticationCount} authentication`
      : undefined,
    did.assertionMethodCount
      ? `${did.assertionMethodCount} assertion`
      : undefined,
    did.keyAgreementCount ? `${did.keyAgreementCount} agreement` : undefined,
  ].filter((part): part is string => Boolean(part))

  return parts.length ? parts.join(' · ') : 'Not reported'
}
