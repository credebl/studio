import type {
  HolderConnection,
  HolderCredential,
  HolderCredentialFormat,
  HolderDid,
  HolderProof,
} from './types'
import { credentialFacts, formatCredentialDate } from './credential-details'
import { firstString } from './credential-fields'

const FORMAT_LABELS: Record<HolderCredentialFormat, string> = {
  'sd-jwt-vc': 'SD-JWT',
  // The wire format name is fixed by the released API.
  // eslint-disable-next-line camelcase
  mso_mdoc: 'mDoc',
  'w3c-vc': 'W3C VC',
}

const FORMAT_ORDER: HolderCredentialFormat[] = [
  'sd-jwt-vc',
  // eslint-disable-next-line camelcase
  'mso_mdoc',
  'w3c-vc',
]

const EXPIRY_WARNING_MS = 30 * 24 * 60 * 60 * 1000
const PROOF_PENDING = /request|received|pending|invited|offer|created/i
const PROOF_TERMINAL = /done|complete|abandon|declin|reject|fail|error|expired/i
const CONNECTION_STATE = {
  connected: /connect|active|complete|ready/i,
  invited: /invit/i,
  requested: /request/i,
}

export interface OverviewCount {
  label: string
  count: number
}

export interface OverviewActivity {
  id: string
  label: string
  detail: string
  at: string
  href: string
}

export interface HolderOverviewSources {
  dids: HolderDid[]
  credentials: Record<HolderCredentialFormat, HolderCredential[]>
  credentialAvailability: Record<HolderCredentialFormat, boolean>
  proofs: HolderProof[]
  proofsAvailable: boolean
  connections: HolderConnection[]
  connectionsAvailable: boolean
}

export interface HolderOverviewMetrics {
  credentials: {
    total: number
    byFormat: (OverviewCount & { format: HolderCredentialFormat })[]
    partial: boolean
  }
  proofs: { pending: number; total: number }
  connections: {
    total: number
    connected: number
    invited: number
    requested: number
    other: number
  }
  dids: {
    total: number
    byMethod: OverviewCount[]
    keyTypes: OverviewCount[]
    primaryDid?: string
  }
  health: {
    total: number
    distinctIssuers: number
    expiring: number
    expired: number
    noExpiry: number
  }
  binding: {
    detected: number
    freshKey: number
    storedDid: number
    sharedCredentials: number
    primaryReuse: number
    undetected: number
  }
  activity: OverviewActivity[]
  unavailable: string[]
}

const parsedDate = (value?: string): number | undefined => {
  if (!value) {
    return undefined
  }
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

const countByLabel = (values: (string | undefined)[]): OverviewCount[] => {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (!value) {
      continue
    }
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

const isPendingProof = (state?: string): boolean =>
  Boolean(state && PROOF_PENDING.test(state) && !PROOF_TERMINAL.test(state))

const connectionState = (
  state?: string,
): keyof typeof CONNECTION_STATE | 'other' => {
  if (!state) {
    return 'other'
  }
  for (const [key, pattern] of Object.entries(CONNECTION_STATE)) {
    if (pattern.test(state)) {
      return key as keyof typeof CONNECTION_STATE
    }
  }
  return 'other'
}

/** Derive wallet-wide counts from the same records shown on the detail pages. */
export const buildHolderOverviewMetrics = (
  sources: HolderOverviewSources,
  now: Date = new Date(),
): HolderOverviewMetrics => {
  const allCredentials = FORMAT_ORDER.flatMap(
    (format) => sources.credentials[format],
  )
  const facts = allCredentials.map((credential) => ({
    credential,
    ...credentialFacts(credential),
  }))
  const allBindings = facts
    .map((fact) => fact.bindingKid)
    .filter((kid): kid is string => Boolean(kid))
  const bindingCounts = new Map<string, number>()
  for (const kid of allBindings) {
    bindingCounts.set(kid, (bindingCounts.get(kid) ?? 0) + 1)
  }

  const nowMs = now.getTime()
  const primaryDidUrl = sources.dids.find((did) => did.isPrimary)?.did?.trim()
  const primaryDid = primaryDidUrl?.split('#')[0]
  const unavailable: string[] = []
  for (const format of FORMAT_ORDER) {
    if (!sources.credentialAvailability[format]) {
      unavailable.push(`${FORMAT_LABELS[format]} credentials`)
    }
  }
  if (!sources.proofsAvailable) {
    unavailable.push('Proof requests')
  }
  if (!sources.connectionsAvailable) {
    unavailable.push('Connections')
  }

  const activity: (OverviewActivity & { timestamp: number })[] = []
  const addActivity = (
    id: string,
    label: string,
    detail: string,
    value: string | undefined,
    href: string,
  ): void => {
    const timestamp = parsedDate(value)
    if (timestamp === undefined) {
      return
    }
    activity.push({
      id,
      label,
      detail: detail || 'Not reported',
      at: formatCredentialDate(value),
      href,
      timestamp,
    })
  }

  for (const fact of facts) {
    addActivity(
      `credential-${fact.credential.id}`,
      'Credential stored',
      fact.type ?? fact.credential.title,
      fact.storedAt ?? fact.updatedAt,
      '/holder/credentials',
    )
  }
  for (const did of sources.dids) {
    addActivity(
      `did-${did.id ?? did.did}`,
      did.createdAt ? 'DID created' : 'DID updated',
      did.method ? `did:${did.method}` : 'Identifier',
      did.createdAt ?? did.updatedAt,
      '/holder/dids',
    )
  }
  for (const proof of sources.proofs) {
    addActivity(
      `proof-${proof.id}`,
      'Proof request',
      proof.state ?? 'State not reported',
      firstString(proof.raw, ['createdAt', 'updatedAt', 'created', 'updated']),
      '/holder/proofs',
    )
  }
  for (const connection of sources.connections) {
    addActivity(
      `connection-${connection.id}`,
      'Connection',
      connection.label ?? connection.state ?? 'Connection',
      firstString(connection.raw, [
        'createdAt',
        'updatedAt',
        'created',
        'updated',
      ]),
      '/holder/connections',
    )
  }

  return {
    credentials: {
      total: facts.length,
      byFormat: FORMAT_ORDER.map((format) => ({
        format,
        label: FORMAT_LABELS[format],
        count: sources.credentials[format].length,
      })),
      partial: FORMAT_ORDER.some(
        (format) => !sources.credentialAvailability[format],
      ),
    },
    proofs: {
      pending: sources.proofs.filter((proof) => isPendingProof(proof.state))
        .length,
      total: sources.proofs.length,
    },
    connections: {
      total: sources.connections.length,
      connected: sources.connections.filter(
        (connection) => connectionState(connection.state) === 'connected',
      ).length,
      invited: sources.connections.filter(
        (connection) => connectionState(connection.state) === 'invited',
      ).length,
      requested: sources.connections.filter(
        (connection) => connectionState(connection.state) === 'requested',
      ).length,
      other: sources.connections.filter(
        (connection) => connectionState(connection.state) === 'other',
      ).length,
    },
    dids: {
      total: sources.dids.length,
      byMethod: countByLabel(sources.dids.map((did) => did.method)),
      keyTypes: countByLabel(sources.dids.map((did) => did.keyType)),
      primaryDid,
    },
    health: {
      total: facts.length,
      distinctIssuers: new Set(
        facts
          .map((fact) => fact.issuer)
          .filter((issuer): issuer is string => Boolean(issuer)),
      ).size,
      expiring: facts.filter((fact) => {
        const expires = parsedDate(fact.expiresAt)
        return (
          expires !== undefined &&
          expires >= nowMs &&
          expires <= nowMs + EXPIRY_WARNING_MS
        )
      }).length,
      expired: facts.filter((fact) => {
        const expires = parsedDate(fact.expiresAt)
        return expires !== undefined && expires < nowMs
      }).length,
      noExpiry: facts.filter((fact) => !fact.expiresAt).length,
    },
    binding: {
      detected: allBindings.length,
      freshKey: allBindings.filter((kid) => /^did:jwk:/i.test(kid)).length,
      storedDid: allBindings.filter((kid) => /^did:(?!jwk:)/i.test(kid)).length,
      sharedCredentials: Array.from(bindingCounts.values())
        .filter((count) => count > 1)
        .reduce((total, count) => total + count, 0),
      primaryReuse: primaryDid
        ? allBindings.filter((kid) => kid.split('#')[0] === primaryDid).length
        : 0,
      undetected: facts.length - allBindings.length,
    },
    activity: activity
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ timestamp: _timestamp, ...item }) => item),
    unavailable,
  }
}
