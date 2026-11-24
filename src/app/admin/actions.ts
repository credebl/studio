'use server'

import {
  CloudBaseWalletConflictError,
  configureCloudBaseWallet,
  getPlatformAdminSession,
  inviteEcosystemOwner,
  updateEcosystemStatus,
} from '@/lib/server/admin'
import type { AdminActionResult } from '@/features/admin/types'
import { revalidatePath } from 'next/cache'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MAX_ENDPOINT_LENGTH = 2048
const MAX_KEY_LENGTH = 4096

const isValidAgentEndpoint = (value: string): boolean => {
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      Boolean(url.hostname) &&
      (url.pathname === '' || url.pathname === '/')
    )
  } catch {
    return false
  }
}

const forbidden = (): AdminActionResult => ({
  status: 'error',
  message: 'You are not allowed to perform this action.',
})

/**
 * Server actions are independently invocable, so each one re-checks the
 * platform-admin role. The layout guard alone is not sufficient.
 */
export async function inviteEcosystemOwnerAction(
  _previousState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (!(await getPlatformAdminSession())) {
    return forbidden()
  }

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return { status: 'error', message: 'Enter a valid email address.' }
  }

  try {
    await inviteEcosystemOwner(email)
    revalidatePath('/admin/invitations')
    return { status: 'success', message: `Invitation sent to ${email}.` }
  } catch {
    return {
      status: 'error',
      message: 'Could not send the invitation. Please try again.',
    }
  }
}

/**
 * Configures the one shared agent endpoint and its credentials. Every value is
 * re-read and validated here because server actions can be invoked directly,
 * bypassing the form and its layout guard.
 */
export async function configureCloudBaseWalletAction(
  _previousState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (!(await getPlatformAdminSession())) {
    return forbidden()
  }

  const agentEndpoint = String(formData.get('agentEndpoint') ?? '').trim()
  const apiKey = String(formData.get('apiKey') ?? '').trim()
  const walletKey = String(formData.get('walletKey') ?? '').trim()
  const confirmed = formData.get('confirm') === 'on'

  if (!confirmed) {
    return {
      status: 'error',
      message: 'Confirm the endpoint and keys before continuing.',
    }
  }

  if (
    !agentEndpoint ||
    agentEndpoint.length > MAX_ENDPOINT_LENGTH ||
    !isValidAgentEndpoint(agentEndpoint)
  ) {
    return {
      status: 'error',
      message:
        'Enter a valid agent endpoint, for example https://agent.example.com:4001.',
    }
  }

  if (
    !apiKey ||
    !walletKey ||
    apiKey.length > MAX_KEY_LENGTH ||
    walletKey.length > MAX_KEY_LENGTH
  ) {
    return {
      status: 'error',
      message: 'Enter both the agent API key and the wallet key.',
    }
  }

  try {
    await configureCloudBaseWallet({ agentEndpoint, apiKey, walletKey })
    revalidatePath('/admin/cloud-wallet')
    return {
      status: 'success',
      message:
        'Cloud base wallet configured. Holders can now create their wallets.',
    }
  } catch (error) {
    if (error instanceof CloudBaseWalletConflictError) {
      return {
        status: 'error',
        message: 'A cloud base wallet is already configured for this platform.',
      }
    }

    return {
      status: 'error',
      message: 'Could not configure the cloud base wallet. Please try again.',
    }
  }
}

export async function setEcosystemEnabledAction(
  enabled: boolean,
): Promise<AdminActionResult> {
  if (!(await getPlatformAdminSession())) {
    return forbidden()
  }

  if (typeof enabled !== 'boolean') {
    return { status: 'error', message: 'Invalid value.' }
  }

  try {
    await updateEcosystemStatus(enabled)
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    return {
      status: 'success',
      message: enabled
        ? 'Ecosystem feature enabled.'
        : 'Ecosystem feature disabled.',
    }
  } catch {
    return {
      status: 'error',
      message: 'Could not update the ecosystem setting.',
    }
  }
}
