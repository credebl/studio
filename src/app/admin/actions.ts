'use server'

import type {
  AdminActionResult,
  AgentTokenActionResult,
  CloudBaseWalletActionResult,
} from '@/features/admin/types'
import {
  AgentTokenFetchError,
  CloudBaseWalletConflictError,
  configureCloudBaseWallet,
  fetchAgentAuthToken,
  getPlatformAdminSession,
  inviteEcosystemOwner,
  rememberCloudBaseWalletConfigured,
  updateEcosystemStatus,
} from '@/lib/server/admin'
import {
  MAX_AGENT_ENDPOINT_LENGTH,
  isValidAgentEndpoint,
} from '@/lib/agent-endpoints'
import { revalidatePath } from 'next/cache'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MAX_KEY_LENGTH = 4096

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
 * Verifies the shared agent is reachable and mints the base-agent JWT used by
 * the platform. This is a separate action so the raw agent authorization key
 * never becomes part of the base-wallet configuration request.
 */
export async function fetchAgentAuthTokenAction(
  _previousState: AgentTokenActionResult | null,
  formData: FormData,
): Promise<AgentTokenActionResult> {
  if (!(await getPlatformAdminSession())) {
    return forbidden()
  }

  const configuredEndpoint = String(formData.get('agentEndpoint') ?? '').trim()
  const tokenEndpoint =
    String(formData.get('tokenEndpoint') ?? '').trim() || configuredEndpoint
  const authorizationKey = String(formData.get('agentAuthKey') ?? '').trim()

  if (
    !tokenEndpoint ||
    tokenEndpoint.length > MAX_AGENT_ENDPOINT_LENGTH ||
    !isValidAgentEndpoint(tokenEndpoint)
  ) {
    return {
      status: 'error',
      message:
        'Enter a valid token fetch URL or agent endpoint, for example http://localhost:4001.',
    }
  }

  if (!authorizationKey || authorizationKey.length > MAX_KEY_LENGTH) {
    return {
      status: 'error',
      message: 'Enter the agent authorization key used to fetch the token.',
    }
  }

  try {
    const token = await fetchAgentAuthToken(tokenEndpoint, authorizationKey)
    return {
      status: 'success',
      message: 'Agent reachable. Runtime API key added to the form.',
      token,
    }
  } catch (error) {
    return {
      status: 'error',
      message:
        error instanceof AgentTokenFetchError
          ? error.message
          : 'Unable to reach the agent or fetch its token.',
    }
  }
}

/**
 * Configures the one shared agent endpoint and its credentials. Every value is
 * re-read and validated here because server actions can be invoked directly,
 * bypassing the form and its layout guard.
 */
export async function configureCloudBaseWalletAction(
  _previousState: CloudBaseWalletActionResult | null,
  formData: FormData,
): Promise<CloudBaseWalletActionResult> {
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
    agentEndpoint.length > MAX_AGENT_ENDPOINT_LENGTH ||
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
    const details = await configureCloudBaseWallet({
      agentEndpoint,
      apiKey,
      walletKey,
    })
    const status = await rememberCloudBaseWalletConfigured({
      agentEndpoint: details?.agentEndpoint ?? agentEndpoint,
    })
    revalidatePath('/admin/cloud-wallet')
    return {
      status: 'success',
      message:
        'Cloud base wallet configured. Holders can now create their wallets.',
      configured: status.configured,
      agentEndpoint: status.agentEndpoint,
      configuredAt: status.configuredAt,
    }
  } catch (error) {
    if (error instanceof CloudBaseWalletConflictError) {
      const status = await rememberCloudBaseWalletConfigured()
      revalidatePath('/admin/cloud-wallet')
      return {
        status: 'error',
        message: 'A cloud base wallet is already configured for this platform.',
        configured: status.configured,
        agentEndpoint: status.agentEndpoint,
        configuredAt: status.configuredAt,
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
