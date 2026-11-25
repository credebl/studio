import type {
  HolderConnection,
  HolderCredential,
  HolderCredentialFormat,
  HolderProof,
} from '@/features/holder/types'
import {
  getHolderConnections,
  getHolderProofs,
  listHolderCredentials,
} from './holder'
import {
  normalizeHolderConnections,
  normalizeHolderCredentials,
  normalizeHolderProofs,
} from '@/features/holder/normalize'

export interface HolderOverviewData {
  credentials: Record<HolderCredentialFormat, HolderCredential[]>
  credentialAvailability: Record<HolderCredentialFormat, boolean>
  proofs: HolderProof[]
  proofsAvailable: boolean
  connections: HolderConnection[]
  connectionsAvailable: boolean
}

const settledValue = <T>(result: PromiseSettledResult<T>, fallback: T): T => {
  if (result.status === 'fulfilled') {
    return result.value
  }
  return fallback
}

/**
 * Load every Overview data source in parallel. A failure in one endpoint only
 * marks that source unavailable; the rest of the wallet metrics still render.
 */
export const getHolderOverviewData = async (): Promise<HolderOverviewData> => {
  const [sdJwt, mdoc, w3c, proofs, connections] = await Promise.allSettled([
    listHolderCredentials('sd-jwt-vc'),
    listHolderCredentials('mso_mdoc'),
    listHolderCredentials('w3c-vc'),
    getHolderProofs(),
    getHolderConnections(),
  ])

  return {
    credentials: {
      'sd-jwt-vc': normalizeHolderCredentials(
        settledValue(sdJwt, []),
        'sd-jwt-vc',
      ),
      // eslint-disable-next-line camelcase
      mso_mdoc: normalizeHolderCredentials(settledValue(mdoc, []), 'mso_mdoc'),
      'w3c-vc': normalizeHolderCredentials(settledValue(w3c, []), 'w3c-vc'),
    },
    credentialAvailability: {
      'sd-jwt-vc': sdJwt.status === 'fulfilled',
      // eslint-disable-next-line camelcase
      mso_mdoc: mdoc.status === 'fulfilled',
      'w3c-vc': w3c.status === 'fulfilled',
    },
    proofs: normalizeHolderProofs(settledValue(proofs, [])),
    proofsAvailable: proofs.status === 'fulfilled',
    connections: normalizeHolderConnections(settledValue(connections, [])),
    connectionsAvailable: connections.status === 'fulfilled',
  }
}
